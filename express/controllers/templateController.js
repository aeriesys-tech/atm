const Template = require('../models/template');
const TemplateMaster = require('../models/templateMaster');
const TemplateType = require('../models/templateType');
// const AssetAttribute = require('../models/assetAttribute');
// const AssetClassAttribute = require('../models/assetClassAttribute');
const mongoose = require('mongoose');
// const Asset = require('../models/asset');
const { logApiResponse } = require('../utils/responseService');


// Create a new Template
// const createTemplate = async (req, res) => {
//     try {
//         const { template_type_id, template_code, template_name, structure, status, deleted_at } = req.body;

//         let validationErrors = {};
//         let combinedErrorMessage = [];

//         // Validate template_type_id
//         if (!template_type_id || !mongoose.Types.ObjectId.isValid(template_type_id)) {
//             validationErrors.template_type_id = 'Invalid or missing template type ID';
//         } else {
//             // Check if the template_type_id exists in the TemplateType collection
//             const templateType = await TemplateType.findById(template_type_id);
//             if (!templateType) {
//                 validationErrors.template_type_id = 'Invalid template type ID';
//             }
//         }

//         // Validate template_code
//         if (!template_code) {
//             validationErrors.template_code = 'Template code is required';
//             combinedErrorMessage.push('Template code is required');
//         } else {
//             // Check if the template code already exists
//             const existingTemplate = await Template.findOne({ template_code });
//             if (existingTemplate) {
//                 validationErrors.template_code = 'Template code already exists';
//             }
//         }

//         // Validate template_name
//         if (!template_name) {
//             validationErrors.template_name = 'Template name is required';
//             combinedErrorMessage.push('Template name is required');
//         }

//         // If there are validation errors, return them
//         if (Object.keys(validationErrors).length > 0) {
//             let errorMessage = "Validation Error";

//             // Custom error message for template_code and template_name
//             if (validationErrors.template_code && validationErrors.template_name) {
//                 errorMessage = 'Template code & Template name are required';
//             } else if (validationErrors.template_code) {
//                 errorMessage = validationErrors.template_code;
//             } else if (validationErrors.template_name) {
//                 errorMessage = validationErrors.template_name;
//             }

//             await logApiResponse(req, errorMessage, 400, validationErrors); // Log the validation error response

//             return res.status(400).json({
//                 message: errorMessage,
//                 errors: validationErrors
//             });
//         }

//         // Create a new Template instance
//         const newTemplate = new Template({
//             template_type_id,
//             template_code,
//             template_name,
//             structure,
//             status: status !== undefined ? status : true,
//             deleted_at: deleted_at || null
//         });

//         // Save the new Template to the database
//         const savedTemplate = await newTemplate.save();

//         await logApiResponse(req, 'Template created successfully', 201, savedTemplate); // Log the success response

//         res.status(201).json(savedTemplate);
//     } catch (error) {
//         await logApiResponse(req, 'Server error', 500, { error: error.message }); // Log the server error response

//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };


// const updateTemplate = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { template_type_id, template_code, template_name, structure, status, deleted_at } = req.body;

//         let validationErrors = {};

//         // Validate id
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             validationErrors.id = 'Invalid template ID';
//         }

//         // Validate template_type_id
//         if (!template_type_id || !mongoose.Types.ObjectId.isValid(template_type_id)) {
//             validationErrors.template_type_id = 'Invalid or missing template type ID';
//         } else {
//             const templateType = await TemplateType.findById(template_type_id);
//             if (!templateType) {
//                 validationErrors.template_type_id = 'Invalid template type ID';
//             }
//         }

//         // Validate template_code
//         if (!template_code) {
//             validationErrors.template_code = 'Template code is required';
//         } else {
//             const existingTemplate = await Template.findOne({ template_code });
//             if (existingTemplate && existingTemplate._id.toString() !== id) {
//                 validationErrors.template_code = 'Template code already exists';
//             }
//         }

//         // Validate template_name
//         if (!template_name) {
//             validationErrors.template_name = 'Template name is required';
//         }

//         // Fetch the existing template
//         const existingTemplate = await Template.findById(id);
//         if (!existingTemplate) {
//             validationErrors.id = 'Template not found';
//         } else {
//             // Check if structure is being changed
//             if (structure && structure !== existingTemplate.structure) {
//                 const isTemplateUsed = await Asset.findOne({
//                     structure: { $regex: id },
//                 });

