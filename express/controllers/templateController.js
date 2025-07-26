const Template = require('../models/template');
const TemplateMaster = require('../models/templateMaster');
const TemplateType = require('../models/templateType');
// const AssetAttribute = require('../models/assetAttribute');
// const AssetClassAttribute = require('../models/assetClassAttribute');
const mongoose = require('mongoose');
// const Asset = require('../models/asset');
const { logApiResponse } = require('../utils/responseService');
const { createNotification } = require('../utils/notification');

const createTemplate = async (req, res) => {
    try {
        const {
            template_type_id,
            template_code,
            template_name,
            structure,
            status,
            deleted_at
        } = req.body;

        const validationErrors = {};
        let combinedErrorMessage = [];
        if (!template_type_id || !mongoose.Types.ObjectId.isValid(template_type_id)) {
            validationErrors.template_type_id = 'Invalid or missing template type ID';
        } else {
            const templateTypeExists = await TemplateType.findById(template_type_id);
            if (!templateTypeExists) {
                validationErrors.template_type_id = 'Template type does not exist';
            }
        }

        // Validate template_code
        if (!template_code || template_code.trim() === '') {
            validationErrors.template_code = 'Template code is required';
            combinedErrorMessage.push('Template code is required');
        } else {
            const existingTemplate = await Template.findOne({ template_code: template_code.trim() });
            if (existingTemplate) {
                validationErrors.template_code = 'Template code already exists';
            }
        }

        // Validate template_name
        if (!template_name || template_name.trim() === '') {
            validationErrors.template_name = 'Template name is required';
            combinedErrorMessage.push('Template name is required');
        }

        // Return validation errors if any
        if (Object.keys(validationErrors).length > 0) {
            let errorMessage = 'Validation Error';

            if (validationErrors.template_code && validationErrors.template_name) {
                errorMessage = 'Template code & Template name are required';
            } else if (validationErrors.template_code) {
                errorMessage = validationErrors.template_code;
            } else if (validationErrors.template_name) {
                errorMessage = validationErrors.template_name;
            }

            await logApiResponse(req, errorMessage, 400, validationErrors);

            return res.status(400).json({
                message: errorMessage,
                errors: validationErrors
            });
        }

        // Prepare the new Template object
        const newTemplate = new Template({
            template_type_id,
            template_code: template_code.trim(),
            template_name: template_name.trim(),
            structure: structure || null,
            status: status !== undefined ? status : true,
            deleted_at: deleted_at || null
        });

        // Save to DB
        const savedTemplate = await newTemplate.save();
        const message = `Template "${newTemplate.template_name}" created successfully`;
        await createNotification(req, 'Template', newTemplate._id, message);

        await logApiResponse(req, 'Template created successfully', 201, savedTemplate);

        res.status(201).json(savedTemplate);

    } catch (error) {
        console.error('Create Template Error:', error);
        await logApiResponse(req, 'Server error', 500, { error: error.message });

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

const updateTemplate = async (req, res) => {
    try {
        const {
            id,
            template_type_id,
            template_code,
            template_name,
            structure,
            status
        } = req.body;

        let validationErrors = {};

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            validationErrors.id = 'Invalid template ID';
        }

        // Validate template_type_id
        if (!template_type_id || !mongoose.Types.ObjectId.isValid(template_type_id)) {
            validationErrors.template_type_id = 'Invalid or missing template type ID';
        } else {
            const templateType = await TemplateType.findById(template_type_id);
            if (!templateType) {
                validationErrors.template_type_id = 'Invalid template type ID';
            }
        }

        // Validate template_code
        if (!template_code) {
            validationErrors.template_code = 'Template code is required';
        } else {
            const existingCodeTemplate = await Template.findOne({ template_code });
            if (existingCodeTemplate && existingCodeTemplate._id.toString() !== id) {
                validationErrors.template_code = 'Template code already exists';
            }
        }

        // Validate template_name
        if (!template_name) {
            validationErrors.template_name = 'Template name is required';
        }

        // Fetch existing template
        const existingTemplate = await Template.findById(id);
        if (!existingTemplate) {
            validationErrors.id = 'Template not found';
        }

        // Parse and validate structure
        let parsedStructure = null;
        if (structure) {
            try {
                const tryParse = typeof structure === 'string' ? JSON.parse(structure) : structure;

                // Only delete TemplateMaster if structure has changed
                if (existingTemplate && JSON.stringify(tryParse) !== JSON.stringify(existingTemplate.structure)) {
                    await TemplateMaster.deleteMany({ template_id: id });
                }

                parsedStructure = JSON.stringify(tryParse);
            } catch (err) {
                validationErrors.structure = 'Invalid structure format. Must be valid JSON.';
            }
        }

        // If there are validation errors, return early
        if (Object.keys(validationErrors).length > 0) {
            const errorMessage = validationErrors.structure || 'Validation Error';
            await logApiResponse(req, errorMessage, 400, validationErrors);
            return res.status(400).json({ message: errorMessage, errors: validationErrors });
        }

        // Prepare update object (deleted_at is not included)
        const updateFields = {
            template_type_id,
            template_code,
            template_name,
            structure: parsedStructure !== null ? parsedStructure : existingTemplate.structure,
            status: status !== undefined ? status : true,
            updated_at: new Date()
        };

        // Update template
        const updatedTemplate = await Template.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedTemplate) {
            await logApiResponse(req, "Template not found", 404, { id: 'Template not found' });
            return res.status(404).json({ message: "Validation Error", errors: { id: 'Template not found' } });
        }

        // Send notification
        const message = `Template "${updatedTemplate.template_name}" updated successfully`;
        await createNotification(req, 'Template', updatedTemplate._id, message);

        // Log response
        await logApiResponse(req, message, 200, updatedTemplate);

        return res.status(200).json({ message, data: updatedTemplate });

    } catch (error) {
        console.error('Error updating template:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            await logApiResponse(req, "Validation Error", 400, errors);
            return res.status(400).json({ message: "Validation Error", errors });
        } else {
            await logApiResponse(req, "Server error", 500, { error: error.message });
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};



// const getAllTemplates = async (req, res) => {
//     try {
//         const templates = await Template.aggregate([
//             {
//                 $lookup: {
//                     from: 'template_type', // Collection name for TemplateType
//                     localField: 'template_type_id',
//                     foreignField: '_id',
//                     as: 'templateType'
//                 }
//             },
//             {
//                 $unwind: '$templateType' // Unwind the result array to get object
//             },
//             {
//                 $addFields: {
//                     template_type_name: '$templateType.template_type_name'
//                 }
//             },
//             {
//                 $project: {
//                     templateType: 0, // Exclude the full templateType object
//                     // 'template_type_id': 0 // Exclude the template_type_id if needed
//                 }
//             }
//         ]);

//         await logApiResponse(req, "Templates retrieved successfully", 200, templates); // Log the success response

//         res.status(200).json(templates);
//     } catch (error) {
//         await logApiResponse(req, "Server error", 500, { error: error.message }); // Log the server error response

//         res.status(500).json({ message: 'Server error', error });
//     }
// };


// const getTemplateById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find the Template by ID and populate the template_type_id field
//         const template = await Template.findById(id).populate('template_type_id');

//         if (!template) {
//             await logApiResponse(req, "Template not found", 404, { message: 'Template not found' }); // Log the not found response
//             return res.status(404).json({ message: 'Template not found' });
//         }

//         await logApiResponse(req, "Template retrieved successfully", 200, template); // Log the success response
//         res.status(200).json(template);
//     } catch (error) {
//         await logApiResponse(req, "Server error", 500, { error: error.message }); // Log the server error response
//         res.status(500).json({ message: 'Server error', error });
//     }
// };

// const deleteTemplateById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Check if the template ID is used in any asset structure
//         const isTemplateUsed = await Asset.findOne({
//             structure: { $regex: id } // Searches the structure field for the template ID
//         });

//         console.log(`Checking if template with ID ${id} is used in assets...`);
//         console.log(`isTemplateUsed:`, isTemplateUsed);

//         if (isTemplateUsed) {
//             const errorMessage = "This template is already used in an asset and cannot be deleted.";
//             console.log(errorMessage);
//             await logApiResponse(req, errorMessage, 400, { message: errorMessage });
//             return res.status(400).json({ message: errorMessage });
//         }

//         // Proceed with template deletion if not used
//         const template = await Template.findByIdAndDelete(id);
//         if (!template) {
//             const notFoundMessage = "Template not found";
//             console.log(notFoundMessage);
//             await logApiResponse(req, notFoundMessage, 404, { message: notFoundMessage });
//             return res.status(404).json({ message: notFoundMessage });
//         }

//         const successMessage = "Template successfully deleted";
//         console.log(successMessage);
//         await logApiResponse(req, successMessage, 200, { message: successMessage });
//         res.status(200).json({ message: successMessage });
//     } catch (error) {
//         const serverErrorMessage = "Server error";
//         console.error(`Error deleting Template with ID: ${id}`, error);
//         await logApiResponse(req, serverErrorMessage, 500, { message: serverErrorMessage, error: error.message });
//         res.status(500).json({ message: serverErrorMessage, error: error.message });
//     }
// };


// const paginatedTemplates = async (req, res) => {
//     const { page = 1, limit = 10, sortBy = 'template_name', order = 'desc', search = '', template_type_id } = req.query;

//     // Building the sort object dynamically based on the query parameters
//     const sort = {
//         [sortBy]: order === 'desc' ? -1 : 1
//     };

//     // Implementing search functionality
//     const searchConditions = [];

//     if (search) {
//         searchConditions.push(
//             { template_name: new RegExp(search, 'i') },
//             { template_code: new RegExp(search, 'i') }
//         );
//     }

//     // Always include template_type_id if provided
//     if (template_type_id) {
//         searchConditions.push({ template_type_id });
//     }

//     const searchQuery = searchConditions.length > 0 ? { $and: searchConditions } : {};

//     try {
//         // Fetching templates with pagination and sorting
//         const templates = await Template.find(searchQuery)
//             .sort(sort)
//             .skip((page - 1) * limit)
//             .limit(Number(limit))
//             .populate('template_type_id'); // Populate the template_type_id field with the corresponding TemplateType document

//         const count = await Template.countDocuments(searchQuery);

//         // Handle case where no templates are found
//         let templateType = null;
//         if (templates.length === 0 && template_type_id) {
//             templateType = await TemplateType.findById(template_type_id);
//             if (templateType) {
//                 await logApiResponse(req, "Templates retrieved with no results", 200, { // Log the response
//                     totalPages: 0,
//                     currentPage: Number(page),
//                     totalItems: 0,
//                     templateType: templateType.toObject(),
//                     templates: []
//                 });
//                 return res.json({
//                     totalPages: 0,
//                     currentPage: Number(page),
//                     totalItems: 0,
//                     templateType: templateType.toObject(),
//                     templates: []
//                 });
//             }
//         } else if (templates.length > 0) {
//             // If templates are found, get the template type from the first template
//             templateType = templates[0].template_type_id;
//         }

//         const response = {
//             totalPages: Math.ceil(count / limit),
//             currentPage: Number(page),
//             totalItems: count,
//             templateType: templateType ? templateType.toObject() : null, // Convert to plain object if exists
//             templates: templates.map(template => ({
//                 ...template.toObject(),
//                 template_type_id: undefined // Remove the nested template_type_id to match the desired response
//             }))
//         };

//         await logApiResponse(req, "Templates retrieved successfully", 200, response); // Log the response
//         res.json(response);
//     } catch (error) {
//         await logApiResponse(req, "Error retrieving templates", 500, { error: error.message }); // Log the error response
//         res.status(500).json({ error: error.message });
//     }
// };

const paginatedTemplates = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'template_name',
        order = 'desc',
        search = '',
        template_type_id,
        status,
        includeDeleted = 'true'  // optional query param to see deleted
    } = req.query;

    const sort = {
        [sortBy]: order === 'desc' ? -1 : 1
    };

    const searchConditions = [];

    // Only exclude soft-deleted records if includeDeleted is not true
    if (includeDeleted !== 'true') {
        searchConditions.push({ deleted_at: null });
    }

    // Search by name or code
    if (search) {
        searchConditions.push({
            $or: [
                { template_name: new RegExp(search, 'i') },
                { template_code: new RegExp(search, 'i') }
            ]
        });
    }

    // Filter by template_type_id
    if (template_type_id && mongoose.Types.ObjectId.isValid(template_type_id)) {
        searchConditions.push({
            template_type_id: new mongoose.Types.ObjectId(template_type_id)
        });
    }

    // Optional status filter
    if (status === 'true' || status === 'false') {
        searchConditions.push({
            status: status === 'true'
        });
    }

    const searchQuery = searchConditions.length > 0 ? { $and: searchConditions } : {};

    try {
        const templates = await Template.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('template_type_id');

        const count = await Template.countDocuments(searchQuery);

        // Determine templateType if needed
        let templateType = null;
        if (templates.length === 0 && template_type_id) {
            templateType = await TemplateType.findById(template_type_id);
            if (templateType) {
                const emptyResponse = {
                    totalPages: 0,
                    currentPage: Number(page),
                    totalItems: 0,
                    templateType: templateType.toObject(),
                    templates: []
                };

                await logApiResponse(req, "Templates retrieved with no results", 200, emptyResponse);
                return res.json(emptyResponse);
            }
        } else if (templates.length > 0) {
            templateType = templates[0].template_type_id;
        }

        const response = {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalItems: count,
            templateType: templateType ? templateType.toObject() : null,
            templates: templates.map(template => {
                const obj = template.toObject();
                delete obj.template_type_id;
                return obj;
            })
        };

        await logApiResponse(req, "Templates retrieved successfully", 200, response);
        res.json(response);

    } catch (error) {
        console.error("Error retrieving templates:", error);
        await logApiResponse(req, "Error retrieving templates", 500, { error: error.message });
        res.status(500).json({ error: error.message });
    }
};


