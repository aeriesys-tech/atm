const mongoose = require('mongoose');
const TemplateMaster = require('../models/templateMaster');
const TemplateData = require('../models/templateData');
const { logApiResponse } = require('../utils/responseService');
const assetMaster = require('../models/assetMaster');
const template = require('../models/template');
const templateMaster = require('../models/templateMaster');
const templateData = require('../models/templateData');

// const createTemplateMaster = async (req, res) => {
//     try {
//         const { id: template_id, templateNodeData, structure } = req.body;

//         if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
//             return res.status(400).json({ message: 'Invalid or missing template_id' });
//         }

//         const masterTests = templateNodeData.master_test || [];
//         const clusters = templateNodeData.Cluster || [];
//         const adis = templateNodeData.adi || [];
//         const documentCodes = templateNodeData.document_code || [];

//         if (!documentCodes.length) {
//             return res.status(400).json({ message: 'document_code array is required' });
//         }

//         const recordsToInsert = [];

//         for (const document_code of documentCodes) {
//             const parts = document_code.split('-');
//             if (parts.length < 3) continue;

//             let master = null;
//             let cluster = null;
//             let adi = null;

//             for (const part of parts) {
//                 if (!master) {
//                     master = masterTests.find(m => m.master_test?.name === part);
//                     if (master) continue;
//                 }
//                 if (!cluster && clusters.length) {
//                     cluster = clusters.find(c => c.Cluster?.gh === part);
//                     if (cluster) continue;
//                 }
//                 if (!adi) {
//                     adi = adis.find(a => a.adi?.adi === part);
//                     if (adi) continue;
//                 }
//             }
//             if (!master || !adi || (clusters.length && !cluster)) {
//                 console.warn(`Skipping invalid document_code: ${document_code}`, {
//                     masterFound: !!master,
//                     clusterFound: !!cluster,
//                     adiFound: !!adi
//                 });
//                 continue;
//             }

//             recordsToInsert.push({
//                 template_id,
//                 master_test: master.master_test._id,
//                 cluster: cluster ? cluster.Cluster._id : null,
//                 adi: adi.adi._id,
//                 document_code,
//                 created_at: new Date(),
//                 updated_at: new Date(),
//                 deleted_at: null
//             });
//         }

//         if (!recordsToInsert.length) {
//             return res.status(400).json({ message: 'No valid document_code combinations found.' });
//         }

//         await TemplateMaster.insertMany(recordsToInsert);

//         await TemplateData.findOneAndUpdate(
//             { template_id },
//             { $set: { structure, updated_at: new Date() } },
//             { upsert: true, new: true }
//         );

//         return res.status(201).json({
//             message: 'Records created successfully',
//             count: recordsToInsert.length,
//             data: recordsToInsert
//         });
//     } catch (error) {
//         console.error('Error in createTemplateMaster:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

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

// const createTemplateMaster = async (req, res) => {
//     try {
//         const { id: template_id, templateNodeData, structure } = req.body;

//         if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
//             return res.status(400).json({ message: 'Invalid or missing template_id' });
//         }

//         const documentCodes = templateNodeData.document_code || [];
//         if (!documentCodes.length) {
//             return res.status(400).json({ message: 'document_code array is required' });
//         }

//         const nodeTypes = Object.keys(templateNodeData).filter(k => k !== "document_code");
//         const recordsToInsert = [];

//         for (const document_code of documentCodes) {
//             const parts = document_code.split('-').map(p => p.trim().toLowerCase());
//             if (!parts.length) continue;

//             const record = {
//                 template_id,
//                 document_code,
//                 created_at: new Date(),
//                 updated_at: new Date(),
//                 deleted_at: null
//             };

//             let matchedAny = false;

//             for (const nodeType of nodeTypes) {
//                 const nodeArray = templateNodeData[nodeType] || [];
//                 if (!nodeArray.length) continue;

//                 const nodeFound = nodeArray.find(obj => {
//                     const data = obj[nodeType];
//                     return Object.values(data).some(v =>
//                         parts.includes(String(v).trim().toLowerCase())
//                     );
//                 });

