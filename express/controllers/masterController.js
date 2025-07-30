const mongoose = require('mongoose');
const TemplateMaster = require('../models/templateMaster');
const Master = require('../models/master');
const ParameterType = require('../models/parameterType');
const TemplateType = require('../models/templateType');
const MasterField = require('../models/masterField');
const SchemaDefinitionModel = require('../models/SchemaDefinition')
const ExcelJS = require('exceljs');

const getDynamicModel = require('../utils/getDynamicModel');
const { typeMapping } = require('../utils/typeMapping');
const SchemaDefinitions = mongoose.model('SchemaDefinition');
const { logApiResponse } = require('../utils/responseService');
const { createNotification } = require('../utils/notification');

const createMaster = async (req, res) => {
    let savedMaster = null;

    try {
        const { masterData, masterFieldData } = req.body;
        const { model_name } = masterData;

        let validationErrors = { master: {}, masterFields: [] };

        if (!masterData.master_name) {
            validationErrors.master.master_name = "Master name is required";
        }
        if (!masterData.parameter_type_id || !mongoose.Types.ObjectId.isValid(masterData.parameter_type_id)) {
            validationErrors.master.parameter_type_id = "Parameter type ID is required and must be valid";
        }
        if (!masterData.display_name_singular) {
            validationErrors.master.display_name_singular = "Display name (singular) is required";
        }
        if (!masterData.display_name_plural) {
            validationErrors.master.display_name_plural = "Display name (plural) is required";
        }
        if (!model_name) {
            validationErrors.master.model_name = "Model name is required";
        }

        if (!Array.isArray(masterFieldData) || masterFieldData.length === 0) {
            validationErrors.masterFields.push({ message: "Master field data is required" });
        } else {
            masterFieldData.forEach((field, index) => {
                let fieldErrors = {};
                if (!field.field_name) fieldErrors.field_name = "Field name is required";
                if (!field.field_type) fieldErrors.field_type = "Field type is required";
                if (!field.display_name) fieldErrors.display_name = "Display name is required";
                if (!field.order) fieldErrors.order = "Order is required";
                if (!field.tooltip) fieldErrors.tooltip = "Tooltip is required";
                if (field.required === undefined) fieldErrors.required = "Required status is required";
                if (field.default === undefined) fieldErrors.default = "Default value is required";

                if (Object.keys(fieldErrors).length > 0) {
                    validationErrors.masterFields.push({ field: `Field ${index + 1}`, errors: fieldErrors });
                }
            });
        }

        if (Object.keys(validationErrors.master).length > 0 || validationErrors.masterFields.length > 0) {
            await logApiResponse(req, "Validation Error", 400, validationErrors);
            return res.status(400).json({ message: "Validation Error", errors: validationErrors });
        }

        const existingMaster = await Master.findOne({ master_name: masterData.master_name });
        if (existingMaster) {
            const duplicateError = { master_name: "A master with this name already exists" };
            await logApiResponse(req, "Duplicate Key Error", 409, { master: duplicateError });
            return res.status(409).json({ message: "Duplicate Key Error", errors: { master: duplicateError } });
        }

        const master = new Master(masterData);
        savedMaster = await master.save();

        const masterFieldEntries = masterFieldData.map(field => ({
            ...field,
            master_id: savedMaster._id
        }));
        const savedMasterFields = await MasterField.insertMany(masterFieldEntries);

        let schemaDefinition = {};
        masterFieldData.forEach(field => {
            const isDefaultTrue = field.default === true || field.default === 'true';
            if (!typeMapping[field.field_type]) {
                throw new Error(`Invalid type: ${field.field_type} for field: ${field.field_name}`);
            }
            schemaDefinition[field.field_name] = {
                type: typeMapping[field.field_type],
                required: field.required,
                default: field.default || undefined,
                unique: isDefaultTrue,
                index: true
            };
        });

        schemaDefinition.status = { type: Boolean, required: true, default: true };
        schemaDefinition.created_at = { type: Date, default: Date.now };
        schemaDefinition.updated_at = { type: Date, default: Date.now };
        schemaDefinition.deleted_at = { type: Date, default: null };

        const dynamicSchema = new mongoose.Schema(schemaDefinition, {
            versionKey: false,
            strict: false,
            collection: model_name
        });
        mongoose.model(model_name, dynamicSchema);

        await SchemaDefinitionModel.findOneAndUpdate(
            { collectionName: model_name },
            { schemaDefinition },
            { upsert: true, new: true }
        );

        const message = `Master "${masterData.master_name}" created successfully`;
        await createNotification(req, 'Master', savedMaster._id, message, 'master');
        await logApiResponse(req, message, 201, {
            masterId: savedMaster._id,
            master: savedMaster,
            masterFields: savedMasterFields
        });

        return res.status(201).json({
            message,
            masterId: savedMaster._id,
            master: savedMaster,
            masterFields: savedMasterFields
        });

    } catch (error) {
        console.error('Error during master creation:', error);

        if (savedMaster?._id) {
            await Master.findByIdAndDelete(savedMaster._id);
        }

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            await logApiResponse(req, "Validation Error", 400, { master: errors });
            return res.status(400).json({ message: "Validation Error", errors: { master: errors } });
        }

        if (error.code === 11000) {
            const errors = { master_name: "A master with this name already exists" };
            await logApiResponse(req, "Duplicate Key Error", 409, { master: errors });
            return res.status(409).json({ message: "Duplicate Key Error", errors: { master: errors } });
        }

        await logApiResponse(req, "Internal Server Error", 500, { error: error.message });
        return res.status(500).json({
            message: "Internal Server Error",
            errors: { message: "An unexpected error occurred" }
        });
    }
};



