const AssetAttribute = require('../models/assetAttribute');
// const Equipment = require('../models/equipment');
const { logApiResponse } = require('../utils/responseService');

const createAssetAttribute = async (req, res) => {
    try {
        const { field_name, field_type, field_value, display_name, required, equipmentId } = req.body;
        let validationErrors = {};

        // Validate input fields
        if (!field_name) {
            validationErrors.field_name = "Field name is required";
        }
        if (!field_type) {
            validationErrors.field_type = "Field type is required";
        }
        if (field_type === 'select' && !field_value) {
            // Check if field_value is provided when field_type is 'select'
            validationErrors.field_value = "Field value is mandatory for 'select' type";
        }
        if (!display_name) {
            validationErrors.display_name = "Display name is required";
        }
        if (required === undefined) {
            validationErrors.required = "Required field must be specified as true or false";
        }
        // if (equipmentId && !mongoose.Types.ObjectId.isValid(equipmentId)) {
        //     validationErrors.equipmentId = "Invalid equipment ID";
        // }

        // Check if there are any validation errors so far
        if (Object.keys(validationErrors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, validationErrors);
            return res.status(400).json({
                message: "Validation Error",
                errors: validationErrors
            });
        }

        // Check for uniqueness in the database for field_name
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

        // Optionally update equipment if an ID is provided
        // if (equipmentId) {
        //     await Equipment.findByIdAndUpdate(
        //         equipmentId,
        //         { $set: { [`dynamicAttributes.${field_name}`]: field_value } },
        //         { new: true, upsert: true }
        //     );
        // }
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
        const { id } = req.params; // Get the asset attribute ID from the URL
        const { field_name, field_type, field_value, display_name, required } = req.body;

        // Validation errors container
        let validationErrors = {};

        // Check if field_name is provided
        if (!field_name) {
            validationErrors.field_name = "Field name is required";
        }

        // Check if field_type is provided
        if (!field_type) {
            validationErrors.field_type = "Field type is required";
        }

        // If field_type is 'select', then field_value is mandatory
        if (field_type === 'select' && !field_value) {
            validationErrors.field_value = "Field value is mandatory for 'select' type";
        }

        // Check if display_name is provided
        if (!display_name) {
            validationErrors.display_name = "Display name is required";
        }

        // Check if required status is provided
        if (required === undefined) {
            validationErrors.required = "Field 'required' status is required";
        }

        // If there are validation errors, return them
        if (Object.keys(validationErrors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, validationErrors);
            return res.status(400).json({
                message: "Validation Error",
                errors: validationErrors
            });
        }

        // Find the document and update it
        const updatedAssetAttribute = await AssetAttribute.findByIdAndUpdate(id, {
            field_name,
            field_type,
            field_value,
            display_name,
            required
        }, { new: true, runValidators: true }); // return the updated document and run schema validators

        if (!updatedAssetAttribute) {
            await logApiResponse(req, "Asset attribute not found", 404, "No asset attribute found with this ID");
            return res.status(404).json({
                message: "Asset attribute not found",
                error: "No asset attribute found with this ID"
            });
        }

        // Send a successful response back
        await logApiResponse(req, "Asset attribute updated successfully", 200, updatedAssetAttribute);
        res.status(200).json({
            message: "Asset attribute updated successfully",
            data: updatedAssetAttribute
        });
    } catch (error) {
        console.error("Error updating asset attribute:", error);
        await logApiResponse(req, "Internal Server Error", 500, "An unexpected error occurred");
        res.status(500).json({
            message: "Internal Server Error",
            error: "An unexpected error occurred"
        });
    }
};

const getAllAssetAttributes = async (req, res) => {
    try {
        // Retrieve all asset attributes from the database
        const assetAttributes = await AssetAttribute.find({ status: true });

        // Send a successful response back with the retrieved data
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
        const { id } = req.params; // Get the ID from the URL parameter

        // Retrieve the asset attribute from the database
        const assetAttribute = await AssetAttribute.findById(id);

        if (!assetAttribute) {
            await logApiResponse(req, "Asset attribute not found", 404, "No asset attribute found with this ID");

            return res.status(404).json({
                message: "Asset attribute not found",
                error: "No asset attribute found with this ID"
            });
        }

        // Send a successful response back with the retrieved data
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
        const { id } = req.params;
        const { ids } = req.body;

        // Function to toggle soft delete for a single asset attribute
        const toggleSoftDelete = async (attributeId) => {
            const attribute = await AssetAttribute.findById(attributeId);
            if (!attribute) {
                throw new Error(`Asset attribute with ID ${attributeId} not found`);
            }

            if (attribute.deleted_at) {
                // Restore the asset attribute
                attribute.deleted_at = null;
                attribute.status = true;
            } else {
                // Soft delete the asset attribute
                attribute.deleted_at = new Date();
                attribute.status = false;
            }

            attribute.updated_at = new Date();
            return await attribute.save();
        };

        // Check if multiple IDs are provided
        if (ids && Array.isArray(ids)) {
            // Toggle soft delete for multiple asset attributes
            const promises = ids.map(toggleSoftDelete);
            const updatedAttributes = await Promise.all(promises);
            await logApiResponse(req, "Asset attributes updated successfully", 200, updatedAttributes);
            res.status(200).json({
                message: 'Asset attributes updated successfully',
                data: updatedAttributes
            });
        } else if (id) {
            // Toggle soft delete for a single asset attribute
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

module.exports = {
    createAssetAttribute,
    updateAssetAttribute,
    getAllAssetAttributes,
    getAssetAttributeById,
    toggleSoftDeleteAssetAttribute,
    paginatedAssetAttributes
}