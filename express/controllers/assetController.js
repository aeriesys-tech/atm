const Asset = require('../models/asset');
// const Equipment = require('../models/equipment');
const Master = require('../models/master');
const mongoose = require('mongoose');
const MasterField = require('../models/masterField');
const AssetClassAttribute = require('../models/assetClassAttribute');
const Template = require('../models/template');
// const AssetConfiguration = require("../models/assetConfiguration")
const { logApiResponse } = require('../utils/responseService');
const { createNotification } = require('../utils/notification');

const addAsset = async (req, res) => {
    try {
        const { asset_code, asset_name, structure } = req.body;

        let validationErrors = {};
        let combinedErrorMessage = [];


        // Validate asset_code
        if (!asset_code) {
            validationErrors.asset_code = 'Asset code is required';
            combinedErrorMessage.push('Asset code is required');
        } else {
            // Check if the asset code already exists
            const existingAsset = await Asset.findOne({ asset_code });
            if (existingAsset) {
                validationErrors.asset_code = 'Asset code already exists';
            }
        }

        // Validate asset_name
        if (!asset_name) {
            validationErrors.asset_name = 'Asset name is required';
            combinedErrorMessage.push('Asset name is required');
        } else {
            // Check if the asset name already exists
            const existingAsset = await Asset.findOne({ asset_name });
            if (existingAsset) {
                validationErrors.asset_name = 'Asset name already exists';
            }
        }

        // If there are validation errors, return them
        if (Object.keys(validationErrors).length > 0) {
            let errorMessage = "Validation Error";

            // Custom error message for asset_code and asset_name
            if (validationErrors.asset_code && validationErrors.asset_name) {
                errorMessage = 'Asset code & Asset name are required';
            } else if (validationErrors.asset_code) {
                errorMessage = validationErrors.asset_code;
            } else if (validationErrors.asset_name) {
                errorMessage = validationErrors.asset_name;
            }
            await logApiResponse(req, { message: errorMessage }, 400, { errors: validationErrors });
            return res.status(400).json({
                message: errorMessage,
                errors: validationErrors
            });
        }

        // Create a new Asset instance
        const newAsset = new Asset({
            asset_code,
            asset_name,
            structure,
        });

        await newAsset.save();
        await logApiResponse(req, "Asset created successfully", 201, { data: newAsset });
        res.status(201).send({ message: 'Asset created successfully', data: newAsset });
    } catch (error) {
        if (error.name === 'ValidationError') {
            let errors = {};
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            await logApiResponse(req, "Validation Error", 400, { errors });
            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else if (error.code === 11000) { // Handle duplicate key error
            let errors = {};
            if (error.keyPattern.asset_code) {
                errors.asset_code = "Asset code must be unique";
            }
            if (error.keyPattern.asset_name) {
                errors.asset_name = "Asset name must be unique";
            }
            await logApiResponse(req, "Validation Error", 400, { errors });
            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else {
            await logApiResponse(req, "Failed to create asset", 500, { error: error.message });
            res.status(500).send({ message: 'Failed to create asset', error: error.message });
        }
    }
};

const updateAsset = async (req, res) => {
    const { asset_id, asset_code, asset_name, structure, status, deleted_at } = req.body;

    try {
        let validationErrors = {};
        let combinedErrorMessage = [];

        // ✅ Validate asset_id (now the main identifier)
        if (!asset_id || !mongoose.Types.ObjectId.isValid(asset_id)) {
            validationErrors.asset_id = "Invalid asset ID";
            combinedErrorMessage.push("Invalid asset ID");
        }

        // ✅ Validate asset_code uniqueness
        if (!asset_code) {
            validationErrors.asset_code = "Asset code is required";
            combinedErrorMessage.push("Asset code is required");
        } else {
            const existingAssetCode = await Asset.findOne({
                asset_code,
                _id: { $ne: asset_id } // exclude the same asset
            });
            if (existingAssetCode) {
                validationErrors.asset_code = "Asset code already exists";
                combinedErrorMessage.push("Asset code already exists");
            }
        }

        // ✅ Validate asset_name uniqueness
        if (!asset_name) {
            validationErrors.asset_name = "Asset name is required";
            combinedErrorMessage.push("Asset name is required");
        } else {
            const existingAssetName = await Asset.findOne({
                asset_name,
                _id: { $ne: asset_id }
            });
            if (existingAssetName) {
                validationErrors.asset_name = "Asset name already exists";
                combinedErrorMessage.push("Asset name already exists");
            }
        }

        // ✅ Return validation errors if any
        if (Object.keys(validationErrors).length > 0) {
            const errorMessage = {
                message: combinedErrorMessage.join(", "),
                errors: validationErrors
            };
            await logApiResponse(req, "Validation Error", 400, errorMessage);
            return res.status(400).json(errorMessage);
        }

        // ✅ Parse structure (optional check)
        const newTemplateIds = [];
        if (structure) {
            try {
                const parsedStructure = JSON.parse(structure);
                parsedStructure.forEach((item) => {
                    if (item.nodes) {
                        item.nodes.forEach((node) => {
                            if (node.id) newTemplateIds.push(node.id);
                        });
                    }
                });
            } catch (err) {
                validationErrors.structure = "Invalid structure JSON";
                const errorMessage = {
                    message: "Invalid structure JSON",
                    errors: validationErrors
                };
                await logApiResponse(req, "Validation Error", 400, errorMessage);
                return res.status(400).json(errorMessage);
            }
        }

        // ✅ Update the asset using asset_id
        const updatedAsset = await Asset.findOneAndUpdate(
            { _id: asset_id }, // find by asset_id
            {
                asset_code,
                asset_name,
                structure,
                status,
                deleted_at,
                updated_at: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!updatedAsset) {
            const errorMessage = {
                message: "Asset not found",
                errors: { asset_id: "Asset not found" }
            };
            await logApiResponse(req, errorMessage.message, 404, errorMessage);
            return res.status(404).json(errorMessage);
        }

        await logApiResponse(req, "Asset updated successfully", 200, updatedAsset);
        return res.status(200).json({
            message: "Asset updated successfully",
            data: updatedAsset
        });

    } catch (error) {
        console.error("Error updating asset:", error);
        let errors = {};

        // ✅ Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
            });
            const errorMessage = {
                message: Object.values(errors).join(", "),
                errors
            };
            await logApiResponse(req, "Validation Error", 400, errorMessage);
            return res.status(400).json(errorMessage);
        }

        // ✅ Handle duplicate key errors
        if (error.code === 11000) {
            if (error.keyPattern?.asset_code) {
                errors.asset_code = "Asset code must be unique";
            }
            if (error.keyPattern?.asset_name) {
                errors.asset_name = "Asset name must be unique";
            }
            const errorMessage = {
                message: Object.values(errors).join(", "),
                errors
            };
            await logApiResponse(req, "Duplicate Key Error", 400, errorMessage);
            return res.status(400).json(errorMessage);
        }

        // ✅ Handle unexpected errors
        const internalError = {
            message: "Internal Server Error",
            errors: { message: "An unexpected error occurred" }
        };
        await logApiResponse(req, internalError.message, 500, internalError);
        return res.status(500).json(internalError);
    }
};