async function updateDynamicSchema(collectionName, masterFieldData) {
    const schemaDefinition = masterFieldData.reduce((acc, field) => {
        const isDefaultTrue = field.default === true || field.default === 'true'; // Move this inside the reduce function

        acc[field.field_name] = {
            type: typeMapping[field.field_type] || mongoose.Schema.Types.Mixed,
            required: field.required,
            default: field.default || undefined,
            unique: isDefaultTrue, // Use isDefaultTrue here
            index: true
        };
        return acc;
    }, {
        // Define the default fields with appropriate settings
        created_at: { type: Date, default: Date.now },  // Automatically set on creation
        updated_at: { type: Date, default: Date.now },  // Automatically set on creation and needs to be updated on save
        deleted_at: { type: Date, default: null },      // Null initially, set on "deletion"
        status: { type: Boolean, default: true }        // Active by default
    });

    // Adding a hook to update `updated_at` on each save
    const dynamicSchema = new mongoose.Schema(schemaDefinition, { strict: false, collection: collectionName });
    dynamicSchema.pre('save', function (next) {
        this.updated_at = new Date();
        next();
    });

    // Check if the model exists, delete and recreate with the new schema
    if (mongoose.models[collectionName]) {
        delete mongoose.connection.models[collectionName];
    }

    mongoose.model(collectionName, dynamicSchema);

    // Update schema definition in the database
    await SchemaDefinitionModel.findOneAndUpdate(
        { collectionName: collectionName },
        { schemaDefinition: schemaDefinition },
        { upsert: true, new: true }
    );
}

const updateMaster = async (req, res) => {
    const { id } = req.body;
    const { masterData, masterFieldData } = req.body;
    try {
        let master = await Master.findById(id).lean(); // fetch previous state
        if (!master) {
            const notFoundError = { id: "Master with provided ID does not exist" };
            await logApiResponse(req, "Master not found", 404, notFoundError);
            return res.status(404).json({
                message: "Master not found",
                errors: notFoundError
            });
        }

        const existingMaster = await Master.findOne({
            master_name: masterData.master_name,
            _id: { $ne: id }
        });
        if (existingMaster) {
            const duplicateError = { master: { master_name: "A master with this name already exists" } };
            await logApiResponse(req, "Duplicate Key Error", 409, duplicateError);
            return res.status(409).json({
                message: "Duplicate Key Error",
                errors: duplicateError
            });
        }

        const before = { ...master }; // save before

        // Update master
        await Master.findByIdAndUpdate(id, masterData, { new: true });
        const after = await Master.findById(id).lean(); // fetch after update

        // Replace fields
        await MasterField.deleteMany({ master_id: id });
        const newMasterFields = masterFieldData.map(field => ({ ...field, master_id: id }));
        await MasterField.insertMany(newMasterFields);

        await updateDynamicSchema(after.model_name, masterFieldData);

        const successMessage = `Master "${after.master_name}" updated successfully.`;

        await createNotification(req, 'Master', id, successMessage, { before, after }, 'master');
        await logApiResponse(req, successMessage, 200, {
            before,
            after,
            master: after,
            masterFields: newMasterFields
        });

        res.status(200).json({
            message: successMessage,
            master: after,
            masterFields: newMasterFields
        });
    } catch (error) {
        console.error('Error updating master:', error);
        await logApiResponse(req, "Internal Server Error", 500, { message: "An unexpected error occurred" });
        res.status(500).json({
            message: "Internal Server Error",
            errors: {
                message: "An unexpected error occurred"
            }
        });
    }
};


