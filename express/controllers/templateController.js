const Template = require('../models/template');
const TemplateMaster = require('../models/templateMaster');
const TemplateType = require('../models/templateType');
const mongoose = require('mongoose');
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
            deleted_at,
            source_id
        } = req.body;

        const validationErrors = {};

        if (!template_type_id || !mongoose.Types.ObjectId.isValid(template_type_id)) {
            validationErrors.template_type_id = 'Invalid or missing template type ID';
        } else {
            const templateTypeExists = await TemplateType.findById(template_type_id);
            if (!templateTypeExists) {
                validationErrors.template_type_id = 'Template type does not exist';
            }
        }

        if (!template_code || template_code.trim() === '') {
            validationErrors.template_code = 'Template code is required';
        } else {
            const existingTemplate = await Template.findOne({ template_code: template_code.trim() });
            if (existingTemplate) {
                validationErrors.template_code = 'Template code already exists';
            }
        }

        if (!template_name || template_name.trim() === '') {
            validationErrors.template_name = 'Template name is required';
        }

        if (Object.keys(validationErrors).length > 0) {
            const errorMessage = Object.values(validationErrors).join(', ');
            await logApiResponse(req, 'Validation Error', 400, validationErrors);
            return res.status(400).json({ message: errorMessage, errors: validationErrors });
        }

        const newTemplate = new Template({
            template_type_id,
            template_code: template_code.trim(),
            template_name: template_name.trim(),
            structure: structure || null,
            status: status !== undefined ? status : true,
            deleted_at: deleted_at || null
        });

        // Dynamic collections creation
        if (source_id !== '1' && structure) {
            let parsedStructure;
            try {
                parsedStructure = typeof structure === 'string' ? JSON.parse(structure) : structure;
            } catch (err) {
                await logApiResponse(req, 'Invalid structure JSON', 400, { structure: 'Could not parse structure' });
                return res.status(400).json({ message: 'Invalid structure format' });
            }

            const nodes = Array.isArray(parsedStructure.connectedNodes) ? parsedStructure.connectedNodes : [];
            const edges = Array.isArray(parsedStructure.edges) ? parsedStructure.edges : [];

            if (nodes.length === 0) {
                await logApiResponse(req, 'Validation Error', 400, { message: 'Selected items must have at least one node selected.' });
                return res.status(400).json({ message: 'Selected items must have at least one node selected.' });
            }

            const sanitize = str => str.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '_');
            const nodeMap = new Map(nodes.map(node => [node.id, node]));
            const sourceIds = new Set(edges.map(edge => edge.source));
            const leafNodes = nodes.filter(node => !sourceIds.has(node.id));

            for (const leaf of leafNodes) {
                const leafLabel = leaf.data?.label || 'unnamed';
                const incomingEdge = edges.find(edge => edge.target === leaf.id);
                const parentNodeId = incomingEdge?.source || null;
                const parentNode = parentNodeId ? nodeMap.get(parentNodeId) : null;
                const parentLabel = parentNode?.data?.label || null;

                const sanitizedLeafLabel = sanitize(leafLabel);
                const sanitizedParentLabel = parentLabel ? sanitize(parentLabel) : null;

                const collectionName = sanitize(`${template_name}_${leafLabel}`);
                const modelName = `Dynamic_${leaf.id}_${newTemplate._id}`;

                if (mongoose.models[modelName]) {
                    delete mongoose.models[modelName];
                }

                const schemaFields = { template_id: mongoose.Schema.Types.ObjectId };
                const entry = { template_id: newTemplate._id };

                if (sanitizedParentLabel && parentNodeId) {
                    schemaFields[`${sanitizedParentLabel}_id`] = String;
                    entry[`${sanitizedParentLabel}_id`] = parentNodeId;

                    schemaFields[sanitizedParentLabel] = mongoose.Schema.Types.Mixed;
                    entry[sanitizedParentLabel] = { [`${sanitizedLeafLabel}_id`]: leaf.id };
                } else {
                    schemaFields[`${sanitizedLeafLabel}_id`] = String;
                    entry[`${sanitizedLeafLabel}_id`] = leaf.id;
                }

                const dynamicSchema = new mongoose.Schema(schemaFields, { collection: collectionName });
                const DynamicModel = mongoose.model(modelName, dynamicSchema);

                await DynamicModel.insertMany([entry]);
            }

            console.log("Dynamic collections created for all leaf nodes.");
        }

        const savedTemplate = await newTemplate.save();
        const message = `Template "${newTemplate.template_name}" created successfully`;

        await createNotification(req, 'Template', newTemplate._id, message, 'template');
        await logApiResponse(req, message, 201, savedTemplate);

        res.status(201).json({ message, data: savedTemplate });

    } catch (error) {
        console.error('Create Template Error:', error);
        await logApiResponse(req, 'Server error', 500, { error: error.message });
        res.status(500).json({ message: 'Server error', error: error.message });
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
        if (!mongoose.Types.ObjectId.isValid(id)) {
            validationErrors.id = 'Invalid template ID';
        }
        if (!template_type_id || !mongoose.Types.ObjectId.isValid(template_type_id)) {
            validationErrors.template_type_id = 'Invalid or missing template type ID';
        } else {
            const templateType = await TemplateType.findById(template_type_id);
            if (!templateType) validationErrors.template_type_id = 'Invalid template type ID';
        }
        if (!template_code) {
            validationErrors.template_code = 'Template code is required';
        } else {
            const existingCodeTemplate = await Template.findOne({ template_code });
            if (existingCodeTemplate && existingCodeTemplate._id.toString() !== id) {
                validationErrors.template_code = 'Template code already exists';
            }
        }
        if (!template_name) validationErrors.template_name = 'Template name is required';
        const existingTemplate = await Template.findById(id);
        if (!existingTemplate) validationErrors.id = 'Template not found';
        let parsedStructure = null;
        if (structure) {
            try {
                const tryParse = typeof structure === 'string' ? JSON.parse(structure) : structure;

                if (existingTemplate && JSON.stringify(tryParse) !== JSON.stringify(existingTemplate.structure)) {
                    await TemplateMaster.deleteMany({ template_id: id });
                }

                parsedStructure = tryParse;
            } catch {
                validationErrors.structure = 'Invalid structure format. Must be valid JSON.';
            }
        }

        if (Object.keys(validationErrors).length > 0) {
            const errorMessage = validationErrors.structure || 'Validation Error';
            await logApiResponse(req, errorMessage, 400, validationErrors);
            return res.status(400).json({ message: errorMessage, errors: validationErrors });
        }
        const beforeUpdate = {
            template_type_id: existingTemplate.template_type_id,
            template_code: existingTemplate.template_code,
            template_name: existingTemplate.template_name,
            structure: existingTemplate.structure,
            status: existingTemplate.status
        };
        const updateFields = {
            template_type_id,
            template_code,
            template_name,
            structure: parsedStructure !== null ? JSON.stringify(parsedStructure) : existingTemplate.structure,
            status: status !== undefined ? status : existingTemplate.status,
            updated_at: new Date()
        };

        const updatedTemplate = await Template.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (parsedStructure) {
            const connectedNodes = parsedStructure.connectedNodes || [];
            const unconnectedNodes = parsedStructure.unconnectedNodes || [];
            const nodes = parsedStructure.nodes || [];
            const edges = parsedStructure.edges || [];

            const allNodes = [...connectedNodes, ...unconnectedNodes, ...nodes];
            const nodeMap = new Map(allNodes.map(node => [node.id, node]));
            const sourceIds = new Set(edges.map(edge => edge.source));
            const leafNodes = allNodes.filter(node => !sourceIds.has(node.id));

            const getAncestors = (leafId, visited = new Set()) => {
                const result = [];
                const stack = [leafId];
                while (stack.length) {
                    const current = stack.pop();
                    if (visited.has(current)) continue;
                    visited.add(current);

                    const node = nodeMap.get(current);
                    if (node) result.push(node);

                    const parentEdges = edges.filter(edge => edge.target === current);
                    for (const edge of parentEdges) stack.push(edge.source);
                }
                return result;
            };

            const existingCollections = await mongoose.connection.db.listCollections().toArray();
            const templatePrefix = `${template_name}_`.replace(/[^\w]/g, '_').toLowerCase();
            for (const coll of existingCollections) {
                if (coll.name.startsWith(templatePrefix)) await mongoose.connection.db.dropCollection(coll.name);
            }

            const sanitizeCollectionName = name => name.replace(/[^\w]/g, '_').toLowerCase();

            for (const leaf of leafNodes) {
                const visited = new Set();
                const allAncestors = getAncestors(leaf.id, visited).reverse();
                const sanitizedName = sanitizeCollectionName(`${template_name}_${leaf.data?.label || 'unnamed'}`);
                const dynamicSchema = new mongoose.Schema({}, { strict: false });
                let DynamicModel;
                try {
                    DynamicModel = mongoose.model(sanitizedName);
                } catch {
                    DynamicModel = mongoose.model(sanitizedName, dynamicSchema);
                }

                const dataToInsert = [
                    Object.assign(
                        Object.fromEntries(allAncestors.map(node => {
                            const key = `${node.data?.label?.toLowerCase().replace(/\s+/g, '_')}_id`;
                            return [key, node.id];
                        })),
                        {
                            [`${leaf.data?.label?.toLowerCase().replace(/\s+/g, '_')}_id`]: leaf.id,
                            template_id: updatedTemplate._id,
                            node_id: leaf.id
                        }
                    )
                ];

                await DynamicModel.insertMany(dataToInsert);
            }
        }
        const afterUpdate = {
            template_type_id: updatedTemplate.template_type_id,
            template_code: updatedTemplate.template_code,
            template_name: updatedTemplate.template_name,
            structure: updatedTemplate.structure,
            status: updatedTemplate.status
        };
        const message = `Template "${updatedTemplate.template_name}" updated successfully.\nBefore: ${JSON.stringify(beforeUpdate)}\nAfter: ${JSON.stringify(afterUpdate)}`;
        await createNotification(req, 'Template', updatedTemplate._id, message, 'template');
        await logApiResponse(req, message, 200, updatedTemplate);

        return res.status(200).json({ message, data: updatedTemplate });

    } catch (error) {
        console.error('Error updating template:', error);

        if (error.name === 'ValidationError') {
            const errors = {};
            Object.keys(error.errors).forEach(key => errors[key] = error.errors[key].message);
            await logApiResponse(req, "Validation Error", 400, errors);
            return res.status(400).json({ message: "Validation Error", errors });
        }

        await logApiResponse(req, "Server error", 500, { error: error.message });
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getTemplateById = async (req, res) => {
    try {
        const { id } = req.body;

        const template = await Template.findById(id)
            .populate('template_type_id')
            .populate('template_data')
            .populate('template_master');

        if (!template) {
            await logApiResponse(req, "Template not found", 404, { message: 'Template not found' });
            return res.status(404).json({ message: 'Template not found' });
        }
        await logApiResponse(req, "Template retrieved successfully", 200, template);
        res.status(200).json(template);
    } catch (error) {
        await logApiResponse(req, "Server error", 500, { error: error.message });
        res.status(500).json({ message: 'Server error', error });
    }
};



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
        const toggleSoftDelete = async (_id) => {
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

            await createNotification(req, 'Template', id, message, 'template');
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
            await logApiResponse(req, 'Template ID is required', 400, { id: "Required" });
            return res.status(400).json({ message: 'Template ID is required', errors: { id: "Required" } });
        }
        const template = await Template.findById(id).lean();
        if (!template) {
            await logApiResponse(req, 'Template not found', 404, { id: "Not Found" });
            return res.status(404).json({ message: 'Template not found', errors: { id: "Not Found" } });
        }
        await Template.deleteOne({ _id: id });
        const message = `Template "${template.template_name}" permanently deleted`;
        await createNotification(req, 'Template', id, message, 'template');

        await logApiResponse(req, message, 200, { id });

        return res.status(200).json({ message });

    } catch (error) {
        console.error("Failed to delete template:", error);
        await logApiResponse(req, "Failed to delete template", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to delete template", error: error.message });
    }
};

module.exports = { createTemplate, updateTemplate, getTemplateById, destroyTemplate, deleteTemplate, paginatedTemplates }