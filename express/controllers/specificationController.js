const mongoose = require('mongoose');
const { logApiResponse } = require('../utils/responseService');
const specification = require('../models/specification');

const createSpecification = async (req, res) => {
    const { asset_id, template_id, field_name, field_type, field_value, display_name, master_id, parameter_type_id, required } = req.body;

    let validationErrors = {};

    // Validate asset_id
    if (!asset_id || !mongoose.Types.ObjectId.isValid(asset_id)) {
        validationErrors.asset_id = "Asset ID is required and must be a valid ObjectId";
    }

    // Validate template_id
    if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
        validationErrors.template_id = "Template ID is required and must be a valid ObjectId";
    }
    // // Validate master_id
    // if (!master_id || !mongoose.Types.ObjectId.isValid(master_id)) {
    //     validationErrors.master_id = "Master ID is required and must be a valid ObjectId";
    // }

    // // Validate parameter_type_id
    // if (!parameter_type_id || !mongoose.Types.ObjectId.isValid(parameter_type_id)) {
    //     validationErrors.parameter_type_id = "Paramenter Type ID is required and must be a valid ObjectId";
    // }

    // Validate field_name
    if (!field_name) {
        validationErrors.field_name = "Field name is required";
    }

    // Validate field_type
    if (!field_type) {
        validationErrors.field_type = "Field type is required";
    }

    // Validate field_value based on field_type
    if (field_type === 'select' && (field_value === undefined || field_value === '')) {
        validationErrors.field_value = "Field value is required for 'select' type";
    }

    // Validate display_name
    if (!display_name) {
        validationErrors.display_name = "Display name is required";
    }

    // Validate 'required' field
    if (required === undefined) {
        validationErrors.required = "Required status must be specified";
    }

    // If there are basic validation errors, return them before hitting the database
    if (Object.keys(validationErrors).length > 0) {
        await logApiResponse(req, "Validation Error", 400, validationErrors); // Log the validation errors
        return res.status(400).json({
            message: "Validation Error",
            errors: validationErrors
        });
    }

    try {
        // Further checks like ensuring references exist could be added here

        // Create and save the new TemplateAttribute
        const newSpecification = new specification({
            asset_id,
            template_id,
            field_name,
            field_type,
            field_value,
            display_name,
            required,
            master_id: master_id ? master_id : null,
            parameter_type_id: parameter_type_id ? parameter_type_id : null
        });
        const savedSpecification = await specification.save();

        await logApiResponse(req, "Specification created successfully", 201, savedSpecification); // Log the success response
        // Send a successful response back
        res.status(201).send(savedSpecification);
    } catch (error) {
        console.error("Failed to create Specification:", error);

        // Catch and structure mongoose validation errors
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            Object.keys(error.keyPattern).forEach(key => {
                validationErrors[key] = `Specification with this ${key} already exists`;
            });
        }

        await logApiResponse(req, "Error creating Specification", 400, validationErrors);
        res.status(400).json({
            message: "Error creating Specification",
            errors: validationErrors
        });
    }
};

const updateSpecification = async (req, res) => {
    const { id } = req.body;
    try {
        const updatedSpecification = await specification.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSpecification) {
            await logApiResponse(req, "Specification not found", 404, {}); // Log the not found response
            return res.status(404).send({ message: 'Specification not found' });
        }

        await logApiResponse(req, "Specification updated successfully", 200, updatedSpecification); // Log the success response
        res.status(200).send(updatedSpecification);
    } catch (error) {
        await logApiResponse(req, "Error updating TemplateAttribute", 400, error); // Log the error response
        res.status(400).send(error);
    }
};

const getSpecifications = async (req, res) => {
    try {
        const specifications = await specification.find();
        await logApiResponse(req, "Specifications retrieved successfully", 200, specifications); // Log the success response
        res.status(200).send(specifications);
    } catch (error) {
        await logApiResponse(req, "Error retrieving Specifications", 500, error); // Log the error response
        res.status(500).send(error);
    }
};

const getSpecification = async (req, res) => {
    const { specification_id } = req.body;
    try {
        const specifications = await specification.find({ specification_id: specification_id });
        if (!specifications || specifications.length === 0) {
            await logApiResponse(req, "specifications not found for the given specifications", 404, {});
            return res.status(404).send({ message: "specifications not found for the given specifications" });
        }

        await logApiResponse(req, "specifications retrieved successfully", 200, specifications);
        res.status(200).send(specifications);
    } catch (error) {
        await logApiResponse(req, "Error retrieving specifications", 500, { error: error.message });
        res.status(500).send({ message: "Error retrieving specifications", error: error.message });
    }
};

const getAssetSpecification = async (req, res) => {
    const { asset_id, template_id } = req.body; // Changed from id to template_id
    try {
        // Find by template_id instead of the MongoDB document ID
        const specifications = await specification.find({ template_id: template_id, asset_id: asset_id });

        if (!specifications || specifications.length === 0) {
            await logApiResponse(req, "specifications not found for the given template ID", 404, {}); // Log the not found response
            return res.status(404).send({ message: "specifications not found for the given specification ID" });
        }

        await logApiResponse(req, "Specifications retrieved successfully", 200, specifications); // Log the success response
        res.status(200).send(specifications);
    } catch (error) {
        await logApiResponse(req, "Error retrieving Specifications", 500, { error: error.message }); // Log the error response
        res.status(500).send({ message: "Error retrieving Specifications", error: error.message });
    }
};

const deleteSpecification = async (req, res) => {
    const { id } = req.body;
    try {
        const specification = await specification.findByIdAndDelete(id);

        if (!specification) {
            await logApiResponse(req, "Specification not found", 404, {}); // Log the not found response
            return res.status(404).send({ message: "Specification not found" });
        }

        await logApiResponse(req, "Specification successfully deleted", 200, { id }); // Log the success response
        res.status(200).send({ message: "Specification successfully deleted" });
    } catch (error) {
        await logApiResponse(req, "Error deleting Specification", 500, { error: error.message }); // Log the error response
        res.status(500).send({ message: "Error deleting Specification", error: error.message });
    }
};

const paginatedSpecifications = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', search = '', field_type } = req.query;
    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

    // Implementing search functionality
    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { field_name: new RegExp(search, 'i') },
                    { display_name: new RegExp(search, 'i') }
                ]
            } : {},
            field_type ? { field_type: field_type } : {}
        ]
    };

    try {
        const specifications = await specification.find(searchQuery)
            // .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        const count = await specification.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated template attributes retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            specifications,
            totalItems: count,
        });

        res.json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            specification,
            totalItems: count,
        });
    } catch (error) {
        console.error("Error retrieving paginated specification:", error);

        await logApiResponse(req, "Error retrieving paginated specification", 500, { error: error.message });

        res.status(500).json({ message: "Error retrieving paginated specification", error: error.message });
    }
};

module.exports = {
    createSpecification, updateSpecification, getSpecifications, getSpecification, getAssetSpecification, deleteSpecification, paginatedSpecifications
}