const insertDynamicData = async (req, res) => {
    const { id } = req.body;
    const inputData = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Invalid Master ID",
            errors: { id: "Master ID must be valid" },
        });
    }

    try {
        const masterFields = await MasterField.find({ master_id: id, default: true });

        if (!masterFields || masterFields.length === 0) {
            return res.status(404).json({
                message: "No masterfields found with default: true",
                errors: { id: "Invalid or missing master configuration" },
            });
        }

        // Get the collection name from the master model
        const master = await Master.findById(id);
        if (!master) {
            return res.status(404).json({
                message: "Master configuration not found",
                errors: { masterId: "Master ID does not exist" },
            });
        }

        const collectionName = master.model_name; // Assuming `model_name` holds the collection name
        const DynamicModel = await getDynamicModel(collectionName);

        if (!DynamicModel) {
            return res.status(500).json({
                message: "Dynamic model could not be created",
                errors: { id: "Model generation failed" },
            });
        }

        // Perform unique checks for fields with `default: true`
        const duplicateErrors = {};
        for (const field of masterFields) {
            const fieldName = field.field_name;
            const fieldValue = inputData[fieldName];

            if (fieldValue) {
                // Check for duplicates in the target collection
                const existingDocument = await DynamicModel.findOne({ [fieldName]: fieldValue });

                if (existingDocument) {
                    duplicateErrors[fieldName] = `${field.display_name} (${fieldValue}) already exists.`;
                }
            }
        }

        // If duplicates found, return error
        if (Object.keys(duplicateErrors).length > 0) {
            return res.status(400).json({
                message: "Duplicate fields found",
                errors: duplicateErrors,
            });
        }

        // Insert the new document if no duplicates
        const newDocument = new DynamicModel(inputData);
        const savedDocument = await newDocument.save();
        const message = `${collectionName} document added successfully`;
        await createNotification(req, collectionName, newDocument._id, message, 'master');
        await logApiResponse(req, "Document added successfully", 201, newDocument);
        res.status(201).json({
            message: "Document added successfully",
            data: savedDocument,
        });
    } catch (error) {
        console.error("Error inserting document:", error);
        await logApiResponse(req, "Error inserting document", 500, { error: error.message });
        res.status(500).json({
            message: "Internal Server Error",
            errors: { message: error.message },
        });
    }
};

const updateDynamicData = async (req, res) => {
    const { masterId, docId } = req.body;
    const inputData = req.body;

    try {
        const master = await Master.findById(masterId);
        if (!master) {
            const notFoundError = { masterId: "Master not found" };
            await logApiResponse(req, "Validation Error", 404, notFoundError);
            return res.status(404).json({
                message: "Validation Error",
                errors: notFoundError
            });
        }

        const collectionName = master.model_name;
        const DynamicModel = await getDynamicModel(collectionName);
        if (!DynamicModel) {
            const modelError = { model: "Model could not be created or found" };
            await logApiResponse(req, "Validation Error", 404, modelError);
            return res.status(404).json({
                message: "Validation Error",
                errors: modelError
            });
        }

        // Fetch master fields for uniqueness validation
        const masterFields = await MasterField.find({ master_id: masterId, default: true });

        if (!masterFields || masterFields.length === 0) {
            return res.status(404).json({
                message: "No masterfields found with default: true",
                errors: { masterId: "Invalid or missing master configuration" },
            });
        }

        // Perform duplicate validation
        const duplicateErrors = {};
        for (const field of masterFields) {
            const fieldName = field.field_name;
            const fieldValue = inputData[fieldName];

            if (fieldValue) {
                const existingDocument = await DynamicModel.findOne({
                    [fieldName]: fieldValue,
                    _id: { $ne: docId }
                });

                if (existingDocument) {
                    duplicateErrors[fieldName] = `${field.display_name} (${fieldValue}) already exists.`;
                }
            }
        }

        if (Object.keys(duplicateErrors).length > 0) {
            await logApiResponse(req, "Duplicate Key Error", 400, duplicateErrors);
            return res.status(400).json({
                message: "The given data was invalid",
                errors: duplicateErrors
            });
        }

        // Clean and sanitize input data
        const cleanedData = {};
        for (const key in inputData) {
            if (typeof inputData[key] === 'string') {
                cleanedData[key] = inputData[key]
                    .replace(/&amp;amp;/g, '&')
                    .replace(/&amp;/g, '&')
                    .trim();
            } else {
                cleanedData[key] = inputData[key];
            }
        }

        const beforeUpdate = await DynamicModel.findById(docId);
        if (!beforeUpdate) {
            const docNotFoundError = { docId: "Document not found" };
            await logApiResponse(req, "Validation Error", 404, docNotFoundError);
            return res.status(404).json({
                message: "Validation Error",
                errors: docNotFoundError
            });
        }

        const updatedDoc = await DynamicModel.findByIdAndUpdate(docId, cleanedData, {
            new: true,
            runValidators: true
        });

        const message = `Document updated successfully.\nBefore: ${JSON.stringify(beforeUpdate)}\nAfter: ${JSON.stringify(updatedDoc)}`;
        await createNotification(req, 'Document', docId, message, 'master');

        const { docId: _docId, masterId: _masterId, ...filteredDoc } = updatedDoc.toObject();

        await logApiResponse(req, "Document updated successfully", 200, filteredDoc);
        res.status(200).json({
            message: "Document updated successfully.",
            data: filteredDoc
        });

    } catch (error) {
        console.error('Error:', error);
        await logApiResponse(req, "Failed to update document", 500, { error: error.message });
        res.status(500).json({ message: "Failed to update document", error: error.message });
    }
};


