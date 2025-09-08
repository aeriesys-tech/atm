const AssetClassAttribute = require('../models/assetClassAttribute');
const AssetAttribute = require('../models/assetAttribute');
const { logApiResponse } = require('../utils/responseService');
const mongoose = require('mongoose');

const createAssetClassAttribute = async (req, res) => {
    try {
        const { asset_id, asset_attribute_ids } = req.body;

        // 1️⃣ Validate input
        if (!asset_id || !Array.isArray(asset_attribute_ids)) {
            await logApiResponse(req, "Validation Error", 400, "Invalid request body");
            return res.status(400).json({ message: "Invalid request body" });
        }

        let results = [];

        // 2️⃣ Loop through each attribute and upsert individually
        for (const attr of asset_attribute_ids) {
            const filter = {
                asset_id: new mongoose.Types.ObjectId(asset_id),
                "asset_attribute_ids.id": attr.id,
                deleted_at: null
            };

            const update = {
                $set: {
                    "asset_attribute_ids.$": attr, // update the matching attribute in the array
                    updated_at: new Date()
                }
            };

            // 3️⃣ Try updating an existing attribute
            let updated = await AssetClassAttribute.findOneAndUpdate(filter, update, {
                new: true
            });

            if (!updated) {
                // 4️⃣ If not found, push new attribute into array
                updated = await AssetClassAttribute.findOneAndUpdate(
                    { asset_id: new mongoose.Types.ObjectId(asset_id) },
                    {
                        $push: { asset_attribute_ids: attr },
                        $set: { updated_at: new Date() }
                    },
                    { new: true, upsert: true }
                );
            }

            results.push(updated);
        }

        // 5️⃣ Final response
        await logApiResponse(req, "AssetClassAttribute upserted successfully", 201, results);
        res.status(201).json(results);

    } catch (error) {
        console.error("Error in createAssetClassAttribute:", error);
        await logApiResponse(req, "Error creating AssetClassAttribute", 400, { message: error.message });
        res.status(400).json({ message: error.message });
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
            await logApiResponse(req, { message: 'No asset found or attribute not in asset' }, 404, { message: 'No asset found or attribute not in asset' });
            return res.status(404).json({ message: 'No asset found or attribute not in asset' });
        }
        await logApiResponse(req, { message: 'Attribute removed from asset successfully' }, 200, { message: 'Attribute removed from asset successfully' });
        res.status(200).json({ message: 'Attribute removed from asset successfully' });
    } catch (error) {
        await logApiResponse(req, { message: error.message }, 500, { message: error.message });
        res.status(500).json({ message: error.message });
    }
};
module.exports = {
    createAssetClassAttribute,
    getAttributesByAssetId,
    deleteAttributeFromAsset
}