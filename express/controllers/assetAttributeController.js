const redisClient = require('../config/redisConfig');
const AssetAttribute = require('../models/assetAttribute');
const { createNotification } = require('../utils/notification');
const { logApiResponse } = require('../utils/responseService');

const createAssetAttribute = async (req, res) => {
    try {
        const { field_name, field_type, field_value, display_name, required } = req.body;
        const attribute = await AssetAttribute.findOne({
            $or: [{ field_name }, { display_name }]
        });

        if (attribute) {
            let errors = {};
            if (attribute.field_name === field_name) errors.field_name = "Field name already exists";
            if (attribute.display_name === display_name) errors.display_name = "Display name already exists";

            await logApiResponse(req, "Duplicate Asset Attribute", 400, errors);
            return res.status(400).json({ message: "Duplicate Asset Attribute", errors });
        }
        const newAttribute = await AssetAttribute.create({
            field_name,
            field_type,
            field_value,
            display_name,
            required
        });
        await redisClient.del('asset_attributes');
        const message = `Asset Attribute "${newAttribute.display_name}" created successfully`;

        await createNotification(req, 'Asset Attribute', newAttribute._id, message, 'master');
        await logApiResponse(req, message, 201, newAttribute);

        return res.status(201).json({
            message,
            data: newAttribute
        });

    } catch (error) {
        console.error("Error in createAssetAttribute:", error);
        await logApiResponse(req, "Failed to create asset attribute", 500, { error: error.message });
        return res.status(500).json({
            message: "Failed to create asset attribute",
            error: error.message
        });
    }
};