const destroyMaster = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return logApiResponse(req, 'Master ID is required', 400, false, null, res);
        }

        const master = await Master.findOne({ _id: id }).lean({ virtuals: false });
        if (!master) {
            return logApiResponse(req, 'Master not found', 404, false, null, res);
        }

        await Master.deleteOne({ _id: id });

        const message = `Master "${master.master_name}" permanently deleted`;
        await createNotification(req, 'Master', id, message, 'master');
        await logApiResponse(req, message, 200, true, null, res);

        return res.status(200).json({ message });
    } catch (error) {
        await logApiResponse(req, "Failed to delete Master", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to delete Master", error: error.message });
    }
};

const deleteMaster = async (req, res) => {
    try {
        const { id, ids } = req.body;

        const toggleSoftDelete = async (masterId) => {
            const master = await Master.findById(masterId);
            if (!master) throw new Error(`Master with ID ${masterId} not found`);

            let message = '';
            if (master.deleted_at) {
                // Restore
                master.deleted_at = null;
                master.status = true;
                await MasterField.updateMany({ master_id: masterId }, { deleted_at: null, status: true });
                message = `Master "${master.master_name}" is activated successfully`;
            } else {
                // Soft delete
                const now = new Date();
                master.deleted_at = now;
                master.status = false;
                await MasterField.updateMany({ master_id: masterId }, { deleted_at: now, status: false });
                message = `Master "${master.master_name}" is inactivated successfully`;
            }

            master.updated_at = new Date();
            await master.save();
            await createNotification(req, 'Master', masterId, message, 'master');
            return { master, message };
        };

        if (Array.isArray(ids)) {
            const results = await Promise.all(ids.map(toggleSoftDelete));
            const masters = results.map(r => r.master);
            const messages = results.map(r => r.message).join('; ');

            await logApiResponse(req, 'Masters updated successfully', 200, masters);
            return res.status(200).json({ message: messages, data: masters });
        }

        if (id) {
            const { master, message } = await toggleSoftDelete(id);
            await logApiResponse(req, message, 200, master);
            return res.status(200).json({ message, data: master });
        }

        await logApiResponse(req, 'No ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No ID or IDs provided' });

    } catch (error) {
        await logApiResponse(req, "Master delete/restore failed", 500, { error: error.message });
        return res.status(500).json({ message: "Master delete/restore failed", error: error.message });
    }
};


const paginatedMasters = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'master_name',
        order = 'asc',
        search = '',
        status
    } = req.query;

    const allowedSortFields = ['_id', 'master_name', 'slug', 'display_name_singular', 'model_name', 'created_at'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };

    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { master_name: new RegExp(search, 'i') },
                    { slug: new RegExp(search, 'i') },
                    { display_name_singular: new RegExp(search, 'i') },
                    { display_name_plural: new RegExp(search, 'i') },
                    { model_name: new RegExp(search, 'i') }
                ]
            } : {},
            (status === 'true' || status === 'false') ? { status: status === 'true' } : {}
        ]
    };

    try {
        const masters = await Master.find(searchQuery)
            .populate('masterFields')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await Master.countDocuments(searchQuery);

        const response = {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            masters,
            totalItems: count
        };

        await logApiResponse(req, 'Paginated masters retrieved successfully', 200, response);

        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving paginated masters:', error);
        await logApiResponse(req, 'Failed to retrieve paginated masters', 500, { error: error.message });

        res.status(500).json({
            message: 'Failed to retrieve paginated masters',
            error: error.message
        });
    }
};


const getAllSchemaDefinitions = async (req, res) => {
    try {
        // Fetch the 'collectionName' field along with '_id' from each document
        const schemaDefinitions = await SchemaDefinitionModel.find({}).select('collectionName');  // Including the '_id' field
        res.status(200).json(schemaDefinitions);
    } catch (error) {
        console.error('Failed to retrieve schema definitions:', error);
        res.status(500).json({ message: "Failed to retrieve schema definitions.", error: error.toString() });
    }
};