// const updateAsset = async (req, res) => {
//     const { id } = req.body; // Asset ID
//     const { asset_id, asset_code, asset_name, structure, status, deleted_at } = req.body;

//     try {
//         let validationErrors = {};
//         let combinedErrorMessage = [];

//         // Validate asset ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             validationErrors.id = "Invalid asset ID";
//             combinedErrorMessage.push("Invalid asset ID");
//         }

//         // Validate related asset_id
//         if (asset_id && !mongoose.Types.ObjectId.isValid(asset_id)) {
//             validationErrors.asset_id = "Invalid related asset ID";
//             combinedErrorMessage.push("Invalid related asset ID");
//         }

//         // Validate asset_code uniqueness
//         if (!asset_code) {
//             validationErrors.asset_code = "Asset code is required";
//             combinedErrorMessage.push("Asset code is required");
//         } else {
//             const existingAssetCode = await Asset.findOne({
//                 asset_code,
//                 _id: { $ne: id } // Exclude current asset from duplicate check
//             });
//             if (existingAssetCode) {
//                 validationErrors.asset_code = "Asset code already exists";
//                 combinedErrorMessage.push("Asset code already exists");
//             }
//         }

//         // Validate asset_name uniqueness
//         if (!asset_name) {
//             validationErrors.asset_name = "Asset name is required";
//             combinedErrorMessage.push("Asset name is required");
//         } else {
//             const existingAssetName = await Asset.findOne({
//                 asset_name,
//                 _id: { $ne: id }
//             });
//             if (existingAssetName) {
//                 validationErrors.asset_name = "Asset name already exists";
//                 combinedErrorMessage.push("Asset name already exists");
//             }
//         }