//                 if (isTemplateUsed) {
//                     validationErrors.structure = 'Cannot update structure as the template is already used in an asset';
//                 } else {
//                     // Delete associated entries in TemplateMaster
//                     await TemplateMaster.deleteMany({ template_id: id });
//                 }
//             }
//         }

//         // Return validation errors, if any
//         if (Object.keys(validationErrors).length > 0) {
//             const errorMessage = validationErrors.structure || 'Validation Error';
//             await logApiResponse(req, errorMessage, 400, validationErrors);

//             return res.status(400).json({
//                 message: errorMessage,
//                 errors: validationErrors,
//             });
//         }

//         // Update the Template
//         const updatedTemplate = await Template.findByIdAndUpdate(
//             id,
//             {
//                 template_type_id,
//                 template_code,
//                 template_name,
//                 structure,
//                 status: status !== undefined ? status : true,
//                 deleted_at: deleted_at || null,
//                 updated_at: new Date(),
//             },
//             { new: true, runValidators: true }
//         );

//         if (!updatedTemplate) {
//             await logApiResponse(req, "Template not found", 404, { id: 'Template not found' });

//             return res.status(404).json({
//                 message: "Validation Error",
//                 errors: { id: 'Template not found' },
//             });
//         }

//         await logApiResponse(req, "Template updated successfully", 200, updatedTemplate);

//         res.status(200).json(updatedTemplate);
//     } catch (error) {
//         console.error('Error updating template:', error);

//         if (error.name === 'ValidationError') {
//             const errors = {};
//             Object.keys(error.errors).forEach((key) => {
//                 errors[key] = error.errors[key].message;
//             });
//             await logApiResponse(req, "Validation Error", 400, errors);

//             res.status(400).json({
//                 message: "Validation Error",
//                 errors,
//             });
//         } else {
//             await logApiResponse(req, "Server error", 500, { error: error.message });

//             res.status(500).json({
//                 message: 'Server error',
//                 error: error.message,
//             });
//         }
//     }
// };

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


const paginatedTemplates = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'template_name', order = 'desc', search = '', template_type_id } = req.query;

    // Building the sort object dynamically based on the query parameters
    const sort = {
        [sortBy]: order === 'desc' ? -1 : 1
    };

    // Implementing search functionality
    const searchConditions = [];

    if (search) {
        searchConditions.push(
            { template_name: new RegExp(search, 'i') },
            { template_code: new RegExp(search, 'i') }
        );
    }

    // Always include template_type_id if provided
    if (template_type_id) {
        searchConditions.push({ template_type_id });
    }

    const searchQuery = searchConditions.length > 0 ? { $and: searchConditions } : {};

    try {
        // Fetching templates with pagination and sorting
        const templates = await Template.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate('template_type_id'); // Populate the template_type_id field with the corresponding TemplateType document

        const count = await Template.countDocuments(searchQuery);

        // Handle case where no templates are found
        let templateType = null;
        if (templates.length === 0 && template_type_id) {
            templateType = await TemplateType.findById(template_type_id);
            if (templateType) {
                await logApiResponse(req, "Templates retrieved with no results", 200, { // Log the response
                    totalPages: 0,
                    currentPage: Number(page),
                    totalItems: 0,
                    templateType: templateType.toObject(),
                    templates: []
                });
                return res.json({
                    totalPages: 0,
                    currentPage: Number(page),
                    totalItems: 0,
                    templateType: templateType.toObject(),
                    templates: []
                });
            }
        } else if (templates.length > 0) {
            // If templates are found, get the template type from the first template
            templateType = templates[0].template_type_id;
        }

        const response = {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalItems: count,
            templateType: templateType ? templateType.toObject() : null, // Convert to plain object if exists
            templates: templates.map(template => ({
                ...template.toObject(),
                template_type_id: undefined // Remove the nested template_type_id to match the desired response
            }))
        };

        await logApiResponse(req, "Templates retrieved successfully", 200, response); // Log the response
        res.json(response);
    } catch (error) {
        await logApiResponse(req, "Error retrieving templates", 500, { error: error.message }); // Log the error response
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    // createTemplate,
    // updateTemplate,
    // getAllTemplates,
    // getTemplateById,
    // deleteTemplateById,
    paginatedTemplates
}