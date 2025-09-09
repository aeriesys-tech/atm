const AssetConfiguration = require('../models/assetConfiguration');
const { logApiResponse } = require('../utils/responseService');

const upsertConfiguration = async (req, res) => {
    const { asset_id, template_id, order, row_limit } = req.body;

    try {
        const result = await AssetConfiguration.updateOne(
            { asset_id, template_id },
            {
                $set: { order, row_limit },
                $setOnInsert: { asset_id, template_id }
            },
            { upsert: true }
        );
        const updatedDoc = await AssetConfiguration.findOne({ asset_id, template_id });
        await logApiResponse(req, "Successfully processed asset configuration", 200, updatedDoc);
        return res.status(200).json({
            message: "Successfully processed asset configuration",
            data: updatedDoc
        });
    } catch (error) {
        console.error("Error in upsertConfiguration:", error);
        await logApiResponse(req, error.message || "Error", 500, error);
        return res.status(500).json({ message: "Error processing asset configuration", error });
    }
};

const getAssetConfiguration = async (req, res) => {
    const { asset_id, template_id } = req.body;
    try {
        const assetConfig = await AssetConfiguration.findOne({ asset_id, template_id }).populate('asset_id').populate('template_id');
        await logApiResponse(req, "Successfully processed asset configuration", 200, assetConfig);
        res.status(200).json(assetConfig);
    } catch (error) {
        await logApiResponse(req, "Error retrieving asset configuration", 500, { error: error });
        res.status(500).json({ message: 'Error retrieving asset configuration', error: error });
    }
};

module.exports = { upsertConfiguration, getAssetConfiguration }