//         // If validation errors found
//         if (Object.keys(validationErrors).length > 0) {
//             const errorMessage = {
//                 message: combinedErrorMessage.join(", "),
//                 errors: validationErrors
//             };
//             await logApiResponse(req, "Validation Error", 400, errorMessage);
//             return res.status(400).json(errorMessage);
//         }

//         // Parse structure to get template IDs
//         const newTemplateIds = [];
//         if (structure) {
//             const parsedStructure = JSON.parse(structure);
//             parsedStructure.forEach((item) => {
//                 if (item.nodes) {
//                     item.nodes.forEach((node) => {
//                         if (node.id) newTemplateIds.push(node.id);
//                     });
//                 }
//             });
//         }

//         // Update the asset
//         const updatedAsset = await Asset.findByIdAndUpdate(
//             id,
//             {
//                 asset_id,
//                 asset_code,
//                 asset_name,
//                 structure,
//                 status,
//                 deleted_at,
//                 updated_at: Date.now()
//             },
//             { new: true, runValidators: true }
//         );

//         if (!updatedAsset) {
//             const errorMessage = {
//                 message: "Asset not found",
//                 errors: { id: "Asset not found" }
//             };
//             await logApiResponse(req, errorMessage.message, 404, errorMessage);
//             return res.status(404).json(errorMessage);
//         }

//         // Remove templates not in the new structure from equipment
//         // const equipments = await Equipment.find({ asset_id: id });
//         // const bulkOperations = equipments
//         //     .map((equipment) => {
//         //         const unsetFields = {};
//         //         Object.keys(equipment.templates).forEach((templateId) => {
//         //             if (!newTemplateIds.includes(templateId)) {
//         //                 unsetFields[`templates.${templateId}`] = "";
//         //             }
//         //         });
//         //         return Object.keys(unsetFields).length > 0
//         //             ? {
//         //                 updateOne: {
//         //                     filter: { _id: equipment._id },
//         //                     update: { $unset: unsetFields }
//         //                 }
//         //             }
//         //             : null;
//         //     })
//         //     .filter(Boolean);

//         // if (bulkOperations.length > 0) {
//         //     await Equipment.bulkWrite(bulkOperations);
//         // }

//         await logApiResponse(req, "Asset updated successfully", 200, updatedAsset);
//         res.status(200).json({
//             message: "Asset updated successfully",
//             data: updatedAsset
//         });

//     } catch (error) {
//         console.error("Error updating asset:", error);
//         let errors = {};

//         if (error.name === "ValidationError") {
//             Object.keys(error.errors).forEach((key) => {
//                 errors[key] = error.errors[key].message;
//             });
//             const errorMessage = {
//                 message: Object.values(errors).join(", "),
//                 errors
//             };
//             await logApiResponse(req, "Validation Error", 400, errorMessage);
//             return res.status(400).json(errorMessage);
//         }

//         if (error.code === 11000) { // Duplicate key error
//             if (error.keyPattern?.asset_code) {
//                 errors.asset_code = "Asset code must be unique";
//             }
//             if (error.keyPattern?.asset_name) {
//                 errors.asset_name = "Asset name must be unique";
//             }
//             const errorMessage = {
//                 message: Object.values(errors).join(", "),
//                 errors
//             };
//             await logApiResponse(req, "Duplicate Key Error", 400, errorMessage);
//             return res.status(400).json(errorMessage);
//         }

//         const internalError = {
//             message: "Internal Server Error",
//             errors: { message: "An unexpected error occurred" }
//         };
//         await logApiResponse(req, internalError.message, 500, internalError);
//         return res.status(500).json(internalError);
//     }
// };


// const updateAsset = async (req, res) => {
//     const { id } = req.params; // Use 'id' or another parameter name that indicates it's MongoDB's _id
//     const { asset_id, asset_code, asset_name, structure } = req.body;