const getCollectionData = async (req, res) => {
    const { masterId } = req.params;
    try {
        // Fetch master with parameter type populated to get the name
        const master = await Master.findById(masterId)
            .populate('parameter_type_id', 'parameter_type_name') // Assuming 'parameter_type_name' is the field you want from ParameterType
            .lean();

        if (!master) {
            // Log the API response for master not found
            await logApiResponse(req, "Master not found.", 404, {});
            return res.status(404).json({ message: "Master not found." });
        }

        const masterFields = await MasterField.find({ master_id: masterId }).lean();
        const collectionName = master.model_name;

        const Model = await getDynamicModel(collectionName);

        if (!Model) {
            // Log the API response for collection not found
            await logApiResponse(req, "Collection not found.", 404, {});
            return res.status(404).json({ message: "Collection not found." });
        }

        const data = await Model.find();


        const response = {
            master: {
                ...master,
                parameter_type_name: master.parameter_type_id ? master.parameter_type_id.parameter_type_name : null, // Include the parameter type name
                masterFields
            },
            data
        };

        // Log the successful API response
        await logApiResponse(req, "Data fetched successfully.", 200, response);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching data from collection:', error);
        // Log the error response
        await logApiResponse(req, "Failed to fetch data from the collection.", 500, { error: error.toString() });
        res.status(500).json({ message: "Failed to fetch data from the collection.", error: error.toString() });
    }
};


const getMasters = async (req, res) => {
    try {
        const masters = await Master.find({ status: true }).populate('masterFields');

        // Log the successful API response
        await logApiResponse(req, "Masters retrieved successfully.", 200, masters);

        res.status(200).json(masters);
    } catch (error) {
        console.error('Failed to retrieve masters and master fields:', error);

        // Log the error response
        await logApiResponse(req, "Failed to retrieve data", 500, { error: error.toString() });

        res.status(500).json({ message: "Failed to retrieve data", error: error.toString() });
    }
};

const deleteDynamicData = async (req, res) => {
    const { masterId, docId, docIds } = req.body;

    try {
        const master = await Master.findById(masterId);
        if (!master) {
            await logApiResponse(req, "Master not found.", 404, {});
            return res.status(404).json({ message: "Master not found." });
        }

        const collectionName = master.model_name;
        const DynamicModel = await getDynamicModel(collectionName);
        if (!DynamicModel) {
            await logApiResponse(req, "Dynamic model could not be found.", 404, {});
            return res.status(404).json({ message: "Dynamic model could not be found." });
        }

        // Soft delete/restore toggle function
        const toggleSoftDelete = async (documentId) => {
            const isUsedInTemplate = await TemplateMaster.findOne({ document_id: documentId });
            if (isUsedInTemplate) {
                throw new Error(`This Data is already used in a template and cannot be inactivated.`);
            }

            const document = await DynamicModel.findById(documentId);
            if (!document) {
                throw new Error(`Document with ID ${documentId} not found in the dynamic collection.`);
            }

            let action;
            if (document.deleted_at) {
                document.deleted_at = null;
                document.status = true;
                action = 'restored';
            } else {
                document.deleted_at = new Date();
                document.status = false;
                action = 'soft deleted';
            }

            const updatedDoc = await document.save();

            const message = `Document "${collectionName}" with ID ${documentId} has been ${action} successfully.`;
            await createNotification(req, 'Document', documentId, message, 'master');

            return updatedDoc;
        };

        // Handle multiple documents
        if (docIds && Array.isArray(docIds)) {
            const promises = docIds.map(toggleSoftDelete);
            const updatedDocuments = await Promise.all(promises);

            await logApiResponse(req, 'Documents soft delete/restore toggled successfully.', 200, updatedDocuments);
            return res.status(200).json({
                message: 'Documents soft delete/restore toggled successfully.',
                data: updatedDocuments
            });

            // Handle single document
        } else if (docId) {
            const updatedDocument = await toggleSoftDelete(docId);

            const message = updatedDocument.deleted_at
                ? 'Document soft deleted successfully.'
                : 'Document restored successfully.';

            await logApiResponse(req, message, 200, updatedDocument);
            return res.status(200).json({
                message,
                data: updatedDocument
            });
        }

        await logApiResponse(req, 'No document ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No document ID or IDs provided' });

    } catch (error) {
        console.error('Error toggling soft delete/restore for the document:', error);
        await logApiResponse(req, 'Error processing the toggle operation', 500, { error: error.toString() });
        return res.status(500).json({ message: "Error processing the toggle operation", error: error.toString() });
    }
};

