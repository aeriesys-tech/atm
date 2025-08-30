const mongoose = require('mongoose');
const TemplateMaster = require('../models/templateMaster');
const TemplateData = require('../models/templateData');
const { logApiResponse } = require('../utils/responseService');

const createTemplateMaster = async (req, res) => {
    try {
        const { id: template_id, templateNodeData, structure } = req.body;

        if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
            return res.status(400).json({ message: 'Invalid or missing template_id' });
        }

        const masterTests = templateNodeData.master_test || [];
        const clusters = templateNodeData.Cluster || [];
        const adis = templateNodeData.adi || [];
        const documentCodes = templateNodeData.document_code || [];

        if (!documentCodes.length) {
            return res.status(400).json({ message: 'document_code array is required' });
        }

        const recordsToInsert = [];

        for (const document_code of documentCodes) {
            const parts = document_code.split('-');
            if (parts.length < 3) continue;

            let master = null;
            let cluster = null;
            let adi = null;

            for (const part of parts) {
                if (!master) {
                    master = masterTests.find(m => m.master_test?.name === part);
                    if (master) continue;
                }
                if (!cluster && clusters.length) {
                    cluster = clusters.find(c => c.Cluster?.gh === part);
                    if (cluster) continue;
                }
                if (!adi) {
                    adi = adis.find(a => a.adi?.adi === part);
                    if (adi) continue;
                }
            }
            if (!master || !adi || (clusters.length && !cluster)) {
                console.warn(`Skipping invalid document_code: ${document_code}`, {
                    masterFound: !!master,
                    clusterFound: !!cluster,
                    adiFound: !!adi
                });
                continue;
            }

            recordsToInsert.push({
                template_id,
                master_test: master.master_test._id,
                cluster: cluster ? cluster.Cluster._id : null,
                adi: adi.adi._id,
                document_code,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null
            });
        }

        if (!recordsToInsert.length) {
            return res.status(400).json({ message: 'No valid document_code combinations found.' });
        }

        await TemplateMaster.insertMany(recordsToInsert);

        await TemplateData.findOneAndUpdate(
            { template_id },
            { $set: { structure, updated_at: new Date() } },
            { upsert: true, new: true }
        );

        return res.status(201).json({
            message: 'Records created successfully',
            count: recordsToInsert.length,
            data: recordsToInsert
        });
    } catch (error) {
        console.error('Error in createTemplateMaster:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// const getTemplatesByTemplateIDLeaf = async (req, res) => {
//     try {
//         const { template_id } = req.body;

//         if (!template_id) {
//             return res.status(400).send({ message: "template_id is required" });
//         }

//         const templateData = await TemplateData.findOne({ template_id: String(template_id) }).lean();
//         if (!templateData) {
//             return res.status(404).send({ message: "No template found for the provided template ID" });
//         }

//         let structureArray = [];
//         if (typeof templateData.structure === "string") {
//             structureArray = JSON.parse(templateData.structure);
//         } else if (Array.isArray(templateData.structure)) {
//             structureArray = templateData.structure;
//         }

//         const structure = structureArray[0] || {};
//         const nodes = structure.nodes || [];
//         const edges = structure.edges || [];

//         // Build adjacency list
//         const adjacency = {};
//         edges.forEach(edge => {
//             if (!adjacency[edge.source]) adjacency[edge.source] = [];
//             adjacency[edge.source].push(edge.target);
//         });

//         // Map id → node
//         const nodeMap = {};
//         nodes.forEach(n => nodeMap[n.id] = n);

//         // Find root nodes (not a target anywhere)
//         const targetSet = new Set(edges.map(e => e.target));
//         const rootNodes = nodes.filter(n => !targetSet.has(n.id));

//         // Collect groups
//         const groupsMap = {};

//         const dfs = (nodeId, path) => {
//             const node = nodeMap[nodeId];
//             if (!node) return;

//             const newPath = [...path, node];

//             if (!adjacency[nodeId] || adjacency[nodeId].length === 0) {
//                 // Leaf reached
//                 const leaf = node;

//                 // Build heading/group name (could be root label, or joined)
//                 const groupName = newPath.map(n => n.data?.label).join("-");

//                 if (!groupsMap[groupName]) {
//                     groupsMap[groupName] = {
//                         master_name: groupName,
//                         templates: []
//                     };
//                 }

//                 // Push leaf node info into the templates array
//                 groupsMap[groupName].templates.push({
//                     ...leaf.data, // contains your DB fields (_id, master_id, etc.)
//                     node: leaf,   // keep raw node if needed
//                     leaf_node: true
//                 });

//                 return;
//             }

//             for (const childId of adjacency[nodeId]) {
//                 dfs(childId, newPath);
//             }
//         };

//         rootNodes.forEach(root => dfs(root.id, []));

//         return res.status(200).send({
//             message: "Templates retrieved successfully",
//             groups: Object.values(groupsMap)
//         });

//     } catch (error) {
//         console.error("Failed to retrieve templates:", error);
//         res.status(500).send({
//             message: "Failed to retrieve templates",
//             error: error.toString()
//         });
//     }
// };


const getTemplatesByTemplateIDLeaf = async (req, res) => {
    try {
        const { template_id } = req.body;
        if (!template_id) return res.status(400).json({ message: "template_id is required" });

        const templateData = await TemplateData.findOne({ template_id: String(template_id) }).lean();
        if (!templateData) return res.status(404).json({ message: "No template found for the provided template ID" });

        const structureArray = Array.isArray(templateData.structure)
            ? templateData.structure
            : JSON.parse(templateData.structure || '[]');

        const structure = structureArray[0] || {};
        const nodes = structure.nodes || [];
        const edges = structure.edges || [];

        const adjacency = {};
        const parents = {};
        edges.forEach(e => {
            if (!adjacency[e.source]) adjacency[e.source] = [];
            adjacency[e.source].push(e.target);
            parents[e.target] = e.source;
        });

        const nodeMap = {};
        nodes.forEach(n => nodeMap[n.id] = n);

        const visited = new Set();
        const groups = [];

        // DFS traversal to find leaf nodes
        const dfs = (nodeId, path) => {
            const node = nodeMap[nodeId];
            if (!node) return;

            const newPath = [...path, node];
            const children = adjacency[nodeId] || [];

            if (children.length === 0) {
                // Leaf node
                const fullPathName = newPath.map(n => n.data?.label).join("-");
                groups.push({
                    master_name: fullPathName,
                    templates: [
                        {
                            node_id: node.id,
                            master_name: node.data?.label,
                            leaf_node: true,
                            heading_code: fullPathName,
                            heading_name: fullPathName,
                            data: node.data
                        }
                    ]
                });
                visited.add(nodeId);
                return;
            }

            children.forEach(childId => dfs(childId, newPath));
        };

        // Start DFS from all roots (nodes without parents)
        nodes.forEach(n => {
            if (!parents[n.id]) dfs(n.id, []);
        });

        // Include any remaining disconnected leaf nodes
        nodes.forEach(n => {
            if (!visited.has(n.id) && (!adjacency[n.id] || adjacency[n.id].length === 0)) {
                const label = n.data?.label || n.id;
                groups.push({
                    master_name: label,
                    templates: [
                        {
                            node_id: n.id,
                            master_name: label,
                            leaf_node: true,
                            heading_code: label,
                            heading_name: label,
                            data: n.data
                        }
                    ]
                });
                visited.add(n.id);
            }
        });

        return res.status(200).json({ message: "Templates retrieved successfully", groups });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to retrieve templates", error: error.toString() });
    }
};







module.exports = { createTemplateMaster, getTemplatesByTemplateIDLeaf };
