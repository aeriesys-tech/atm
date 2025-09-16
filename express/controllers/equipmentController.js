
const Equipment = require('../models/equipment');
const Template = require("../models/template");
// const templateAttribute = require("../models/templateAttribute");
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const assetAttribute = require('../models/assetAttribute');
const assetClassAttribute = require('../models/assetClassAttribute');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const templateMaster = require('../models/templateMaster');
const templateData = require('../models/templateData');
const assetMaster = require('../models/assetMaster');
// const templateType = require('../models/templateType');
const templateType = require('../models/templateType');
const { createNotification } = require('../utils/notification');

// const paginatedEquipments = async (req, res) => {
//     const { page = 1, limit = 10, sortBy = 'equipment_code', order = 'asc', search = '', status } = req.query;

//     // Only allow safe fields for sorting (must exist in Cosmos DB index)
//     const safeSortBy = ['_id', 'equipment_code', 'equipment_name', 'created_at'].includes(sortBy) ? sortBy : '_id';
//     const sort = { [safeSortBy]: order === 'desc' ? -1 : 1 };

//     const match = {};
//     if (status === 'true' || status === 'false') match.status = status === 'true';
//     if (search) match.$or = [
//         { equipment_name: new RegExp(search, 'i') },
//         { equipment_code: new RegExp(search, 'i') },
//         { 'category.category_name': new RegExp(search, 'i') }
//     ];

//     try {
//         const pipeline = [
//             { $lookup: { from: 'categories', localField: 'category_id', foreignField: '_id', as: 'category' } },
//             { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
//             { $match: match },
//             { $sort: sort },
//             { $skip: (page - 1) * Number(limit) },
//             { $limit: Number(limit) }
//         ];

//         const countPipeline = [
//             { $lookup: { from: 'categories', localField: 'category_id', foreignField: '_id', as: 'category' } },
//             { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
//             { $match: match },
//             { $count: 'total' }
//         ];

//         const [equipments, countResult] = await Promise.all([
//             Equipment.aggregate(pipeline),
//             Equipment.aggregate(countPipeline)
//         ]);

//         const totalItems = countResult[0]?.total || 0;

//         // Transform dynamic attributes: label:value
//         const transformedEquipments = equipments.map(equipment => {
//             const result = { ...equipment };

//             if (result.attributes) {
//                 for (const [key, attr] of Object.entries(result.attributes)) {
//                     if (attr.label && attr.value !== undefined) result[attr.label] = attr.value;
//                 }
//                 delete result.attributes;
//             }

//             return result;
//         });

//         // Automatically determine fields for assetAttribute
//         const systemFields = new Set(['_id', 'created_at', 'updated_at', '__v', 'attributes', 'templates', 'category']);
//         const assetAttribute = transformedEquipments[0]
//             ? Object.keys(transformedEquipments[0])
//                 .filter(field => !systemFields.has(field))
//                 .map(field_name => ({
//                     field_name,
//                     display_name: field_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
//                 }))
//             : [];

//         const responseData = {
//             totalPages: Math.ceil(totalItems / limit),
//             currentPage: Number(page),
//             totalItems,
//             assetAttribute,
//             equipments: transformedEquipments
//         };

//         await logApiResponse(req, "Paginated equipments retrieved successfully", 200, responseData);
//         res.status(200).json(responseData);

//     } catch (error) {
//         console.error("Error retrieving paginated equipments:", error);
//         await logApiResponse(req, "Failed to retrieve paginated equipments", 500, { error: error.message });
//         res.status(500).json({ message: "Failed to retrieve paginated equipments", error: error.message });
//     }
// };

