const AssetClassAttribute = require('../models/assetClassAttribute');
const AssetAttribute = require('../models/assetAttribute');
const { logApiResponse } = require('../utils/responseService');
const mongoose = require('mongoose');
const { createNotification } = require('../utils/notification');

const createAssetClassAttribute = async (req, res) => {
    try {
        const { asset_id, asset_attribute_ids } = req.body;
        if (!asset_id || !Array.isArray(asset_attribute_ids)) {
            await logApiResponse(req, "Validation Error", 400, "Invalid request body");
            return res.status(400).json({ message: "Invalid request body" });
        }

        const assetObjectId = new mongoose.Types.ObjectId(asset_id);
        await AssetClassAttribute.deleteMany({ asset_id: assetObjectId });

        const newEntry = await AssetClassAttribute.create({
            asset_id: assetObjectId,
            asset_attribute_ids,
            created_at: new Date(),
            updated_at: new Date()
        });
        const message = `Asset Class Attributes for asset "${asset_id}" created successfully`;
        await createNotification(req, 'Asset Class Attribute', newEntry._id, message, 'master');
        await logApiResponse(req, message, 201, newEntry);

        return res.status(201).json({
            message,
            data: newEntry
        });

    } catch (error) {
        console.error("Error in createAssetClassAttribute:", error);
        await logApiResponse(req, "Error creating AssetClassAttribute", 400, { message: error.message });
        return res.status(400).json({ message: error.message });
    }
};


const getAttributesByAssetId = async (req, res) => {
    try {
        const { assetId } = req.body;
        const assetClassAttributes = await AssetClassAttribute.findOne({ asset_id: assetId });
        if (!assetClassAttributes) {
            await logApiResponse(req, { message: 'Asset not found with provided ID' }, 404, { message: 'Asset not found with provided ID' });
            return res.status(404).json({ message: 'Asset not found with provided ID' });
        }
        // Extract attribute IDs and orders
        const attributeIdsWithOrder = assetClassAttributes.asset_attribute_ids;
        const attributeIds = attributeIdsWithOrder.map(attr => attr.id);
        // Fetch attributes from AssetAttribute collection
        const attributes = await AssetAttribute.find({ '_id': { $in: attributeIds } });
        // Create a mapping of attribute IDs to their respective orders
        const orderMapping = attributeIdsWithOrder.reduce((acc, curr) => {
            acc[curr.id] = curr.order;
            return acc;
        }, {});
        // Sort attributes based on the order mapping and attach order to each attribute
        const sortedAttributes = attributes.map(attr => {
            return {
                ...attr.toObject(),
                order: orderMapping[attr._id.toString()]
            };
        }).sort((a, b) => a.order - b.order);
        await logApiResponse(req, {
            asset_id: assetId,
            asset_attributes: sortedAttributes
        }, 200, {
            asset_id: assetId,
            asset_attributes: sortedAttributes
        });
        res.status(200).json({
            asset_id: assetId,
            asset_attributes: sortedAttributes
        });
    } catch (error) {
        await logApiResponse(req, { message: error.message }, 500, { message: error.message });
        res.status(500).json({ message: error.message });
    }
};

const deleteAttributeFromAsset = async (req, res) => {
    const { assetId, attributeId } = req.params;

    try {
        const updateResult = await AssetClassAttribute.updateOne(
            { asset_id: assetId },
            { $pull: { asset_attribute_ids: attributeId } }
        );

        if (updateResult.modifiedCount === 0) {
            await logApiResponse(req, "No asset found or attribute not in asset", 404, { assetId, attributeId });
            return res.status(404).json({ message: 'No asset found or attribute not in asset' });
        }
        const message = `Attribute ID "${attributeId}" removed from Asset ID "${assetId}" successfully`;
        await createNotification(req, 'Asset Attribute', attributeId, message, 'master');
        await logApiResponse(req, message, 200, { assetId, attributeId });

        return res.status(200).json({ message });
    } catch (error) {
        console.error("Error removing attribute from asset:", error);
        await logApiResponse(req, "Server error", 500, { error: error.message });
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { createAssetClassAttribute, getAttributesByAssetId, deleteAttributeFromAsset }