//     let validationErrors = {};
//     let combinedErrorMessage = [];

//     try {
//         // Validate id
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             validationErrors.id = 'Invalid asset ID';
//         }

//         // Validate asset_id
//         if (asset_id && !mongoose.Types.ObjectId.isValid(asset_id)) {
//             validationErrors.asset_id = 'Invalid asset ID';
//         }

//         // Validate asset_code
//         if (!asset_code) {
//             validationErrors.asset_code = 'Asset code is required';
//             combinedErrorMessage.push('Asset code is required');
//         } else {
//             // Check if the asset code already exists (excluding the current asset)
//             const existingAsset = await Asset.findOne({ asset_code });
//             if (existingAsset && existingAsset._id.toString() !== id) {
//                 validationErrors.asset_code = 'Asset code already exists';
//             }
//         }

//         // Validate asset_name
//         if (!asset_name) {
//             validationErrors.asset_name = 'Asset name is required';
//             combinedErrorMessage.push('Asset name is required');
//         } else {
//             // Check if the asset name already exists (excluding the current asset)
//             const existingAsset = await Asset.findOne({ asset_name });
//             if (existingAsset && existingAsset._id.toString() !== id) {
//                 validationErrors.asset_name = 'Asset name already exists';
//             }
//         }

//         // If there are validation errors, return them
//         if (Object.keys(validationErrors).length > 0) {
//             let errorMessage = "Validation Error";

//             // Custom error message for asset_code and asset_name
//             if (validationErrors.asset_code && validationErrors.asset_name) {
//                 errorMessage = 'Asset code & Asset name are required';
//             } else if (validationErrors.asset_code) {
//                 errorMessage = validationErrors.asset_code;
//             } else if (validationErrors.asset_name) {
//                 errorMessage = validationErrors.asset_name;
//             }
//             await logApiResponse(req, { message: errorMessage }, 400, { errors: validationErrors });
//             return res.status(400).json({
//                 message: errorMessage,
//                 errors: validationErrors
//             });
//         }

//         const updatedAsset = await Asset.findByIdAndUpdate(
//             id,
//             { $set: req.body },
//             { new: true, runValidators: true } // Returns the updated document and runs validators
//         );

//         if (!updatedAsset) {
//             await logApiResponse(req, "Asset not found", 404, "Asset not found");
//             return res.status(404).send({ message: 'Asset not found' });
//         }
//         await logApiResponse(req, "Asset updated successfully", 200, { data: updatedAsset });
//         res.status(200).send({ message: 'Asset updated successfully', data: updatedAsset });
//     } catch (error) {
//         if (error.name === 'ValidationError') {
//             let errors = {};
//             Object.keys(error.errors).forEach(key => {
//                 errors[key] = error.errors[key].message;
//             });
//             await logApiResponse(req, "Validation Error", 400, { errors });
//             return res.status(400).json({
//                 message: "Validation Error",
//                 errors
//             });
//         } else if (error.code === 11000) { // Handle duplicate key error
//             let errors = {};
//             if (error.keyPattern && error.keyPattern.asset_code) {
//                 errors.asset_code = "Asset code must be unique";
//             }
//             if (error.keyPattern && error.keyPattern.asset_name) {
//                 errors.asset_name = "Asset name must be unique";
//             }
//             await logApiResponse(req, "Validation Error", 400, { errors });
//             return res.status(400).json({
//                 message: "Validation Error",
//                 errors
//             });
//         } else {
//             await logApiResponse(req, "Failed to update asset", 500, { error: error.message });
//             res.status(500).send({ message: 'Failed to update asset', error: error.message });
//         }
//     }
// };

// const deleteAsset = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedAsset = await Asset.findByIdAndDelete(id);

//         if (!deletedAsset) {
//             return res.status(404).send({ message: 'Asset not found' });
//         }
//         await logApiResponse(req, "Asset deleted successfully", 200, "Asset deleted successfully");
//         res.status(200).send({ message: 'Asset deleted successfully' });
//     } catch (error) {
//         await logApiResponse(req, "Failed to delete asset", 500, { error: error.message });
//         res.status(500).send({ message: 'Failed to delete asset', error: error.message });
//     }
// };