const destroyDynamicData = async (req, res) => {
    const { masterId, docId, docIds } = req.body;

    try {
        // Validate masterId
        if (!masterId) {
            return logApiResponse(req, 'Master ID is required', 400, false, null, res);
        }

        const master = await Master.findById(masterId);
        if (!master) {
            return logApiResponse(req, 'Master not found', 404, false, null, res);
        }

        const collectionName = master.model_name;
        const DynamicModel = await getDynamicModel(collectionName);
        if (!DynamicModel) {
            return logApiResponse(req, 'Dynamic model could not be found.', 404, false, null, res);
        }

        // Determine IDs to delete
        const idsToDelete = docIds && Array.isArray(docIds) ? docIds : docId ? [docId] : null;
        if (!idsToDelete || idsToDelete.length === 0) {
            return logApiResponse(req, 'No document ID(s) provided', 400, false, null, res);
        }

        // Check for template dependencies
        const templatesUsingDocs = await TemplateMaster.find({ document_id: { $in: idsToDelete } });
        if (templatesUsingDocs.length > 0) {
            return logApiResponse(
                req,
                'One or more documents are used in templates and cannot be deleted permanently.',
                400,
                false,
                null,
                res
            );
        }

        // Fetch documents before deletion for notification purposes
        const docsToDelete = await DynamicModel.find({ _id: { $in: idsToDelete } }).lean();

        // Delete documents
        await DynamicModel.deleteMany({ _id: { $in: idsToDelete } });

        // Create notifications for each deleted document
        for (const doc of docsToDelete) {
            const title = doc?.name || doc?.title || doc?._id; // Try to get a meaningful name
            const message = `${collectionName} document "${title}" permanently deleted`;
            await createNotification(req, collectionName, doc._id, message, 'master');
        }

        await logApiResponse(
            req,
            'Documents permanently deleted',
            200,
            true,
            null,
            res
        );

        return res.status(200).json({
            message: idsToDelete.length > 1
                ? 'Documents permanently deleted'
                : 'Document permanently deleted'
        });
    } catch (error) {
        console.error('Error permanently deleting document(s):', error);
        await logApiResponse(req, 'Error deleting documents permanently', 500, { error: error.message });
        return res.status(500).json({
            message: 'Error deleting documents permanently',
            error: error.message
        });
    }
};




const getPaginatedDynamicData = async (req, res) => {
    const { masterId } = req.body;
    const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        order = 'asc',
        search = '',
        status
    } = req.body;

    const sortOrder = order === 'desc' ? -1 : 1;

    try {
        const master = await Master.findById(masterId)
            .populate('parameter_type_id')
            .populate('masterFields')
            .lean();

        if (!master) {
            await logApiResponse(req, "Master not found.", 404, {});
            return res.status(404).json({ message: "Master not found." });
        }

        const collectionName = master.model_name;
        const DynamicModel = await getDynamicModel(collectionName);

        if (!DynamicModel) {
            await logApiResponse(req, "Model for the specified collection not found.", 404, {});
            return res.status(404).json({ message: "Model for the specified collection not found." });
        }

        const schemaDefinition = await SchemaDefinitionModel.findOne({ collectionName }).lean();
        const schemaDefinitionId = schemaDefinition ? schemaDefinition._id : null;

        // Safe sort field validation
        const allowedSortFields = Array.isArray(master.masterFields)
            ? master.masterFields.map(f => f.field_name).concat(['_id'])
            : ['_id'];
        const cleanSortBy = String(sortBy).trim();
        const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

        // Search conditions
        const searchConditions = [];
        if (search && Array.isArray(master.masterFields)) {
            for (const field of master.masterFields) {
                if (field.field_type === 'Number') {
                    const numVal = parseFloat(search);
                    if (!isNaN(numVal)) {
                        searchConditions.push({ [field.field_name]: numVal });
                    }
                } else {
                    searchConditions.push({ [field.field_name]: new RegExp(search, 'i') });
                }
            }
        }

        const query = {
            $and: [
                searchConditions.length ? { $or: searchConditions } : {},
                (status === 'true' || status === 'false')
                    ? { status: status === 'true' }
                    : {}
            ]
        };

        const results = await DynamicModel.find(query)
            .sort({ [safeSortBy]: sortOrder })
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const orderedResults = results.map(doc => {
            const docObj = doc.toObject();
            const orderedDoc = {};

            if (Array.isArray(master.masterFields)) {
                master.masterFields
                    .sort((a, b) => a.order - b.order)
                    .forEach(field => {
                        if (docObj.hasOwnProperty(field.field_name)) {
                            orderedDoc[field.field_name] = docObj[field.field_name];
                        }
                    });
            }

            Object.keys(docObj).forEach(key => {
                if (!orderedDoc.hasOwnProperty(key)) {
                    orderedDoc[key] = docObj[key];
                }
            });

            return orderedDoc;
        });

        const totalCount = await DynamicModel.countDocuments(query);

        const responseData = {
            master: {
                ...master,
                schemaDefinitionId
            },
            totalPages: Math.ceil(totalCount / limit),
            currentPage: Number(page),
            data: orderedResults,
            totalItems: totalCount
        };

        await logApiResponse(req, "Paginated data retrieved successfully.", 200, responseData);
        return res.status(200).json(responseData);
    } catch (error) {
        console.error('Error fetching paginated data:', error);
        await logApiResponse(req, "Failed to fetch paginated data.", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to fetch paginated data.", error: error.message });
    }
};