//                 if (nodeFound) {
//                     matchedAny = true;
//                     record[nodeType] = nodeFound[nodeType]._id;
//                 }
//             }

//             if (matchedAny) {
//                 recordsToInsert.push(record);
//             } else {
//                 console.warn(`⚠️ Skipping ${document_code} → no matches found in any node type`);
//             }
//         }

//         if (!recordsToInsert.length) {
//             return res.status(400).json({ message: 'No valid document_code combinations found.' });
//         }

//         await TemplateMaster.insertMany(recordsToInsert);

//         await TemplateData.findOneAndUpdate(
//             { template_id },
//             { $set: { structure, updated_at: new Date() } },
//             { upsert: true, new: true }
//         );

//         return res.status(201).json({
//             message: 'Records created successfully',
//             count: recordsToInsert.length,
//             data: recordsToInsert
//         });

//     } catch (error) {
//         console.error('Error in createTemplateMaster:', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

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

            let prevMatchedIds = {}; // track previous node IDs for chain validation
            let lastMatchedNode = null;
            let matchedAny = false;

            // Traverse parts to match nodes in order
            for (const part of parts) {
                let partMatched = false;

                for (const nodeType of nodeTypes) {
                    const nodeArray = templateNodeData[nodeType] || [];
                    if (!nodeArray.length) continue;

                    const nodeFound = nodeArray.find(obj => {
                        const data = obj[nodeType];
                        const values = Object.values(data).map(v => String(v).trim().toLowerCase());

                        // Only consider nodes that are connected to previous selection
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
                        break; // move to next part
                    }
                }

                if (!partMatched) {
                    // stop processing if part is not connected
                    lastMatchedNode = null;
                    break;
                }
            }

            // Only store if there is a valid chain and assign last node as master_test
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

//         // Fetch template data
//         const templateData = await TemplateData.findOne({ template_id: String(template_id) }).lean();
//         if (!templateData) {
//             return res.status(404).send({ message: "No template found for the provided template ID" });
//         }

//         // Parse structure
//         let structureArray = [];
//         if (typeof templateData.structure === "string") {
//             structureArray = JSON.parse(templateData.structure);
//         } else if (Array.isArray(templateData.structure)) {
//             structureArray = templateData.structure;
//         }
//         const structure = structureArray || {};

//         const nodes = structure.connectedNodes || [];
//         const unconnectedNodes = structure.unconnectedNodes || [];
//         const edges = structure.edges || [];

//         const allNodes = [...nodes, ...unconnectedNodes];

//         // Build node lookup
//         const nodeMap = {};
//         allNodes.forEach(node => nodeMap[node.id] = node);

//         // Build adjacency list
//         const adjacency = {};
//         edges.forEach(edge => {
//             if (!adjacency[edge.source]) adjacency[edge.source] = [];
//             adjacency[edge.source].push(edge.target);
//         });

//         // Root nodes = nodes that are not target of any edge
//         const targetSet = new Set(edges.map(e => e.target));
//         const rootNodes = nodes.filter(n => !targetSet.has(n.id));

//         const groupsMap = {};

//         // DFS to traverse and fetch document_code from DB
//         const dfs = async (nodeId, path) => {
//             const node = nodeMap[nodeId];
//             if (!node) return;

//             const newPath = [...path, node];

//             // If leaf node
//             if (!adjacency[nodeId] || adjacency[nodeId].length === 0) {
//                 const leafData = node.data.selectedData?.[0] || {};
//                 const fieldName = Object.keys(leafData)[0]; // e.g., master_test, adidf, Section
//                 const leafId = leafData[fieldName]?._id;
//                 console.log("leafIdddddd", leafId)
//                 // Fetch actual document_code from TemplateMaster
//                 const templateDoc = await TemplateMaster.findOne({
//                     template_id,
//                     [fieldName]: leafId,
//                     deleted_at: null
//                 }).lean();

//                 console.log("template Doccccc", templateDoc);

//                 const documentCode = templateDoc?.document_code || newPath.map(n => n.data?.label).join("-");

//                 const groupName = newPath.map(n => n.data?.label).join("-");

//                 if (!groupsMap[groupName]) {
//                     groupsMap[groupName] = { master_name: groupName, templates: [] };
//                 }

//                 groupsMap[groupName].templates.push({
//                     ...node.data,
//                     node,
//                     leaf_node: true,
//                     document_code: documentCode
//                 });

//                 return;
//             }

//             // Traverse children
//             for (const childId of adjacency[nodeId] || []) {
//                 await dfs(childId, newPath);
//             }
//         };

//         // Traverse all root nodes
//         for (const root of rootNodes) {
//             await dfs(root.id, []);
//         }

//         // Handle unconnected nodes
//         for (const node of unconnectedNodes) {
//             const leafData = node.data.selectedData?.[0] || {};
//             const fieldName = Object.keys(leafData)[0];
//             const leafId = leafData[fieldName]?._id;

//             const templateDoc = await TemplateMaster.findOne({
//                 template_id,
//                 [fieldName]: leafId,
//                 deleted_at: null
//             }).lean();

//             const documentCode = templateDoc?.document_code || node.data?.label;
//             const groupName = node.data?.label || "Standalone Node";

//             if (!groupsMap[groupName]) {
//                 groupsMap[groupName] = { master_name: groupName, templates: [] };
//             }

//             groupsMap[groupName].templates.push({
//                 ...node.data,
//                 node,
//                 leaf_node: true,
//                 document_code: documentCode
//             });
//         }

//         return res.status(200).send({
//             message: "Templates retrieved successfully",
//             groups: Object.values(groupsMap)
//         });

//     } catch (error) {
//         console.error("Failed to retrieve templates:", error);
//         return res.status(500).send({
//             message: "Failed to retrieve templates",
//             error: error.toString()
//         });
//     }
// };

// const getTemplatesByTemplateIDLeaf = async (req, res) => {
//     try {
//         const { template_id } = req.body;

//         if (!template_id) {
//             return res.status(400).send({ message: "template_id is required" });
//         }

//         // Fetch template data
//         const templateData = await TemplateData.findOne({ template_id: String(template_id) }).lean();
//         if (!templateData) {
//             return res.status(404).send({ message: "No template found for the provided template ID" });
//         }

//         // Parse structure
//         let structureArray = [];
//         if (typeof templateData.structure === "string") {
//             structureArray = JSON.parse(templateData.structure);
//         } else if (Array.isArray(templateData.structure)) {
//             structureArray = templateData.structure;
//         }
//         const structure = structureArray || {};

//         const nodes = structure.connectedNodes || [];
//         const unconnectedNodes = structure.unconnectedNodes || [];
//         const edges = structure.edges || [];

//         const allNodes = [...nodes, ...unconnectedNodes];

//         // Build node lookup
//         const nodeMap = {};
//         allNodes.forEach(node => nodeMap[node.id] = node);

//         // Build adjacency list
//         const adjacency = {};
//         edges.forEach(edge => {
//             if (!adjacency[edge.source]) adjacency[edge.source] = [];
//             adjacency[edge.source].push(edge.target);
//         });

//         // Root nodes = nodes that are not target of any edge
//         const targetSet = new Set(edges.map(e => e.target));
//         const rootNodes = nodes.filter(n => !targetSet.has(n.id));

//         const groupsMap = {};

//         // DFS to traverse and fetch document_code from DB
//         // DFS to traverse and fetch document_code from DB
//         const dfs = async (nodeId, path) => {
//             const node = nodeMap[nodeId];
//             if (!node) return;

//             const newPath = [...path, node];

//             // If leaf node
//             if (!adjacency[nodeId] || adjacency[nodeId].length === 0) {
//                 const leafDataArray = node.data.selectedData || [];
//                 const documentCodesSet = new Set();

//                 for (const item of leafDataArray) {
//                     const fieldName = Object.keys(item)[0];
//                     const leafObj = item[fieldName];
//                     if (!leafObj?._id) continue;

//                     // Build query for all prevSelections + current leaf _id
//                     const query = { template_id, deleted_at: null };
//                     query[fieldName] = leafObj._id;

//                     // Add previous selections if present
//                     if (leafObj.prevSelections) {
//                         for (const key of Object.keys(leafObj.prevSelections)) {
//                             const prevSelectionIds = leafObj.prevSelections[key].map(s => s.id);
//                             query[key] = { $in: prevSelectionIds };
//                         }
//                     }

//                     // Fetch TemplateMaster document
//                     const templateDoc = await TemplateMaster.findOne(query).lean();

//                     if (templateDoc) {
//                         documentCodesSet.add(templateDoc.document_code);
//                         leafObj.documentcode = templateDoc.document_code;
//                     } else {
//                         leafObj.documentcode = "";
//                     }
//                 }

//                 const groupName = newPath.map(n => n.data?.label).join("-");

//                 if (!groupsMap[groupName]) {
//                     groupsMap[groupName] = { master_name: groupName, templates: [] };
//                 }

//                 groupsMap[groupName].templates.push({
//                     ...node.data,
//                     node,
//                     leaf_node: true,
//                     document_codes: Array.from(documentCodesSet)
//                 });

//                 return;
//             }

//             // Traverse children
//             for (const childId of adjacency[nodeId] || []) {
//                 await dfs(childId, newPath);
//             }
//         };


//         // Traverse all root nodes
//         for (const root of rootNodes) {
//             await dfs(root.id, []);
//         }

//         // Handle unconnected nodes
//         for (const node of unconnectedNodes) {
//             const leafDataArray = node.data.selectedData || [];
//             const documentCodesSet = new Set();

//             for (const item of leafDataArray) {
//                 const fieldName = Object.keys(item)[0];
//                 const leafId = item[fieldName]?._id;

//                 const templateDoc = await TemplateMaster.findOne({
//                     template_id,
//                     [fieldName]: leafId,
//                     deleted_at: null
//                 }).lean();

//                 if (templateDoc) {
//                     documentCodesSet.add(templateDoc.document_code);
//                     if (item[fieldName]) {
//                         item[fieldName].documentcode = templateDoc.document_code;
//                     }
//                 } else {
//                     if (item[fieldName]) {
//                         item[fieldName].documentcode = "";
//                     }
//                 }
//             }

//             const groupName = node.data?.label || "Standalone Node";

//             if (!groupsMap[groupName]) {
//                 groupsMap[groupName] = { master_name: groupName, templates: [] };
//             }

//             groupsMap[groupName].templates.push({
//                 ...node.data,
//                 node,
//                 leaf_node: true,
//                 document_codes: Array.from(documentCodesSet)
//             });
//         }

//         return res.status(200).send({
//             message: "Templates retrieved successfully",
//             groups: Object.values(groupsMap)
//         });

//     } catch (error) {
//         console.error("Failed to retrieve templates:", error);
//         return res.status(500).send({
//             message: "Failed to retrieve templates",
//             error: error.toString()
//         });
//     }
// };

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



// const getTemplatesByTemplateIDLeafGroup = async (req, res) => {
//     try {
//         const { template_id } = req.body;
//         const { asset_id } = req.body;

//         if (!asset_id) {
//             return res.status(400).send({
//                 message: "asset_id is required"
//             });
//         }

//         // Ensure template_id is cast correctly (Cosmos may store it as ObjectId)
//         const templateObjectId = mongoose.Types.ObjectId.isValid(template_id)
//             ? new mongoose.Types.ObjectId(template_id)
//             : template_id;
//         console.log("11111111111");
//         // Fetch asset masters linked with asset_id
//         const assetMasters = await assetMaster.find({ asset_id })
//             .populate("template_master_id")
//             .lean();
//         console.log("222222222", assetMasters);
//         // Collect linked template_master_ids
//         const linkedMasterIds = new Set();
//         assetMasters.forEach(assetMaster => {
//             if (assetMaster.template_master_id) {
//                 linkedMasterIds.add(String(assetMaster.template_master_id._id));
//             }
//         });
//         console.log("333333333333333");
//         console.log("templateIDDDDDDDDDD", templateObjectId)
//         // Fetch leaf template masters for the given template_id
//         const temp = await templateData.findOne({ template_id: templateObjectId }).lean();
//         console.log("structureeeeee", temp);
//         if (temp?.structure) {
//             const structure = JSON.parse(temp.structure);

//             // Combine all nodes in one array
//             const allNodes = [
//                 ...(structure.connectedNodes || []),
//                 ...(structure.unconnectedNodes || [])
//             ];

//             // Example 1: filter by type (if you really expect type=leaf somewhere)
//             const leafTypeNodes = allNodes.filter(n => n.type === "leaf");

//             // Example 2: infer leaf nodes as those not appearing as a `source` in edges
//             const sources = new Set((structure.edges || []).map(e => e.source));
//             const leafNodes = allNodes.filter(n => !sources.has(n.id));

//             console.log("Leaf nodes:", leafNodes);
//         }

//         // console.log("444444444444444", temp);

//         // console.log("structureee", temp.structure);
//         const templateMasters = await templateMaster.find({
//             template_id: templateObjectId,
//         }).lean();
//         // console.log("55555555", templateMasters);

//         const uniqueMastersSet = new Set();
//         const uniqueMasters = [];

//         templateMasters.forEach(master => {
//             if (linkedMasterIds.has(String(master._id))) {
//                 const masterKey = `${master.master_id}-${master.master_name}-${master.heading_name || ""}`;
//                 if (!uniqueMastersSet.has(masterKey)) {
//                     uniqueMastersSet.add(masterKey);
//                     uniqueMasters.push({
//                         master_id: master.master_id,
//                         master_name: master.master_name,
//                         heading_name: master.heading_name || null,
//                         independent: master.hasCombination ? false : true
//                     });
//                 }
//             }
//         });

//         // Sorting: dependent first, independent later, then alphabetically by name
//         uniqueMasters.sort((a, b) => {
//             if (a.independent && !b.independent) return 1;
//             if (!a.independent && b.independent) return -1;
//             return a.master_name.localeCompare(b.master_name);
//         });

//         // Response payload (exclude independent if not needed in frontend)
//         const responseData = uniqueMasters.map(({ master_id, master_name, heading_name }) => ({
//             master_id,
//             master_name,
//             heading_name
//         }));

//         await logApiResponse(req, "Templates retrieved successfully", 200, responseData);
//         res.status(200).send({
//             message: "Templates retrieved successfully",
//             data: responseData
//         });

//     } catch (error) {
//         console.error("Failed to retrieve templates:", error);
//         await logApiResponse(req, "Failed to retrieve templates", 500, {
//             message: "Failed to retrieve templates",
//             error: error.toString()
//         });
//         res.status(500).send({
//             message: "Failed to retrieve templates",
//             error: error.toString()
//         });
//     }
// };


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

        // Map childId => parentId
        const parentMap = {};
        (structure.edges || []).forEach(e => {
            parentMap[e.target] = e.source;
        });
        console.log("Parent map created:", parentMap);

        // Function to get full path for a node
        const getNodePath = (nodeId) => {
            const node = nodeMap[nodeId];
            if (!node) return "";
            const parentId = parentMap[nodeId];
            if (parentId) return `${getNodePath(parentId)}-${node.data?.label || ""}`;
            return node.data?.label || "";
        };

        // Identify leaf nodes (nodes that are not source in edges)
        const sources = new Set((structure.edges || []).map(e => e.source));
        const leafNodes = allNodes.filter(n => !sources.has(n.id));
        console.log("Identified leaf nodes:", leafNodes);

        // Build response with heading_name + template_master_id
        const responseData = leafNodes.map(leaf => {
            const heading = getNodePath(leaf.id);

            // Match assetMaster for this leaf
            const matchedMaster = assetMasters.find(
                am => String(am.template_master_id) === String(leaf.data.template_master_code)
            );

            return {
                node_id: leaf.id,
                node_label: leaf.data.label,
                heading_name: heading,
                template_master_code: leaf.data.template_master_code,
                master_id: matchedMaster?._id || null,                // assetMaster _id
                template_master_id: matchedMaster?.template_master_id || null, // <-- Added
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