const deleteAsset = async (req, res) => {
    try {
        const { id, ids } = req.body;

        const toggleSoftDelete = async (_id) => {
            const asset = await Asset.findById(_id);
            if (!asset) throw new Error(`Asset with ID ${_id} not found`);

            const wasDeleted = !!asset.deleted_at;
            asset.deleted_at = wasDeleted ? null : new Date();
            asset.status = !asset.deleted_at;
            asset.updated_at = new Date();

            const updatedAsset = await asset.save();
            const action = wasDeleted ? 'activated' : 'inactivated';
            const message = `Role Group "${updatedAsset.asset_name}" has been ${action} successfully`;

            return { updatedAsset, message };
        };

        if (Array.isArray(ids)) {
            const results = await Promise.all(ids.map(toggleSoftDelete));
            const updatedAssets = results.map(r => r.updatedAsset);

            // Optional: You could also batch notification creation here if needed
            await logApiResponse(req, 'Assets updated successfully', 200, updatedAssets);
            return res.status(200).json({ message: 'Assets updated successfully', data: updatedAssets });
        }

        if (id) {
            const { updatedAsset, message } = await toggleSoftDelete(id);

            await createNotification(req, 'Asset', id, message, 'asset');
            await logApiResponse(req, message, 200, updatedAsset);

            return res.status(200).json({ message, data: updatedAsset });
        }

        await logApiResponse(req, 'No ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No ID or IDs provided' });

    } catch (error) {
        await logApiResponse(req, "Asset delete/restore failed", 500, { error: error.message });
        return res.status(500).json({ message: "Asset delete/restore failed", error: error.message });
    }
};


// const getPaginatedAssets = async (req, res) => {
//     const { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', search = '' } = req.query;

//     // Building the sort object dynamically based on the query parameters
//     const sort = {
//         [sortBy]: order === 'desc' ? -1 : 1
//     };

//     // Implementing search functionality
//     const searchQuery = search ? {
//         $or: [
//             { asset_name: new RegExp(search, 'i') }, // Assuming asset_name can be searched
//             { asset_code: new RegExp(search, 'i') }, // Assuming asset_code can be searched
//             // Add other fields if needed
//         ]
//     } : {};

//     try {
//         const count = await Asset.countDocuments(searchQuery);
//         const assets = await Asset.find(searchQuery)
//             .sort(sort)
//             .skip((page - 1) * limit)
//             .limit(limit);
//         await logApiResponse(req, "Paginate Successful", 200, {
//             totalPages: Math.ceil(count / limit),
//             currentPage: Number(page),
//             assets: assets,
//             totalItems: count
//         });
//         res.status(200).json({
//             totalPages: Math.ceil(count / limit),
//             currentPage: Number(page),
//             assets: assets,
//             totalItems: count
//         });
//     } catch (error) {
//         console.error('Error fetching paginated assets:', error);
//         await logApiResponse(req, "Failed to fetch paginated assets.", 500, { error: error.toString() });
//         res.status(500).json({ message: "Failed to fetch paginated assets.", error: error.toString() });
//     }
// };
// const getPaginatedAssets = async (req, res) => {
//     const { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', search = '' } = req.query;

//     const sort = {
//         [sortBy]: order === 'desc' ? -1 : 1
//     };

//     const searchQuery = search ? {
//         $or: [
//             { asset_name: new RegExp(search, 'i') },
//             { asset_code: new RegExp(search, 'i') },
//         ]
//     } : {};

//     try {
//         const count = await Asset.countDocuments(searchQuery);
//         const assets = await Asset.find(searchQuery)
//             .sort(sort)
//             .skip((page - 1) * limit)
//             .limit(limit);

//         const assetsWithDetails = await Promise.all(assets.map(async (asset) => {
//             // Check for asset attributes
//             const assetClassAttributes = await AssetClassAttribute.findOne({ asset_id: asset._id });
//             const attributeStatus = assetClassAttributes && assetClassAttributes.asset_attribute_ids.length > 0;

//             // Check if structure is an array
//             let nodeLabels = [];
//             if (Array.isArray(asset.structure)) {
//                 nodeLabels = asset.structure.reduce((acc, structure) => {
//                     if (Array.isArray(structure.nodes)) {
//                         const labels = structure.nodes.map(node => node.data?.label).filter(Boolean);
//                         return acc.concat(labels);
//                     }
//                     return acc;
//                 }, []);
//             } else {
//                 console.warn(`Expected asset.structure to be an array, but got: ${typeof asset.structure}`);
//             }