const paginatedEquipments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = ''
        } = req.query;
        const { asset_id } = req.body;

        if (!asset_id) {
            return res.status(400).json({ message: "asset_id is required" });
        }

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        // Use string type for Cosmos DB
        const assetIdQuery = String(asset_id);

        //  Fetch asset class attributes
        const assetClassAttributes = await assetClassAttribute.findOne({ asset_id: assetIdQuery });
        if (!assetClassAttributes) {
            await logApiResponse(req, "Asset class attributes not found for the given asset_id", 404, {});
            return res.status(404).json({ message: "Asset class attributes not found for the given asset_id" });
        }

        // 2️⃣ Extract attribute IDs and fetch field definitions
        const attributeIdsWithOrder = assetClassAttributes.asset_attribute_ids || [];
        const attributeIds = attributeIdsWithOrder.map(attr => attr.id);

        const fieldDefinitions = await assetAttribute.find({ _id: { $in: attributeIds } })
            .select('field_name display_name');

        // 3️⃣ Create order mapping
        const orderMapping = attributeIdsWithOrder.reduce((acc, curr) => {
            acc[curr.id.toString()] = curr.order;
            return acc;
        }, {});

        // 4️⃣ Sort asset attributes by order
        const sortedAssetAttributes = fieldDefinitions
            .map(field => ({
                field_name: field.field_name,
                display_name: field.display_name,
                order: orderMapping[field._id.toString()] || Infinity
            }))
            .sort((a, b) => a.order - b.order)
            .map(({ field_name, display_name }) => ({ field_name, display_name }));

        // 5️⃣ Build dynamic search query
        const searchQuery = { asset_id: assetIdQuery };
        if (search) {
            try {
                const searchParams = JSON.parse(search);
                const orConditions = Object.entries(searchParams).map(([key, value]) => ({
                    [key]: { $regex: String(value), $options: 'i' }
                }));
                if (orConditions.length > 0) searchQuery.$or = orConditions;
            } catch (err) {
                searchQuery.$or = sortedAssetAttributes.map(attr => ({
                    [attr.field_name]: { $regex: search, $options: 'i' }
                }));
                searchQuery.$or.push(
                    { equipment_name: { $regex: search, $options: 'i' } },
                    { equipment_code: { $regex: search, $options: 'i' } }
                );
            }
        }

        // 6️⃣ Fetch count + paginated equipments (no sort)
        const [count, equipments] = await Promise.all([
            Equipment.countDocuments(searchQuery),
            Equipment.find(searchQuery)
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber)
        ]);

        const responseData = {
            totalPages: Math.ceil(count / limitNumber),
            currentPage: pageNumber,
            totalItems: count,
            assetAttribute: sortedAssetAttributes,
            equipments
        };

        await logApiResponse(req, "Equipments retrieved successfully", 200, responseData);
        res.status(200).json(responseData);

    } catch (error) {
        console.error("Error in paginatedEquipments:", error);
        await logApiResponse(req, "Failed to fetch paginated equipments.", 500, { error: error.toString() });
        res.status(500).json({
            message: "Failed to fetch paginated equipments.",
            error: error.toString()
        });
    }
};

// const addEquipment = async (req, res) => {
//     try {
//         const { templates, attributes, ...otherFields } = req.body;

//         // Transform attributes into key:value pairs
//         const transformedAttributes = {};
//         if (attributes) {
//             for (const key in attributes) {
//                 const attr = attributes[key];
//                 if (attr && attr.label !== undefined && attr.value !== undefined) {
//                     transformedAttributes[attr.label] = attr.value;
//                 }
//             }
//         }

//         // Take the first template if provided
//         let templatesObject = {};
//         if (Array.isArray(templates) && templates.length > 0) {
//             templatesObject = templates[0];
//         }

//         const equipmentData = {
//             ...otherFields,
//             ...transformedAttributes,
//             templates: templatesObject
//         };

//         // Create and save new equipment
//         const newEquipment = await Equipment.create(equipmentData);

//         // Success message
//         const message = "Equipment added successfully";

//         // Log + Notification
//         await logApiResponse(req, message, 201, newEquipment);
//         await createNotification(req, 'Equipment', newEquipment._id, message, 'master');

