const TemplateType = require('../models/templateType');
const Template = require('../models/template');
const ParameterType = require('../models/parameterType');
const Master = require('../models/masterModel');
const MasterField = require('../models/masterField');
const { logApiResponse } = require('../utils/responseService');

// Create a new TemplateType
const createTemplateType = async (req, res) => {
    try {
        const { parameter_type_ids, template_type_code, template_type_name, order, status, deleted_at } = req.body;

        // Validate parameter_type_ids
        const parameterTypes = await ParameterType.find({
            '_id': { $in: parameter_type_ids }
        });

        if (parameterTypes.length !== parameter_type_ids.length) {
            await logApiResponse(req, 'One or more parameter_type_ids are invalid', 400, { parameter_type_ids });
            return res.status(400).json({ message: 'One or more parameter_type_ids are invalid' });
        }

        // Check if the template type code already exists
        const existingTemplateType = await TemplateType.findOne({ template_type_code });
        if (existingTemplateType) {
            await logApiResponse(req, 'Template type code already exists', 400, { template_type_code });
            return res.status(400).json({ message: 'Template type code already exists' });
        }

        // Create a new TemplateType instance
        const newTemplateType = new TemplateType({
            parameter_type_id: parameter_type_ids, // now an array of IDs
            template_type_code,
            order,
            template_type_name,
            status: status !== undefined ? status : true,
            deleted_at: deleted_at || null
        });

        // Save the new TemplateType to the database
        const savedTemplateType = await newTemplateType.save();

        await logApiResponse(req, 'Template type created successfully', 201, savedTemplateType);
        res.status(201).json(savedTemplateType);
    } catch (error) {
        await logApiResponse(req, 'Server error', 500, { error });
        res.status(500).json({ message: 'Server error', error });
    }
};


const updateTemplateType = async (req, res) => {
    try {
        const { id } = req.params;
        const { parameter_type_ids, template_type_code, template_type_name, order, status, deleted_at } = req.body;

        // Validate parameter_type_ids
        const parameterTypes = await ParameterType.find({
            '_id': { $in: parameter_type_ids }
        });

        if (parameterTypes.length !== parameter_type_ids.length) {
            await logApiResponse(req, 'One or more parameter_type_ids are invalid', 400, { parameter_type_ids });
            return res.status(400).json({ message: 'One or more parameter_type_ids are invalid' });
        }

        // Check if the template type code already exists
        const existingTemplateType = await TemplateType.findOne({ template_type_code });
        if (existingTemplateType && existingTemplateType._id.toString() !== id) {
            await logApiResponse(req, 'Template type code already exists', 400, { template_type_code });
            return res.status(400).json({ message: 'Template type code already exists' });
        }

        // Update the TemplateType instance
        const updatedTemplateType = await TemplateType.findByIdAndUpdate(
            id,
            {
                parameter_type_id: parameter_type_ids, // now an array of IDs
                template_type_code,
                template_type_name,
                order,
                status: status !== undefined ? status : true,
                deleted_at: deleted_at || null,
                updated_at: new Date() // Manually set updated_at
            },
            { new: true }
        );

        if (!updatedTemplateType) {
            await logApiResponse(req, 'TemplateType not found', 404, { id });
            return res.status(404).json({ message: 'TemplateType not found' });
        }

        await logApiResponse(req, 'Template type updated successfully', 200, updatedTemplateType);
        res.status(200).json(updatedTemplateType);
    } catch (error) {
        await logApiResponse(req, 'Server error', 500, { error });
        res.status(500).json({ message: 'Server error', error });
    }
};


const getTemplateTypes = async (req, res) => {
    try {
        // Get all template types with status true and sort them by the 'order' field
        const templateTypes = await TemplateType.find({ status: true }).sort({ order: 1 });

        await logApiResponse(req, 'Template types retrieved successfully', 200, templateTypes);
        res.status(200).json(templateTypes);
    } catch (error) {
        await logApiResponse(req, 'Server error', 500, { error });
        res.status(500).json({ message: 'Server error', error });
    }
};