const updateAssetAttribute = async (req, res) => {
    try {
        const { id, field_name, field_type, field_value, display_name, required } = req.body;

        // Check if the attribute exists
        const existingAssetAttribute = await AssetAttribute.findById(id);
        if (!existingAssetAttribute) {
            const errors = { id: "Asset attribute not found" };
            await logApiResponse(req, "Asset attribute not found", 404, errors);
            return res.status(404).json({ message: "Asset attribute not found", errors });
        }

        // Check for duplicates
        const [duplicateName, duplicateDisplayName] = await Promise.all([
            AssetAttribute.findOne({ field_name, _id: { $ne: id } }),
            AssetAttribute.findOne({ display_name, _id: { $ne: id } })
        ]);

        const errors = {};
        if (duplicateName) errors.field_name = "Field name already exists";
        if (duplicateDisplayName) errors.display_name = "Display name already exists";

        if (Object.keys(errors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, errors);
            return res.status(400).json({ message: "Validation Error", errors });
        }

        // Capture before update values
        const beforeUpdate = {
            field_name: existingAssetAttribute.field_name,
            field_type: existingAssetAttribute.field_type,
            field_value: existingAssetAttribute.field_value,
            display_name: existingAssetAttribute.display_name,
            required: existingAssetAttribute.required
        };

        // Update asset attribute
        await AssetAttribute.findByIdAndUpdate(id, {
            field_name,
            field_type,
            field_value,
            display_name,
            required,
            updated_at: Date.now()
        });

        // Get updated document
        const updatedAssetAttribute = await AssetAttribute.findById(id);

        // Capture after update values
        const afterUpdate = {
            field_name: updatedAssetAttribute.field_name,
            field_type: updatedAssetAttribute.field_type,
            field_value: updatedAssetAttribute.field_value,
            display_name: updatedAssetAttribute.display_name,
            required: updatedAssetAttribute.required
        };

        // Create notification
        const message = `Asset Attribute "${updatedAssetAttribute.display_name}" updated successfully.\nBefore: ${JSON.stringify(beforeUpdate)}\nAfter: ${JSON.stringify(afterUpdate)}`;
        await createNotification(req, 'Asset Attribute', id, message, 'master');

        // Log API response
        await logApiResponse(req, "Asset attribute updated successfully", 200, updatedAssetAttribute);

        // Return success response
        return res.status(200).json({
            message: "Asset attribute updated successfully",
            data: updatedAssetAttribute
        });

    } catch (error) {
        console.error("Error in updateAssetAttribute:", error);
        await logApiResponse(req, "Failed to update asset attribute", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to update asset attribute", error: error.message });
    }
};


const getAllAssetAttributes = async (req, res) => {
    try {
        const assetAttributes = await AssetAttribute.find({ status: true });
        await logApiResponse(req, "Asset attributes retrieved successfully", 200, assetAttributes);
        res.status(200).json({
            message: "Asset attributes retrieved successfully",
            data: assetAttributes
        });
    } catch (error) {
        console.error("Error retrieving asset attributes:", error);
        await logApiResponse(req, "Internal Server Error", 500, "An unexpected error occurred");
        res.status(500).json({
            message: "Internal Server Error",
            error: "An unexpected error occurred"
        });
    }
};

const getAssetAttributeById = async (req, res) => {
    try {
        const { id } = req.params;
        const assetAttribute = await AssetAttribute.findById(id);

        if (!assetAttribute) {
            await logApiResponse(req, "Asset attribute not found", 404, "No asset attribute found with this ID");

            return res.status(404).json({
                message: "Asset attribute not found",
                error: "No asset attribute found with this ID"
            });
        }
        await logApiResponse(req, "Asset attribute retrieved successfully", 200, assetAttribute);

        res.status(200).json({
            message: "Asset attribute retrieved successfully",
            data: assetAttribute
        });
    } catch (error) {
        console.error("Error retrieving asset attribute:", error);
        await logApiResponse(req, "Internal Server Error", 500, "An unexpected error occurred");
        res.status(500).json({
            message: "Internal Server Error",
            error: "An unexpected error occurred"
        });
    }
};

const toggleSoftDeleteAssetAttribute = async (req, res) => {
    try {
        const { id, ids } = req.body;

        const toggleSoftDelete = async (attributeId) => {
            const attribute = await AssetAttribute.findById(attributeId);
            if (!attribute) {
                throw new Error(`Asset attribute with ID ${attributeId} not found`);
            }

            const wasDeleted = !!attribute.deleted_at;

            // Toggle soft delete
            attribute.deleted_at = wasDeleted ? null : new Date();
            attribute.status = !attribute.deleted_at;
            attribute.updated_at = new Date();

            const updatedAttribute = await attribute.save();

            const action = wasDeleted ? 'restored' : 'soft-deleted';
            const message = `Asset attribute "${updatedAttribute.display_name}" has been ${action} successfully`;

            // ✅ Create notification for single toggle
            await createNotification(req, 'Asset Attribute', attributeId, message, 'master');

            return { updatedAttribute, message };
        };

        if (ids && Array.isArray(ids)) {
            // Multiple attributes
            const results = await Promise.all(ids.map(toggleSoftDelete));
            const updatedAttributes = results.map(r => r.updatedAttribute);

            await logApiResponse(req, "Asset attributes updated successfully", 200, updatedAttributes);
            return res.status(200).json({
                message: "Asset attributes updated successfully",
                data: updatedAttributes
            });
        } else if (id) {
            // Single attribute
            const { updatedAttribute, message } = await toggleSoftDelete(id);

            await logApiResponse(req, message, 200, updatedAttribute);
            return res.status(200).json({
                message,
                data: updatedAttribute
            });
        } else {
            await logApiResponse(req, "No ID or IDs provided", 400, {});
            return res.status(400).json({ message: 'No ID or IDs provided' });
        }

    } catch (error) {
        console.error('Server error', error);

        if (error.message && error.message.includes('not found')) {
            await logApiResponse(req, error.message, 404, { message: error.message });
            return res.status(404).json({ message: error.message });
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            await logApiResponse(req, "Invalid asset attribute ID format", 400, { error: error.message });
            return res.status(400).json({ message: 'Invalid asset attribute ID format', error: error.message });
        } else {
            await logApiResponse(req, "Server error", 500, { error: error.message });
            return res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

const destroyAssetAttribute = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return logApiResponse(req, 'Asset Attribute ID is required', 400, false, null, res);
        }
        const assetAttribute = await AssetAttribute.findById(id).lean();
        if (!assetAttribute) {
            return logApiResponse(req, 'Asset Attribute not found', 404, false, null, res);
        }
        await AssetAttribute.deleteOne({ _id: id });
        const message = `Asset Attribute "${assetAttribute.field_name}" permanently deleted`;
        await createNotification(req, 'Asset Attribute', id, message, 'master');

        await logApiResponse(req, message, 200, true, null, res);
        return res.status(200).json({ message });

    } catch (error) {
        await logApiResponse(req, "Failed to delete Asset Attribute", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to delete Asset Attribute", error: error.message });
    }
};


const paginatedAssetAttributes = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        order = 'desc',
        search = '',
        status
    } = req.body;

    const safeSortBy = ['_id', 'field_name', 'display_name', 'field_type', 'created_at'].includes(sortBy)
        ? sortBy
        : '_id';
    const sort = { [safeSortBy]: order === 'desc' ? -1 : 1 };
    const match = {};

    if (status === 'true' || status === 'false') {
        match.status = status === 'true';
    }

    if (search) {
        match.$or = [
            { field_name: new RegExp(search, 'i') },
            { display_name: new RegExp(search, 'i') }
        ];
    }

    try {
        const pipeline = [
            { $match: match },
            { $sort: sort },
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) }
        ];

        const countPipeline = [
            { $match: match },
            { $count: 'total' }
        ];

        const [assetAttributes, countResult] = await Promise.all([
            AssetAttribute.aggregate(pipeline),
            AssetAttribute.aggregate(countPipeline)
        ]);

        const totalItems = countResult[0]?.total || 0;

        const responseData = {
            totalPages: Math.ceil(totalItems / limit),
            currentPage: Number(page),
            totalItems,
            assetAttributes
        };
        await logApiResponse(req, "Paginated asset attributes retrieved successfully", 200, responseData);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error retrieving paginated asset attributes:", error);
        await logApiResponse(req, "Failed to retrieve paginated asset attributes", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve paginated asset attributes",
            error: error.message
        });
    }
};

module.exports = { createAssetAttribute, updateAssetAttribute, getAllAssetAttributes, getAssetAttributeById, toggleSoftDeleteAssetAttribute, paginatedAssetAttributes, destroyAssetAttribute }