//         return res.status(201).json({
//             message,
//             data: newEquipment
//         });

//     } catch (error) {
//         console.error("Error adding equipment:", error);

//         await logApiResponse(req, "Error adding equipment", 500, { error: error.message });

//         return res.status(500).json({
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// };


// const updateEquipment = async (req, res) => {
//     try {
//         const equipmentId = req.body.equipmentId;
//         const attributes = req.body;
//         const updatedEquipment = await Equipment.findByIdAndUpdate(equipmentId, attributes, { new: true });

//         if (!updatedEquipment) {
//             await logApiResponse(req, "Not Found: Equipment not found", 404, {});
//             return res.status(404).json({
//                 message: "Not Found: Equipment not found"
//             });
//         }

//         res.status(200).json({
//             message: "Equipment updated successfully",
//             data: updatedEquipment
//         });

//         await logApiResponse(req, "Equipment updated successfully", 200, updatedEquipment);
//     } catch (error) {
//         console.error("Error editing equipment:", {
//             error: error.message,
//             stack: error.stack
//         });

//         await logApiResponse(req, "Error editing equipment", 500, { error: error.message });

//         res.status(500).json({
//             message: "Internal Server Error",
//             error: error.message
//         });
//     }
// };


const addEquipment = async (req, res) => {
    try {
        const { templates, attributes, ...otherFields } = req.body;

        // 🔹 Flatten attributes into root fields using their label
        const flattenedAttributes = {};
        if (attributes) {
            for (const key in attributes) {
                const attr = attributes[key];
                if (attr && attr.label && attr.value !== undefined) {
                    flattenedAttributes[attr.label] = attr.value;
                }
            }
        }

        // 🔹 Keep templates as array
        let templatesArray = [];
        if (Array.isArray(templates) && templates.length > 0) {
            templatesArray = templates.map(t => ({
                template_id: t.template_id,
                rows: Array.isArray(t.rows) ? [...t.rows] : []
            }));
        }

        // 🔹 Final data to insert
        const equipmentData = {
            ...otherFields,
            ...flattenedAttributes,  // ✅ attributes stored by label
            templates: templatesArray
        };

        // 🔹 Save equipment
        const newEquipment = await Equipment.create(equipmentData);

        const message = "Equipment added successfully";
        await logApiResponse(req, message, 201, newEquipment);
        await createNotification(req, 'Equipment', newEquipment._id, message, 'master');

        return res.status(201).json({
            message,
            data: newEquipment
        });

    } catch (error) {
        console.error("Error adding equipment:", error);

        await logApiResponse(req, "Error adding equipment", 500, { error: error.message });

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const updateEquipment = async (req, res) => {
    try {
        const { equipmentId, templates, attributes, ...otherFields } = req.body;
        const existingEquipment = await Equipment.findById(equipmentId);
        if (!existingEquipment) {
            const errors = { equipmentId: "Equipment not found" };
            await logApiResponse(req, "Equipment not found", 404, errors);
            return res.status(404).json({ message: "Equipment not found", errors });
        }
        const transformedAttributes = {};
        if (attributes) {
            for (const key in attributes) {
                const attr = attributes[key];
                if (attr && attr.label !== undefined && attr.value !== undefined) {
                    transformedAttributes[attr.label] = attr.value;
                } else {
                    transformedAttributes[key] = attributes[key];
                }
            }
        }
        const templatesArray = Array.isArray(templates) ? templates : [];
        const beforeUpdate = { ...existingEquipment.toObject() };
        const updatedData = {
            ...otherFields,
            ...transformedAttributes,
            templates: templatesArray,
            updated_at: new Date()
        };
        const updatedEquipment = await Equipment.findByIdAndUpdate(
            equipmentId,
            updatedData,
            { new: true, runValidators: true }
        );
        const afterUpdate = { ...updatedEquipment.toObject() };
        const message = `Equipment "${updatedEquipment.equipment_name || updatedEquipment._id}" updated successfully.\nBefore: ${JSON.stringify(beforeUpdate)}\nAfter: ${JSON.stringify(afterUpdate)}`;
        await createNotification(req, 'Equipment', equipmentId, message, 'master');


        await logApiResponse(req, "Equipment updated successfully", 200, updatedEquipment);

        return res.status(200).json({
            message: "Equipment updated successfully",
            data: updatedEquipment
        });

    } catch (error) {
        console.error("Error editing equipment:", error);

        await logApiResponse(req, "Error editing equipment", 500, { error: error.message });

        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};





const deleteEquipment = async (req, res) => {
    try {
        const { equipmentId } = req.body; // Retrieve the ID from the URL parameter

        if (!equipmentId) {
            await logApiResponse(req, "Equipment ID is required", 400, {});
            return res.status(400).json({ message: "Equipment ID is required" });
        }

        // Use string-based _id for Cosmos DB
        const equipment = await Equipment.findOneAndDelete({ _id: String(equipmentId) });

        if (!equipment) {
            await logApiResponse(req, "Equipment not found", 404, {});
            return res.status(404).json({
                message: "Equipment not found"
            });
        }

        await logApiResponse(req, "Equipment deleted successfully", 200, {});
        res.status(200).json({
            message: "Equipment deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting equipment:", error);
        await logApiResponse(req, "Internal Server Error", 500, { error: error.message });
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};



const getAllEquipment = async (req, res) => {
    try {
        const equipments = await Equipment.find({}).lean();
        res.status(200).json({
            message: "Successfully retrieved all equipment",
            data: equipments
        });
        await logApiResponse(req, "Successfully retrieved all equipment", 200, equipments);

    } catch (error) {
        console.error("Error fetching all equipment:", {
            error: error.message,
            stack: error.stack
        });
        await logApiResponse(req, "Error fetching all equipment", 500, { error: error.message });

        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};


const downloadExcel = async (req, res) => {
    try {
        const { asset_id } = req.body;
        console.log('--- Asset ID ---', asset_id);

        // Fetch asset class attributes
        const assetClassAttributes = await assetClassAttribute.findOne({ asset_id }).lean();
        console.log('--- Asset Class Attributes ---', JSON.stringify(assetClassAttributes, null, 2));

        if (!assetClassAttributes) {
            console.log('No asset class attributes found');
            return res.status(404).json({ message: "Asset class attributes not found" });
        }

        // Fetch attribute definitions
        const attributeIds = assetClassAttributes.asset_attribute_ids.map(a => a.id);
        console.log('--- Attribute IDs ---', attributeIds);

        const fieldDefinitions = await assetAttribute
            .find({ _id: { $in: attributeIds } })
            .select('field_name display_name')
            .lean();
        console.log('--- Field Definitions ---', JSON.stringify(fieldDefinitions, null, 2));

        // Sort attributes by order
        const orderMapping = assetClassAttributes.asset_attribute_ids.reduce((acc, curr) => {
            acc[curr.id.toString()] = curr.order;
            return acc;
        }, {});
        console.log('--- Order Mapping ---', orderMapping);

        const sortedAttributes = fieldDefinitions
            .map(attr => ({
                _id: attr._id,
                field_name: attr.field_name,
                display_name: attr.display_name,
                order: orderMapping[attr._id.toString()] || Infinity
            }))
            .sort((a, b) => a.order - b.order);
        console.log('--- Sorted Attributes ---', JSON.stringify(sortedAttributes, null, 2));

        // Fetch equipments
        const equipments = await Equipment.find({ asset_id }).lean();
        console.log('--- Equipments ---', JSON.stringify(equipments, null, 2));

        if (!equipments.length) console.log('No equipments found');

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Equipments');

        // Add headers
        worksheet.columns = sortedAttributes.map(attr => ({ header: attr.display_name, width: 20 }));
        worksheet.getRow(1).font = { bold: true };
        console.log('--- Excel Headers ---', worksheet.columns.map(c => c.header));

        // Map any mismatched field_name (example: "temp" → "name")
        const fieldMapping = {
            temp: 'name' // map old field_name "temp" to actual top-level field "name"
        };

        // Add rows using top-level fields
        equipments.forEach((equipment, idx) => {
            const row = sortedAttributes.map(attr => {
                const key = fieldMapping[attr.field_name] || attr.field_name;
                return equipment[key] || '';
            });
            worksheet.addRow(row);
            console.log(`--- Row ${idx + 1} ---`, row);
        });

        worksheet.columns.forEach(column => {
            let maxLength = column.header.length;
            column.eachCell({ includeEmpty: true }, cell => {
                const cellLength = cell.value ? cell.value.toString().length : 0;
                if (cellLength > maxLength) maxLength = cellLength;
            });
            column.width = maxLength + 2;
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
        await workbook.xlsx.write(res);
        res.end();
        console.log('Excel file sent successfully');
    } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




// const downloadEquipmentExcel = async (req, res) => {
//     try {
//         const { templateId } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(templateId)) {
//             await logApiResponse(req, 'Invalid templateId format', 400, {});
//             return res.status(400).json({ message: 'Invalid templateId format' });
//         }

//         const templateObjectId = new mongoose.Types.ObjectId(templateId);

//         // Check if the template exists
//         const templateExists = await Template.findOne({ _id: templateObjectId });
//         if (!templateExists) {
//             await logApiResponse(req, 'Template not found', 404, {});
//             return res.status(404).json({ message: 'Template not found' });
//         }

//         // Get only leaf nodes for the template
//         const leafTemplateMasters = await templateMaster.find({
//             template_id: templateObjectId,
//             leaf_node: true
//         });

//         if (!leafTemplateMasters || leafTemplateMasters.length === 0) {
//             await logApiResponse(req, 'No leaf nodes found for this template', 404, {});
//             return res.status(404).json({ message: 'No leaf nodes found for this template' });
//         }

//         // Deduplicate leaf masters by master_name
//         const uniqueLeafTemplateMasters = Array.from(
//             new Set(leafTemplateMasters.map(leaf => leaf.master_name))
//         ).map(master_name => leafTemplateMasters.find(leaf => leaf.master_name === master_name));

//         // Create workbook
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Leaf Master Fields');

//         // Define columns only for leaf masters
//         worksheet.columns = uniqueLeafTemplateMasters.map(leaf => ({
//             header: leaf.master_name,
//             key: leaf.master_name,
//             width: 20
//         }));

//         // Apply auto filter
//         worksheet.autoFilter = {
//             from: 'A1',
//             to: `${String.fromCharCode(64 + worksheet.columns.length)}1`
//         };

//         // Create extra sheets for each leaf master
//         const sheetsMap = {};

//         for (const leafMaster of leafTemplateMasters) {
//             const { master_name, _id } = leafMaster;

//             if (!sheetsMap[master_name]) {
//                 sheetsMap[master_name] = workbook.addWorksheet(master_name);
//                 sheetsMap[master_name].columns = [
//                     { header: master_name, key: 'document_code', width: 30 }
//                 ];
//             }

//             // Fetch related AssetMasters for this leaf master
//             const relatedMasters = await AssetMaster.find({ template_master_id: _id });

//             relatedMasters.forEach(master => {
//                 sheetsMap[master_name].addRow([master.document_code]);
//             });
//         }

//         // Write workbook to buffer
//         const buffer = await workbook.xlsx.writeBuffer();

//         const filename = `Template-${encodeURIComponent(templateExists.template_name)}.xlsx`;

//         res.setHeader(
//             'Content-Type',
//             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//         );
//         res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

//         await logApiResponse(req, 'Excel file generated successfully', 200, { filename });
//         res.send(buffer);

//     } catch (error) {
//         console.error('Error generating Excel file for template:', error);
//         await logApiResponse(req, 'Internal Server Error', 500, { error: error.message });
//         res.status(500).json({
//             message: 'Internal Server Error',
//             errors: { message: error.message }
//         });
//     }
// };

const downloadEquipmentExcel = async (req, res) => {
    try {
        const { templateId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(templateId)) {
            await logApiResponse(req, "Invalid templateId format", 400, {});
            return res.status(400).json({ message: "Invalid templateId format" });
        }

        const templateObjectId = new mongoose.Types.ObjectId(templateId);
        const templateExists = await Template.findOne({ _id: templateObjectId });
        if (!templateExists) {
            await logApiResponse(req, "Template not found", 404, {});
            return res.status(404).json({ message: "Template not found" });
        }
        const templateDataDoc = await templateData.findOne({
            template_id: templateObjectId,
            deleted_at: null
        });

        if (!templateDataDoc) {
            await logApiResponse(req, "Template data not found", 404, {});
            return res.status(404).json({ message: "Template data not found" });
        }

        // 3️⃣ Parse structure
        let parsedStructure;
        try {
            parsedStructure = JSON.parse(templateDataDoc.structure);
        } catch (err) {
            console.error("Error parsing structure:", err);
            await logApiResponse(req, "Invalid structure format", 500, {});
            return res.status(500).json({ message: "Invalid structure format" });
        }

        // 4️⃣ Extract leaf nodes from graph
        const extractLeafNodes = (parsed) => {
            if (!parsed || typeof parsed !== "object") return [];

            const nodes = [
                ...(parsed.connectedNodes || []),
                ...(parsed.unconnectedNodes || [])
            ];
            const edges = parsed.edges || [];

            const sourceIds = new Set(edges.map(edge => edge.source));

            return nodes.filter(node => !sourceIds.has(node.id));
        };

        const leafTemplateMasters = extractLeafNodes(parsedStructure);

        if (leafTemplateMasters.length === 0) {
            await logApiResponse(req, "No leaf nodes found for this template", 404, {});
            return res.status(404).json({ message: "No leaf nodes found for this template" });
        }

        // 5️⃣ Deduplicate leaf masters by label
        const uniqueLeafTemplateMasters = Array.from(
            new Set(leafTemplateMasters.map(leaf => leaf.data?.label || leaf.id))
        ).map(label =>
            leafTemplateMasters.find(leaf => (leaf.data?.label || leaf.id) === label)
        );

        // 6️⃣ Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Leaf Master Fields");

        worksheet.columns = uniqueLeafTemplateMasters.map(leaf => ({
            header: leaf.data?.label || leaf.id,
            key: leaf.data?.label || leaf.id,
            width: 20
        }));

        worksheet.autoFilter = {
            from: "A1",
            to: `${String.fromCharCode(64 + worksheet.columns.length)}1`
        };

        // 7️⃣ Extra sheets for each leaf node
        const sheetsMap = {};

        for (const leafMaster of leafTemplateMasters) {
            const masterName = leafMaster.data?.label || leafMaster.id;
            const nodeId = leafMaster.id; // string node id from structure

            if (!sheetsMap[masterName]) {
                sheetsMap[masterName] = workbook.addWorksheet(masterName);
                sheetsMap[masterName].columns = [
                    { header: masterName, key: "document_code", width: 30 }
                ];
            }

            // ✅ Fetch related AssetMasters using node_id (string)
            const relatedMasters = await assetMaster.find({
                node_id: nodeId,
                template_id: templateObjectId
            });

            relatedMasters.forEach(master => {
                sheetsMap[masterName].addRow([master.document_code]);
            });
        }

        // 8️⃣ Write workbook to buffer
        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `Template-${encodeURIComponent(templateExists.template_name)}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

        await logApiResponse(req, "Excel file generated successfully", 200, { filename });
        res.send(buffer);

    } catch (error) {
        console.error("Error generating Excel file for template:", error);
        await logApiResponse(req, "Internal Server Error", 500, { error: error.message });
        res.status(500).json({
            message: "Internal Server Error",
            errors: { message: error.message }
        });
    }
};

// const downloadReviewEquipmentYml = async (req, res) => {
//     try {
//         const { equipmentId } = req.body;

//         // 1. Fetch equipment
//         const equipment = await Equipment.findById(equipmentId);
//         if (!equipment) {
//             await logApiResponse(req, "Equipment not found", 404, {});
//             return res.status(404).json({ message: "Equipment not found" });
//         }

//         // 2. Fetch TemplateType (use correct model + name)
//         const templateType = await templateType.findOne({
//             template_type_name: "Lineage Template",
//         });
//         if (!templateType) {
//             await logApiResponse(req, "Template Type 'Lineage Template' not found", 404, {});
//             return res.status(404).json({ message: "Template Type 'Lineage Template' not found" });
//         }

//         // 3. Extract all templateIds from equipment.templates array
//         const templateIds = (equipment.templates || [])
//             .map(t => t.template_id?.toString())
//             .filter(Boolean);

//         if (templateIds.length === 0) {
//             await logApiResponse(req, "No template_id found in equipment", 400, {});
//             return res.status(400).json({ message: "No template_id found in equipment" });
//         }

//         // 4. Fetch all lineage templates
//         const lineageTemplates = await Template.find({
//             _id: { $in: templateIds },
//             template_type_id: templateType._id.toString(),
//         });

//         if (!lineageTemplates || lineageTemplates.length === 0) {
//             await logApiResponse(req, "Lineage templates not found", 404, {});
//             return res.status(404).json({ message: "Lineage templates not found" });
//         }

//         // 5. Loop through lineageTemplates instead of single lineageTemplate
//         for (const lineageTemplate of lineageTemplates) {
//             let structure;
//             try {
//                 structure = JSON.parse(lineageTemplate.structure);
//             } catch (error) {
//                 await logApiResponse(req, "Template structure is not valid JSON.", 400, {});
//                 return res.status(400).json({ message: "Template structure is not valid JSON." });
//             }

//             if (!Array.isArray(structure) || structure.length < 2) {
//                 await logApiResponse(req, "Template structure must include nodes and edges.", 400, {});
//                 return res.status(400).json({ message: "Template structure must include nodes and edges." });
//             }
//             const eqTemplate = equipment.templates.find(
//                 t => t.template_id.toString() === lineageTemplate._id.toString()
//             );

//             if (!eqTemplate || !Array.isArray(eqTemplate.rows) || eqTemplate.rows.length === 0) {
//                 await logApiResponse(req, "The lineage template does not contain any data.", 400, {});
//                 return res.status(400).json({ message: "The lineage template does not contain any data." });
//             }

//             // ✅ use eqTemplate.rows[0] instead of wrong object indexing
//             const firstObject = eqTemplate.rows[0];
//             if (!firstObject || Object.keys(firstObject).length === 0) {
//                 await logApiResponse(req, "The first object in the lineage template is invalid or empty.", 400, {});
//                 return res.status(400).json({ message: "The first object in the lineage template is invalid or empty." });
//             }

//             const firstKey = Object.keys(firstObject)[0];
//             if (!firstKey || !firstObject[firstKey] || typeof firstObject[firstKey].text !== "string") {
//                 await logApiResponse(req, "The first key or its text property is invalid.", 400, {});
//                 return res.status(400).json({ message: "The first key or its text property is invalid." });
//             }

//             // --- (rest of your TemplateMaster + YAML logic continues here) ---
//         }

//     } catch (error) {
//         console.error("Error downloading equipment:", error);
//         await logApiResponse(req, "Internal Server Error", 500, { error: error.message });
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// };


module.exports = {
    paginatedEquipments, downloadExcel, addEquipment, updateEquipment, deleteEquipment, downloadEquipmentExcel,
}