const deleteTemplate = async (req, res) => {
    try {
        const { id, ids } = req.body;

        // Function to check if template is used in an asset
        // const isTemplateInUse = async (templateId) => {
        //     return await Asset.findOne({
        //         structure: { $regex: templateId }
        //     });
        // };

        const toggleSoftDelete = async (_id) => {
            // Check usage
            // const inUse = await isTemplateInUse(_id);
            // if (inUse) {
            //     throw new Error(`Template with ID ${_id} is already used in an asset and cannot be deleted.`);
            // }

            const template = await Template.findById(_id);
            if (!template) throw new Error(`Template with ID ${_id} not found`);

            const wasDeleted = !!template.deleted_at;
            template.deleted_at = wasDeleted ? null : new Date();
            template.status = !template.deleted_at;
            template.updated_at = new Date();

            const updatedTemplate = await template.save();
            const action = wasDeleted ? 'activated' : 'inactivated';
            const message = `Template "${updatedTemplate.template_name}" has been ${action} successfully`;

            return { updatedTemplate, message };
        };

        // Handle bulk deletion
        if (Array.isArray(ids)) {
            const results = await Promise.allSettled(ids.map(toggleSoftDelete));
            const successful = results
                .filter(r => r.status === 'fulfilled')
                .map(r => r.value.updatedTemplate);
            const failed = results
                .filter(r => r.status === 'rejected')
                .map(r => ({ id: ids[results.indexOf(r)], error: r.reason.message }));

            await logApiResponse(req, 'Templates bulk delete/restore processed', 207, { successful, failed });

            return res.status(207).json({
                message: 'Templates processed with mixed results',
                successful,
                failed
            });
        }
        if (id) {
            const { updatedTemplate, message } = await toggleSoftDelete(id);

            await createNotification(req, 'Template', id, message);
            await logApiResponse(req, message, 200, updatedTemplate);

            return res.status(200).json({ message, data: updatedTemplate });
        }

        await logApiResponse(req, 'No ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No ID or IDs provided' });

    } catch (error) {
        await logApiResponse(req, 'Template delete/restore failed', 500, { error: error.message });
        return res.status(500).json({ message: 'Template delete/restore failed', error: error.message });
    }
};

const destroyTemplate = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return logApiResponse(req, 'Template ID is required', 400, false, null, res);
        }

        const template = await Template.findById(id).lean();
        if (!template) {
            return logApiResponse(req, 'Template not found', 404, false, null, res);
        }

        await Template.deleteOne({ _id: id });

        const message = `Template "${template.template_name}" permanently deleted`;
        await createNotification(req, 'Template', id, message);
        await logApiResponse(req, message, 200, true, null, res);

        return res.status(200).json({ message });
    } catch (error) {
        console.log("error", error);
        await logApiResponse(req, "Failed to delete template", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to delete template", error: error.message });
    }
};




module.exports = {
    createTemplate,
    updateTemplate,
    // getAllTemplates,
    // getTemplateById,
    destroyTemplate,
    deleteTemplate,
    paginatedTemplates
}