//             // Fetch configurations for this asset
//             const assetConfigurations = await AssetConfiguration.find({ asset_id: asset._id });
//             const configMap = new Map();
//             assetConfigurations.forEach(config => {
//                 configMap.set(config.template_name, config);
//             });

//             // Log the configurations for debugging
//             console.log(`Asset ID: ${asset._id}, Asset Name: ${asset.asset_name}`);
//             console.log(`Node Labels: ${nodeLabels}`);
//             console.log(`Configurations Found: ${Array.from(configMap.keys())}`);

//             // Check if all templates from the structure have corresponding configurations
//             const missingTemplates = nodeLabels.filter(templateLabel => {
//                 const config = configMap.get(templateLabel);
//                 return !config || config.row_limit === null || config.order === null;
//             });

//             const allTemplatesConfigured = missingTemplates.length === 0;

//             // Log detailed information for debugging
//             console.log(`Missing Templates: ${missingTemplates}`);
//             console.log(`Attribute Status: ${attributeStatus}`);
//             console.log(`All Templates Configured for Asset: ${allTemplatesConfigured}`);

//             return {
//                 ...asset.toObject(),
//                 attribute_status: attributeStatus,
//                 configure_status: allTemplatesConfigured
//             };
//         }));

//         res.status(200).json({
//             totalPages: Math.ceil(count / limit),
//             currentPage: Number(page),
//             assets: assetsWithDetails,
//             totalItems: count
//         });
//     } catch (error) {
//         console.error('Error fetching paginated assets:', error);
//         res.status(500).json({ message: "Failed to fetch paginated assets.", error: error.toString() });
//     }
// };



const paginatedAssets = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'asset_code',
        order = 'desc',
        search = '',
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
                { asset_name: new RegExp(search, 'i') },
                { asset_code: new RegExp(search, 'i') }
            ]
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
        const assets = await Asset.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean(); // ensures plain JS objects for mapping

        const count = await Asset.countDocuments(searchQuery);

        // Ensure status is present in each asset
        const assetsWithStatus = assets.map(asset => ({
            ...asset,
            status: asset.status ?? false // default false if missing
        }));

        const response = {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalItems: count,
            assets: assetsWithStatus
        };

        await logApiResponse(req, "Assets retrieved successfully", 200, response);
        res.json(response);

    } catch (error) {
        console.error("Error retrieving Assets:", error);
        await logApiResponse(req, "Error retrieving Assets", 500, { error: error.message });
        res.status(500).json({ error: error.message });
    }
};





const getAssetById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the asset by its MongoDB _id
        const asset = await Asset.findById(id);

        if (!asset) {
            await logApiResponse(req, "Asset not found", 404, "Asset not found");
            return res.status(404).json({ message: 'Asset not found' });
        }

        res.status(200).json(asset);
    } catch (error) {
        console.error('Error fetching asset:', error);
        await logApiResponse(req, "Server error", 500, { error: error.toString() });
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
};

const getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.find({});
        await logApiResponse(req, "Get all successful", 200, assets);
        res.status(200).json(assets);
    } catch (error) {
        console.error('Error fetching assets:', error);
        await logApiResponse(req, "Server error", 500, { error: error.toString() });
        res.status(500).json({ message: 'Server error', error: error.toString() });
    }
};

const destroyAsset = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return logApiResponse(req, 'Asset ID is required', 400, false, null, res);
        }

        const asset = await Asset.findById(id).lean();
        if (!asset) {
            return logApiResponse(req, 'Asset not found', 404, false, null, res);
        }

        await Asset.deleteOne({ _id: id });

        const message = `"${asset.asset_name}" permanently deleted`;
        await createNotification(req, 'Asset', id, message, 'asset');
        await logApiResponse(req, message, 200, true, null, res);

        return res.status(200).json({ message });
    } catch (error) {
        await logApiResponse(req, "Failed to delete asset", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to delete asset", error: error.message });
    }
};

module.exports = {
    addAsset,
    updateAsset,
    deleteAsset,
    paginatedAssets,
    getAssetById,
    getAllAssets,
    destroyAsset
}