const downloadExcel = async (req, res) => {
    try {
        const { masterId } = req.body;
        const masterExists = await Master.findById(masterId);
        if (!masterExists) {
            await logApiResponse(req, 'Master not found', 404, {});
            return res.status(404).json({ message: 'Master not found' });
        }
        const masterFields = await MasterField.find({ master_id: masterId });
        if (masterFields.length === 0) {
            await logApiResponse(req, 'No fields found for this master', 404, {});
            return res.status(404).json({ message: 'No fields found for this master' });
        }
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Master Fields');

        worksheet.columns = masterFields.map(field => ({
            header: field.field_name,
            key: field.field_name,
            width: 20
        }));

        worksheet.autoFilter = {
            from: 'A1',
            to: `${String.fromCharCode(64 + masterFields.length)}1`
        };
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `Master-${encodeURIComponent(masterExists.master_name)}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        await logApiResponse(req, 'Excel file generated successfully', 200, { filename });
        res.send(buffer);
    } catch (error) {
        console.error('Error generating Excel file:', error);
        await logApiResponse(req, 'Internal Server Error', 500, { error: error.message });
        res.status(500).json({
            message: 'Internal Server Error',
            errors: { message: "An unexpected error occurred" }
        });
    }
}

async function getModelNameFromSchemaDefinitionId(schemaDefinitionId) {
    try {
        const schemaDefinition = await SchemaDefinitions.findById(schemaDefinitionId);
        if (!schemaDefinition) {
            throw new Error('No schema definition found for the given ID');
        }
        return schemaDefinition.collectionName;  // Assumes 'collectionName' is the field in SchemaDefinitions
    } catch (error) {
        throw new Error(`Error retrieving schema definition: ${error}`);
    }
}

const uploadExcel = async (req, res) => {
    if (!req.file) {
        await logApiResponse(req, 'Please upload a file', 400, {});
        return res.status(400).json({ message: 'Please upload a file' });
    }

    const { masterId } = req.body;

    let modelName;
    try {
        modelName = await getModelNameFromSchemaDefinitionId(masterId);

        if (!modelName) {
            await logApiResponse(req, 'Model configuration not found', 404, {});
            return res.status(404).json({ message: 'Model configuration not found. Please check the master ID and try again.' });
        }
    } catch (error) {
        await logApiResponse(req, 'Model configuration not found', 404, { error: error.toString() });
        return res.status(404).json({ message: 'Model configuration not found. Please check the master ID and try again.', error: error.toString() });
    }

    const Model = mongoose.models[modelName] ? mongoose.model(modelName) : null;
    if (!Model) {
        await logApiResponse(req, 'Model not found', 404, {});
        return res.status(404).json({ message: 'Model not found for the provided master ID. Please check the master ID and try again.' });
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.getWorksheet(1);
        const headers = [];
        const updates = [];

        worksheet.getRow(1).eachCell((cell, colNumber) => {
            headers[colNumber - 1] = cell.value; // Store headers indexed by column number
        });

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row
            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                if (header) {
                    rowData[header] = cell.value;
                }
            });
            updates.push(rowData);
        });

        await Model.insertMany(updates);
        await logApiResponse(req, 'File processed successfully', 200, { updates });
        res.status(200).json({ message: 'File processed successfully', updates });
    } catch (error) {
        console.error('Error processing Excel file:', error);

        if (error.code === 11000 || error.code === 11001) {
            const duplicateField = error.keyValue ? Object.keys(error.keyValue)[0] : null;
            const duplicateValue = duplicateField ? error.keyValue[duplicateField] : null;

            if (duplicateValue !== null) {
                await logApiResponse(req, 'Duplicate entry detected', 400, { duplicateField, duplicateValue });
                return res.status(400).json({
                    message: `Duplicate entry detected: ${duplicateField} with value "${duplicateValue}" already exists.`,
                    error: error.message
                });
            }
        }

        await logApiResponse(req, 'Error processing file', 400, { error: error.message });
        return res.status(400).json({
            message: 'It seems the file you uploaded contains incorrect or duplicate data.',
            error: error.message
        });
    }
};

const getAllDynamicData = async (req, res) => {
    const { masterId } = req.body;
    try {
        const master = await Master.findById(masterId)
            .populate('parameter_type_id')
            .populate('masterFields')
            .lean();

        if (!master) {
            await logApiResponse(req, "Master not found.", 404, {});
            return res.status(404).json({ message: "Master not found." });
        }

        const collectionName = master.model_name;
        const DynamicModel = await getDynamicModel(collectionName);

        if (!DynamicModel) {
            await logApiResponse(req, "Model for the specified collection not found.", 404, {});
            return res.status(404).json({ message: "Model for the specified collection not found." });
        }

        let results = await DynamicModel.find({});

        // results = results.map(doc => {
        // 	const docObject = doc.toObject();
        // 	const orderedDoc = {};

        // 	// Order based on masterFields
        // 	master.masterFields.sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(field => {
        // 		if (docObject.hasOwnProperty(field.field_name)) {
        // 			orderedDoc[field.field_name] = docObject[field.field_name];
        // 		}
        // 	});

        // 	// Add remaining fields
        // 	Object.keys(docObject).forEach(key => {
        // 		if (!orderedDoc.hasOwnProperty(key)) {
        // 			orderedDoc[key] = docObject[key];
        // 		}
        // 	});

        // 	return orderedDoc;
        // });
        results = results.map(doc => {
            const docObject = doc.toObject();
            const orderedDoc = {};

            // Sort fields by 'order'
            const sortedFields = master.masterFields.sort((a, b) => (a.order || 0) - (b.order || 0));

            // Use the first field (by order) as the label field
            const labelFieldName = sortedFields[0]?.field_name;
            const labelFieldValue = docObject[labelFieldName] || "Unknown";

            // Add master_column_name at the top
            orderedDoc["master_column_name"] = labelFieldValue;

            // Add ordered fields
            sortedFields.forEach(field => {
                if (docObject.hasOwnProperty(field.field_name)) {
                    orderedDoc[field.field_name] = docObject[field.field_name];
                }
            });

            // Add remaining fields
            Object.keys(docObject).forEach(key => {
                if (!orderedDoc.hasOwnProperty(key)) {
                    orderedDoc[key] = docObject[key];
                }
            });

            return orderedDoc;
        });

        await logApiResponse(req, "All data retrieved successfully.", 200, results);
        return res.status(200).json(results); // 🟢 Only data array
    } catch (error) {
        console.error("Error fetching all data:", error);
        await logApiResponse(req, "Failed to fetch all data.", 500, { error: error.toString() });
        return res.status(500).json({ message: "Failed to fetch all data.", error: error.toString() });
    }
};


const getSvp = async (req, res) => {
    try {
        // Step 1: Find the parameter type by name
        const parameterType = await ParameterType.findOne({ parameter_type_name: "Variable Parameter" });

        if (!parameterType) {
            return res.status(404).json({ message: "Parameter type not found." });
        }

        // Step 2: Get the single matching master
        const master = await Master.findOne({
            parameter_type_id: parameterType._id,
            master_name: "Standard Process Variables"
        });

        if (!master) {
            return res.status(404).json({ message: "Master not found." });
        }

        // Return the master as a single object
        return res.status(200).json(master);

    } catch (error) {
        console.error("Error fetching data:", error);
        await logApiResponse(req, "Failed to fetch data.", 500, { error: error.toString() });
        return res.status(500).json({ message: "Failed to fetch data.", error: error.toString() });
    }
};

const getUsecase = async (req, res) => {
    try {
        // Step 1: Find the parameter type by name
        const templateType = await TemplateType.findOne({ template_type_name: "Use Case Template" });

        if (!templateType) {
            return res.status(404).json({ message: "Template type not found." });
        }
        return res.status(200).json(templateType);

    } catch (error) {
        console.error("Error fetching data:", error);
        await logApiResponse(req, "Failed to fetch data.", 500, { error: error.toString() });
        return res.status(500).json({ message: "Failed to fetch data.", error: error.toString() });
    }
};

module.exports = {
    createMaster,
    updateMaster,
    insertDynamicData,
    updateDynamicData,
    paginatedMasters,
    getAllSchemaDefinitions,
    getCollectionData,
    getMasters,
    deleteMaster,
    deleteDynamicData,
    getPaginatedDynamicData,
    downloadExcel,
    uploadExcel,
    getAllDynamicData,
    getSvp, getUsecase,
    destroyMaster,
    destroyDynamicData


}
