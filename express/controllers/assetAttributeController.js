const AssetAttribute = require('../models/assetAttribute');
const { createNotification } = require('../utils/notification');
const { logApiResponse } = require('../utils/responseService');

const createAssetAttribute = async (req, res) => {
    try {
        const { field_name, field_type, field_value, display_name, required } = req.body;
        let validationErrors = {};
        if (!field_name) {
            validationErrors.field_name = "Field name is required";
        }
        if (!field_type) {
            validationErrors.field_type = "Field type is required";
        }
        if (field_type === 'select' && !field_value) {
            validationErrors.field_value = "Field value is mandatory for 'select' type";
        }
        if (!display_name) {
            validationErrors.display_name = "Display name is required";
        }
        if (required === undefined) {
            validationErrors.required = "Required field must be specified as true or false";
        }
        if (Object.keys(validationErrors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, validationErrors);
            return res.status(400).json({
                message: "Validation Error",
                errors: validationErrors
            });
        }
        const existingAttribute = await AssetAttribute.findOne({ field_name });
        if (existingAttribute) {
            validationErrors.field_name = "An attribute with this field name already exists";
            await logApiResponse(req, "Duplicate Field Error", 409, validationErrors);
            return res.status(409).json({
                message: "Duplicate Field Error",
                errors: validationErrors
            });
        }

        const newAttribute = new AssetAttribute({
            field_name,
            field_type,
            field_value,
            display_name,
            required
        });
        const savedAttribute = await newAttribute.save();
        await logApiResponse(req, "Asset attribute created and equipment updated successfully", 201, savedAttribute);
        res.status(201).json({
            message: "Asset attribute created and equipment updated successfully",
            data: savedAttribute
        });
    } catch (error) {
        console.error("Error in createAssetAttribute:", error);
        await logApiResponse(req, "Internal Server Error", 500, { error: error.message });
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const updateAssetAttribute = async (req, res) => {
    try {
        const { id } = req.body;
        const { field_name, field_type, field_value, display_name, required } = req.body;
        const existingAssetAttribute = await AssetAttribute.findById(id);
        if (!existingAssetAttribute) {
            const errors = { id: "Asset attribute not found" };
            await logApiResponse(req, "Asset attribute not found", 404, errors);
            return res.status(404).json({ message: "Asset attribute not found", errors });
        }
        const duplicateName = await AssetAttribute.findOne({ field_name, _id: { $ne: id } });
        const duplicateDisplayName = await AssetAttribute.findOne({ display_name, _id: { $ne: id } });

        const errors = {};
        if (!field_name) errors.field_name = "Field name is required";
        if (!field_type) errors.field_type = "Field type is required";
        if (field_type === 'select' && !field_value) errors.field_value = "Field value is mandatory for 'select' type";
        if (!display_name) errors.display_name = "Display name is required";
        if (required === undefined) errors.required = "Field 'required' status is required";
        if (duplicateName) errors.field_name = "Field name already exists";
        if (duplicateDisplayName) errors.display_name = "Display name already exists";

        if (Object.keys(errors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, errors);
            return res.status(400).json({ message: "Validation Error", errors });
        }
        const beforeUpdate = {
            field_name: existingAssetAttribute.field_name,
            field_type: existingAssetAttribute.field_type,
            field_value: existingAssetAttribute.field_value,
            display_name: existingAssetAttribute.display_name,
            required: existingAssetAttribute.required
        };
        await AssetAttribute.findByIdAndUpdate(id, {
            field_name,
            field_type,
            field_value,
            display_name,
            required,
            updated_at: Date.now()
        });
        const updatedAssetAttribute = await AssetAttribute.findById(id);
        const afterUpdate = {
            field_name: updatedAssetAttribute.field_name,
            field_type: updatedAssetAttribute.field_type,
            field_value: updatedAssetAttribute.field_value,
            display_name: updatedAssetAttribute.display_name,
            required: updatedAssetAttribute.required
        };
        const message = `Asset Attribute "${updatedAssetAttribute.display_name}" updated successfully.\nBefore: ${JSON.stringify(beforeUpdate)}\nAfter: ${JSON.stringify(afterUpdate)}`;
        await createNotification(req, 'Asset Attribute', id, message, 'master');
        await logApiResponse(req, "Asset attribute updated successfully", 200, updatedAssetAttribute);

        return res.status(200).json({ message: "Asset attribute updated successfully", data: updatedAssetAttribute });

    } catch (error) {
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
        const { id } = req.body;
        const { ids } = req.body;
        const toggleSoftDelete = async (attributeId) => {
            const attribute = await AssetAttribute.findById(attributeId);
            if (!attribute) {
                throw new Error(`Asset attribute with ID ${attributeId} not found`);
            }

            if (attribute.deleted_at) {
                attribute.deleted_at = null;
                attribute.status = true;
            } else {
                attribute.deleted_at = new Date();
                attribute.status = false;
            }

            attribute.updated_at = new Date();
            return await attribute.save();
        };
        if (ids && Array.isArray(ids)) {
            const promises = ids.map(toggleSoftDelete);
            const updatedAttributes = await Promise.all(promises);
            await logApiResponse(req, "Asset attributes updated successfully", 200, updatedAttributes);
            res.status(200).json({
                message: 'Asset attributes updated successfully',
                data: updatedAttributes
            });
        } else if (id) {
            const updatedAttribute = await toggleSoftDelete(id);
            await logApiResponse(req, updatedAttribute.deleted_at ? 'Asset attribute soft-deleted successfully' : 'Asset attribute restored successfully', 200, updatedAttribute);
            res.status(200).json({
                message: updatedAttribute.deleted_at ? 'Asset attribute soft-deleted successfully' : 'Asset attribute restored successfully',
                data: updatedAttribute
            });
        } else {
            await logApiResponse(req, "No ID or IDs provided", 400, "No ID or IDs provided");
            res.status(400).json({ message: 'No ID or IDs provided' });
        }
    } catch (error) {
        console.error('Server error', error);

        if (error.message && error.message.includes('not found')) {
            await logApiResponse(req, { message: error.message }, 404, { message: error.message });
            res.status(404).json({ message: error.message });
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            await logApiResponse(req, "Invalid asset attribute ID format", 400, { error: error.message });
            res.status(400).json({ message: 'Invalid asset attribute ID format', error: error.message });
        } else {
            await logApiResponse(req, "Server error", 500, { error: error.message });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

const destroyAssetAttribute = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return logApiResponse(req, 'Asset Attribute ID is required', 400, false, null, res);
        }

        const asset_attribute = await AssetAttribute.findById(id).lean();
        if (!asset_attribute) {
            return logApiResponse(req, 'Asset Attribute not found', 404, false, null, res);
        }

        await AssetAttribute.deleteOne({ _id: id });

        const message = `Asset Attribute "${asset_attribute.filed_name}" permanently deleted`;
        await logApiResponse(req, message, 200, true, null, res);

        return res.status(200).json({ message });
    } catch (error) {
        await logApiResponse(req, "Failed to delete Asset Attribute", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to delete  Asset Attribute", error: error.message });
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

    const safeSortBy = ['_id', 'field_name', 'display_name', 'created_at'].includes(sortBy)
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