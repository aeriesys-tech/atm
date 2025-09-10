const mongoose = require('mongoose');
const TemplateMaster = require('../models/templateMaster');
const TemplateData = require('../models/templateData');
const { logApiResponse } = require('../utils/responseService');
const assetMaster = require('../models/assetMaster');
const template = require('../models/template');
const templateMaster = require('../models/templateMaster');
const templateData = require('../models/templateData');
const { createNotification } = require('../utils/notification');

const createTemplateMaster = async (req, res) => {
    try {
        const { id: template_id, templateNodeData, structure } = req.body;

        if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
            return res.status(400).json({ message: 'Invalid or missing template_id' });
        }

        const documentCodes = templateNodeData.document_code || [];
        if (!documentCodes.length) {
            return res.status(400).json({ message: 'document_code array is required' });
        }

        const nodeTypes = Object.keys(templateNodeData).filter(k => k !== "document_code");
        const recordsToInsert = [];

        for (const document_code of documentCodes) {
            const parts = document_code.split('-').map(p => p.trim().toLowerCase());
            if (!parts.length) continue;

            const record = {
                template_id,
                document_code,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            };

            let prevMatchedIds = {};
            let lastMatchedNode = null;
            let matchedAny = false;

            for (const part of parts) {
                let partMatched = false;

                for (const nodeType of nodeTypes) {
                    const nodeArray = templateNodeData[nodeType] || [];
                    if (!nodeArray.length) continue;

                    const nodeFound = nodeArray.find(obj => {
                        const data = obj[nodeType];
                        const values = Object.values(data).map(v => String(v).trim().toLowerCase());

                        const connected = Object.keys(prevMatchedIds).length === 0 ||
                            Object.values(obj[nodeType].prevSelections || {}).some(arr =>
                                arr.some(sel => Object.values(prevMatchedIds).includes(sel.id))
                            );

                        return values.includes(part) && connected;
                    });

                    if (nodeFound) {
                        record[nodeType] = nodeFound[nodeType]._id;
                        prevMatchedIds[nodeType] = nodeFound[nodeType]._id;
                        lastMatchedNode = { nodeType, id: nodeFound[nodeType]._id };
                        matchedAny = true;
                        partMatched = true;
                        break;
                    }
                }

                if (!partMatched) {
                    lastMatchedNode = null;
                    break;
                }
            }

            if (matchedAny && lastMatchedNode) {
                record.master_test = lastMatchedNode.id;
                recordsToInsert.push(record);
            } else {
                console.warn(`⚠️ Skipping ${document_code} → no valid connected chain found`);
            }
        }

        if (!recordsToInsert.length) {
            return res.status(400).json({ message: 'No valid connected document_code combinations found.' });
        }

        const insertedRecords = await TemplateMaster.insertMany(recordsToInsert);

        await TemplateData.findOneAndUpdate(
            { template_id },
            { $set: { structure, updated_at: new Date() } },
            { upsert: true, new: true }
        );

        // Notification for creation
        const message = `Template Master for Template "${template_id}" created successfully with ${insertedRecords.length} records`;
        await createNotification(req, 'Template Master', template_id, message, 'template');

        await logApiResponse(req, message, 201, insertedRecords);

        return res.status(201).json({
            message,
            count: insertedRecords.length,
            data: insertedRecords
        });

    } catch (error) {
        console.error('Error in createTemplateMaster:', error);
        await logApiResponse(req, 'Failed to create Template Master', 500, { error: error.message });
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getTemplatesByTemplateIDLeaf = async (req, res) => {
    try {
        const { template_id } = req.body;

        if (!template_id) {
            return res.status(400).send({ message: "template_id is required" });
        }

        // Fetch template data
        const templateData = await TemplateData.findOne({ template_id: String(template_id) }).lean();
        if (!templateData) {
            return res.status(404).send({ message: "No template found for the provided template ID" });
        }

        // Parse structure
        let structureArray = [];
        if (typeof templateData.structure === "string") {
            structureArray = JSON.parse(templateData.structure);
        } else if (Array.isArray(templateData.structure)) {
            structureArray = templateData.structure;
        }
        const structure = structureArray || {};

        const nodes = structure.connectedNodes || [];
        const unconnectedNodes = structure.unconnectedNodes || [];
        const edges = structure.edges || [];

        const allNodes = [...nodes, ...unconnectedNodes];

        // Build node lookup
        const nodeMap = {};
        allNodes.forEach(node => nodeMap[node.id] = node);

        // Build adjacency list
        const adjacency = {};
        edges.forEach(edge => {
            if (!adjacency[edge.source]) adjacency[edge.source] = [];
            adjacency[edge.source].push(edge.target);
        });

        // Root nodes = nodes that are not target of any edge
        const targetSet = new Set(edges.map(e => e.target));
        const rootNodes = nodes.filter(n => !targetSet.has(n.id));

        const groupsMap = {};

        // helper: extract node references from TemplateMaster doc
        const extractNodeRefs = (doc) => {
            const nodeRefs = {};
            for (const key of Object.keys(doc)) {
                if (["_id", "template_id", "document_code", "created_at", "updated_at", "deleted_at", "__v"].includes(key)) continue;
                nodeRefs[key] = doc[key];
            }
            return nodeRefs;
        };

        // DFS traversal
        const dfs = async (nodeId, path) => {
            const node = nodeMap[nodeId];
            if (!node) return;

            const newPath = [...path, node];

            // If leaf node
            if (!adjacency[nodeId] || adjacency[nodeId].length === 0) {
                const leafDataArray = node.data.selectedData || [];
                const documentCodesSet = new Set();

                for (const item of leafDataArray) {
                    const fieldName = Object.keys(item)[0];
                    const leafObj = item[fieldName];
                    if (!leafObj?._id) continue;

                    // Build query
                    const query = { template_id, deleted_at: null };
                    query[fieldName] = leafObj._id;

                    if (leafObj.prevSelections) {
                        for (const key of Object.keys(leafObj.prevSelections)) {
                            const prevSelectionIds = leafObj.prevSelections[key].map(s => s.id);
                            query[key] = { $in: prevSelectionIds };
                        }
                    }

                    const templateDoc = await TemplateMaster.findOne(query).lean();

                    if (templateDoc) {
                        const nodeRefs = extractNodeRefs(templateDoc);

                        documentCodesSet.add(JSON.stringify({
                            code: templateDoc.document_code,
                            node_ids: nodeRefs
                        }));

                        leafObj.documentcode = templateDoc.document_code;
                        leafObj.node_ids = nodeRefs;
                    } else {
                        leafObj.documentcode = "";
                    }
                }

                const groupName = newPath.map(n => n.data?.label).join("-");

                if (!groupsMap[groupName]) {
                    groupsMap[groupName] = { master_name: groupName, templates: [] };
                }

                groupsMap[groupName].templates.push({
                    ...node.data,
                    node,
                    leaf_node: true,
                    document_codes: Array.from(documentCodesSet).map(dc => JSON.parse(dc))
                });

                return;
            }

            // Traverse children
            for (const childId of adjacency[nodeId] || []) {
                await dfs(childId, newPath);
            }
        };

        // Traverse all root nodes
        for (const root of rootNodes) {
            await dfs(root.id, []);
        }

        // Handle unconnected nodes
        for (const node of unconnectedNodes) {
            const leafDataArray = node.data.selectedData || [];
            const documentCodesSet = new Set();

            for (const item of leafDataArray) {
                const fieldName = Object.keys(item)[0];
                const leafId = item[fieldName]?._id;

                const templateDoc = await TemplateMaster.findOne({
                    template_id,
                    [fieldName]: leafId,
                    deleted_at: null
                }).lean();

                if (templateDoc) {
                    const nodeRefs = extractNodeRefs(templateDoc);

                    documentCodesSet.add(JSON.stringify({
                        code: templateDoc.document_code,
                        node_ids: nodeRefs
                    }));

                    if (item[fieldName]) {
                        item[fieldName].documentcode = templateDoc.document_code;
                        item[fieldName].node_ids = nodeRefs;
                    }
                } else {
                    if (item[fieldName]) {
                        item[fieldName].documentcode = "";
                    }
                }
            }

            const groupName = node.data?.label || "Standalone Node";

            if (!groupsMap[groupName]) {
                groupsMap[groupName] = { master_name: groupName, templates: [] };
            }

            groupsMap[groupName].templates.push({
                ...node.data,
                node,
                leaf_node: true,
                document_codes: Array.from(documentCodesSet).map(dc => JSON.parse(dc))
            });
        }

        return res.status(200).send({
            message: "Templates retrieved successfully",
            groups: Object.values(groupsMap)
        });

    } catch (error) {
        console.error("Failed to retrieve templates:", error);
        return res.status(500).send({
            message: "Failed to retrieve templates",
            error: error.toString()
        });
    }
};


const getTemplatesByTemplateIDLeafGroup = async (req, res) => {
    try {
        const { template_id, asset_id } = req.body;

        if (!asset_id) {
            return res.status(400).send({ message: "asset_id is required" });
        }
        if (!template_id) {
            return res.status(400).send({ message: "template_id is required" });
        }

        console.log("Received template_id:", template_id, "asset_id:", asset_id);

        // Fetch asset masters linked with asset_id
        const assetMasters = await assetMaster.find({ asset_id }).lean();
        console.log("Fetched assetMasters:", assetMasters);

        // Collect linked template_master_ids
        const linkedMasterIds = assetMasters
            .map(a => a.template_master_id)
            .filter(Boolean);
        console.log("Linked template_master_ids:", linkedMasterIds);

        // Fetch template data (structure)
        const temp = await templateData.findOne({ template_id }).lean();
        if (!temp || !temp.structure) {
            console.log("No template data found for template_id:", template_id);
            return res.status(404).send({ message: "No template data found" });
        }

        const structure = typeof temp.structure === "string"
            ? JSON.parse(temp.structure)
            : temp.structure;
        console.log("Parsed structure:", structure);

        // Combine all nodes
        const allNodes = [...(structure.connectedNodes || []), ...(structure.unconnectedNodes || [])];
        console.log("All nodes combined:", allNodes);

        // Map nodeId => node
        const nodeMap = {};
        allNodes.forEach(n => nodeMap[n.id] = n);
        console.log("Node map created:", nodeMap);

        const parentMap = {};
        (structure.edges || []).forEach(e => {
            parentMap[e.target] = e.source;
        });
        console.log("Parent map created:", parentMap);
        const getNodePath = (nodeId) => {
            const node = nodeMap[nodeId];
            if (!node) return "";
            const parentId = parentMap[nodeId];
            if (parentId) return `${getNodePath(parentId)}-${node.data?.label || ""}`;
            return node.data?.label || "";
        };

        const sources = new Set((structure.edges || []).map(e => e.source));
        const leafNodes = allNodes.filter(n => !sources.has(n.id));
        console.log("Identified leaf nodes:", leafNodes);

        const responseData = leafNodes.map(leaf => {
            const heading = getNodePath(leaf.id);

            const matchedMaster = assetMasters.find(
                am => String(am.template_master_id) === String(leaf.data.template_master_code)
            );

            return {
                node_id: leaf.id,
                node_label: leaf.data.label,
                heading_name: heading,
                template_master_code: leaf.data.template_master_code,
                master_id: matchedMaster?._id || null,
                template_master_id: matchedMaster?.template_master_id || null,
                document_code: matchedMaster?.document_code || null
            };
        });

        console.log("Final response data:", responseData);

        res.status(200).send({
            message: "Templates retrieved successfully",
            leaf_nodes: responseData
        });

    } catch (error) {
        console.error("Failed to retrieve templates:", error);
        res.status(500).send({
            message: "Failed to retrieve templates",
            error: error.toString()
        });
    }
};

module.exports = { createTemplateMaster, getTemplatesByTemplateIDLeaf, getTemplatesByTemplateIDLeafGroup };
