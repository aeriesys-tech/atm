const AssetClassAttribute = require('../models/assetClassAttribute');
const AssetAttribute = require('../models/assetAttribute');
const { logApiResponse } = require('../utils/responseService');


const createAssetClassAttribute = async (req, res) => {
    try {
        const { asset_id, asset_attribute_ids } = req.body;
        // Validate the input
        if (!asset_id || !Array.isArray(asset_attribute_ids)) {
            await logApiResponse(req, "Validation Error", 400, "Invalid request body");
            return res.status(400).json({ message: "Invalid request body" });
        }
        // Construct the update object
        const update = {
            $set: {
                asset_attribute_ids: asset_attribute_ids,
                updated_at: new Date()  // Update the timestamp
            }
        };
        // The upsert option creates a new document if no documents match the filter
        const assetClassAttribute = await AssetClassAttribute.findOneAndUpdate(
            { asset_id: asset_id },  // filter
            update,  // update
            { new: true, upsert: true, runValidators: true }  // options
        );
        await logApiResponse(req, " AssetClass Attribute created Successful", 201, assetClassAttribute);
        res.status(201).json(assetClassAttribute);
    } catch (error) {
        await logApiResponse(req, { message: error.message }, 400, { message: error.message });
        res.status(400).json({ message: error.message });
    }
};
const getAttributesByAssetId = async (req, res) => {
    try {
        const { assetId } = req.params;
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