const getTemplateType = async (req, res) => {
    try {
        const { id } = req.params;

        const templateType = await TemplateType.findById(id);
        if (!templateType) {
            await logApiResponse(req, 'TemplateType not found', 404, {});
            return res.status(404).json({ message: 'TemplateType not found' });
        }

        await logApiResponse(req, 'TemplateType retrieved successfully', 200, templateType);
        res.status(200).json(templateType);
    } catch (error) {
        await logApiResponse(req, 'Server error', 500, { error });
        res.status(500).json({ message: 'Server error', error });
    }
};


const deleteTemplateType = async (req, res) => {
    try {
        const { id } = req.params;

        const templateType = await TemplateType.findById(id);
        if (!templateType) {
            await logApiResponse(req, 'TemplateType not found', 404, {});
            return res.status(404).json({ message: 'TemplateType not found' });
        }

        if (templateType.deleted_at) {
            // Restore the TemplateType
            templateType.deleted_at = null;
            templateType.status = true;
        } else {
            // Soft delete the TemplateType
            templateType.deleted_at = new Date();
            templateType.status = false;
        }

        templateType.updated_at = new Date();

        const updatedTemplateType = await templateType.save();

        await logApiResponse(req, 'TemplateType updated successfully', 200, updatedTemplateType);
        res.status(200).json(updatedTemplateType);
    } catch (error) {
        await logApiResponse(req, 'Server error', 500, { error });
        res.status(500).json({ message: 'Server error', error });
    }
};


const paginatedTemplateTypes = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', search = '', status } = req.query;

    // Building the sort object dynamically based on the query parameters
    const sort = {
        [sortBy]: order === 'desc' ? -1 : 1
    };

    // Implementing search functionality
    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { template_type_name: new RegExp(search, 'i') },
                    { template_type_code: new RegExp(search, 'i') }
                ]
            } : {},
            status ? { status: status === 'active' } : {}
        ]
    };

    try {
        const templateTypes = await TemplateType.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await TemplateType.countDocuments(searchQuery);

        const response = {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            templateTypes,
            totalItems: count,
        };

        await logApiResponse(req, 'Template types retrieved successfully', 200, response);
        res.json(response);
    } catch (error) {
        await logApiResponse(req, 'Error retrieving paginated template types', 500, { error: error.message });
        res.status(500).json({ error: error.message });
    }
};


const getTemplateTypeMaster = async (req, res) => {
    try {
        const { template_type_id } = req.params;

        // Find the TemplateType by ID
        const templateType = await TemplateType.findById(template_type_id);
        if (!templateType) {
            await logApiResponse(req, 'TemplateType not found', 404, { message: 'TemplateType not found' });
            return res.status(404).json({ message: 'TemplateType not found' });
        }

        // Fetch detailed information for each parameter_type_id, including names
        const parameter_types = await Promise.all(templateType.parameter_type_id.map(async paramId => {
            // Retrieve the parameter type details
            const parameterType = await ParameterType.findById(paramId);
            if (!parameterType) {
                await logApiResponse(req, `ParameterType with ID ${paramId} not found`, 404, { message: `ParameterType with ID ${paramId} not found` });
                return res.status(404).json({ message: `ParameterType with ID ${paramId} not found` });
            }

            const masters = await Master.find({ parameter_type_id: paramId, status: true });
            const orderedMasters = masters.sort((a, b) => a.order - b.order);  // Sorting masters by their order
            const mastersWithFields = await Promise.all(orderedMasters.map(async master => {
                const masterFields = await MasterField.find({ master_id: master._id });
                return {
                    ...master.toObject(),
                    masterFields
                };
            }));

            return {
                parameterTypeId: paramId,
                parameterTypeName: parameterType.parameter_type_name,  // Assuming 'name' is the field for the parameter type's name
                masters: mastersWithFields
            };
        }));

        const response = {
            templateType,
            parameter_types
        };

        await logApiResponse(req, 'TemplateType master data retrieved successfully', 200, response);
        res.status(200).json(response);
    } catch (error) {
        await logApiResponse(req, 'Server error', 500, { message: 'Server error', error });
        res.status(500).json({ message: 'Server error', error });
    }
};


module.exports = {
    createTemplateType,
    updateTemplateType,
    getTemplateTypes,
    getTemplateType,
    deleteTemplateType,
    paginatedTemplateTypes,
    getTemplateTypeMaster
}