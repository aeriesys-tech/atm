const mongoose = require('mongoose');
const { logApiResponse } = require('../utils/responseService');
const specification = require('../models/specification');
const { createNotification } = require('../utils/notification');


const createSpecification = async (req, res) => {
    const { asset_id, template_id, field_name, field_type, field_value, display_name, required, is_unique } = req.body;

    try {
        const existingUnique = await specification.findOne({
            asset_id,
            template_id,
            field_name,
            is_unique: true
        });

        if (existingUnique) {
            const errors = {
                field_name: `Field name '${field_name}' is already marked unique for this template and asset. Cannot create duplicate.`
            };
            await logApiResponse(req, "Duplicate unique field", 400, errors);
            return res.status(400).json({ message: "The given data was invalid", errors });
        }
        if (is_unique === true) {
            const duplicate = await specification.findOne({ asset_id, template_id, field_name });
            if (duplicate) {
                const errors = {
                    field_name: `Field name '${field_name}' already exists for this template and asset.`
                };
                await logApiResponse(req, "Duplicate field", 400, errors);
                return res.status(400).json({ message: "The given data was invalid", errors });
            }
        }
        const newSpecification = await specification.create({
            asset_id,
            template_id,
            field_name,
            field_type,
            field_value,
            display_name,
            required,
            is_unique: !!is_unique
        });
        const message = `Specification "${field_name}" created successfully`;
        await logApiResponse(req, message, 201, newSpecification);
        await createNotification(req, 'Specification', newSpecification._id, message, 'master');
        return res.status(201).json({ message, data: newSpecification });
    } catch (error) {
        console.error("Failed to create Specification:", error);
        let validationErrors = {};
        if (error.name === "ValidationError") {
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
        }
        if (error.code === 11000) {
            Object.keys(error.keyPattern).forEach(key => {
                validationErrors[key] = `'${error.keyValue[key]}' already exists. ${key} must be unique.`;
            });
        }
        await logApiResponse(req, "Error creating Specification", 400, validationErrors);
        return res.status(400).json({
            message: "Error creating Specification",
            errors: validationErrors
        });
    }
};



const updateSpecification = async (req, res) => {
    const { _id, asset_id, template_id, field_name, is_unique, default: isDefault } = req.body;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({
            message: "Validation Error",
            errors: { id: "Specification ID is required and must be a valid ObjectId" }
        });
    }

    try {
        // 1️⃣ Check uniqueness for is_unique
        if (is_unique === true) {
            const duplicate = await specification.findOne({
                asset_id,
                template_id,
                field_name,
                _id: { $ne: _id }
            });

            if (duplicate) {
                return res.status(400).json({
                    message: "The given data was invalid",
                    errors: {
                        field_name: `Field name '${field_name}' already exists for this template and asset.`
                    }
                });
            }
        }

        // 2️⃣ Check uniqueness for default
        if (isDefault === true || isDefault === "true") {
            const existingDefault = await specification.findOne({
                asset_id,
                template_id,
                field_name,
                default: true,
                _id: { $ne: _id }
            });

            if (existingDefault) {
                return res.status(400).json({
                    message: "The given data was invalid",
                    errors: {
                        [`${field_name}`]: `Another record already has '${field_name}' set as default (true).`
                    }
                });
            }
        }

        // 3️⃣ Get existing specification for snapshot
        const existingSpec = await specification.findById(_id);
        if (!existingSpec) {
            await logApiResponse(req, "Specification not found", 404, {});
            return res.status(404).json({ message: "Specification not found" });
        }

        const beforeUpdate = {
            asset_id: existingSpec.asset_id,
            template_id: existingSpec.template_id,
            field_name: existingSpec.field_name,
            is_unique: existingSpec.is_unique,
            default: existingSpec.default
        };

        // 4️⃣ Update specification
        const updatedSpecification = await specification.findByIdAndUpdate(
            _id,
            req.body,
            { new: true, runValidators: true }
        );

        const afterUpdate = {
            asset_id: updatedSpecification.asset_id,
            template_id: updatedSpecification.template_id,
            field_name: updatedSpecification.field_name,
            is_unique: updatedSpecification.is_unique,
            default: updatedSpecification.default
        };

        // 5️⃣ Create notification
        const message = `Specification "${updatedSpecification.field_name}" updated successfully.\nBefore: ${JSON.stringify(beforeUpdate)}\nAfter: ${JSON.stringify(afterUpdate)}`;
        await createNotification(req, 'Specification', _id, message, 'master');

        // 6️⃣ Log API response
        await logApiResponse(req, "Specification updated successfully", 200, updatedSpecification);

        return res.status(200).json({
            message: "Specification updated successfully",
            data: updatedSpecification
        });

    } catch (error) {
        console.error("Failed to update Specification:", error);
        let validationErrors = {};

        if (error.name === "ValidationError") {
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = error.errors[key].message;
            });
        }

        if (error.code === 11000) {
            Object.keys(error.keyPattern || {}).forEach(key => {
                validationErrors[key] = `'${error.keyValue[key]}' already exists. ${key} must be unique.`;
            });
        }

        await logApiResponse(req, "Error updating Specification", 400, validationErrors);
        return res.status(400).json({
            message: "Error updating Specification",
            errors: validationErrors
        });
    }
};

const getSpecifications = async (req, res) => {
    try {
        const specifications = await specification.find();
        await logApiResponse(req, "Specifications retrieved successfully", 200, specifications); // Log the success response
        res.status(200).send(specifications);
    } catch (error) {
        await logApiResponse(req, "Error retrieving Specifications", 500, error); // Log the error response
        res.status(500).send(error);
    }
};

const getSpecification = async (req, res) => {
    const { specification_id } = req.body;
    try {
        const specifications = await specification.find({ specification_id: specification_id });
        if (!specifications || specifications.length === 0) {
            await logApiResponse(req, "specifications not found for the given specifications", 404, {});
            return res.status(404).send({ message: "specifications not found for the given specifications" });
        }

        await logApiResponse(req, "specifications retrieved successfully", 200, specifications);
        res.status(200).send(specifications);
    } catch (error) {
        await logApiResponse(req, "Error retrieving specifications", 500, { error: error.message });
        res.status(500).send({ message: "Error retrieving specifications", error: error.message });
    }
};

const getAssetSpecification = async (req, res) => {
    const { asset_id, template_id } = req.body;
    try {
        const specifications = await specification.find({ template_id: template_id, asset_id: asset_id });

        if (!specifications || specifications.length === 0) {
            await logApiResponse(req, "specifications not found for the given template ID", 404, {}); // Log the not found response
            return res.status(404).send({ message: "specifications not found for the given specification ID" });
        }

        await logApiResponse(req, "Specifications retrieved successfully", 200, specifications); // Log the success response
        res.status(200).send(specifications);
    } catch (error) {
        await logApiResponse(req, "Error retrieving Specifications", 500, { error: error.message }); // Log the error response
        res.status(500).send({ message: "Error retrieving Specifications", error: error.message });
    }
};

const deleteSpecification = async (req, res) => {
    const { id } = req.body;
    try {
        const specification = await specification.findByIdAndDelete(id);

        if (!specification) {
            await logApiResponse(req, "Specification not found", 404, {});
            return res.status(404).send({ message: "Specification not found" });
        }
        await logApiResponse(req, "Specification successfully deleted", 200, { id });
        res.status(200).send({ message: "Specification successfully deleted" });
    } catch (error) {
        await logApiResponse(req, "Error deleting Specification", 500, { error: error.message });
        res.status(500).send({ message: "Error deleting Specification", error: error.message });
    }
};

const paginatedSpecifications = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        order = 'desc',
        search = '',
        field_type,
        asset_id,
        template_id,
        status
    } = req.query;

    const allowedSortFields = ['_id', 'field_name', 'display_name', 'created_at'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };

    const searchQuery = {
        $and: [
            search
                ? {
                    $or: [
                        { field_name: new RegExp(search, 'i') },
                        { display_name: new RegExp(search, 'i') }
                    ]
                }
                : {},
            field_type ? { field_type } : {},
            asset_id ? { asset_id } : {},
            template_id ? { template_id } : {},
            (status === 'true' || status === 'false') ? { status: status === 'true' } : {}
        ]
    };

    try {
        const specifications = await specification.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await specification.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated specifications retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            specifications,
            totalItems: count,
        });

        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            specifications,
            totalItems: count,
        });
    } catch (error) {
        console.error("Error retrieving paginated specifications:", error);

        await logApiResponse(req, "Error retrieving paginated specifications", 500, { error: error.message });

        res.status(500).json({
            message: "Error retrieving paginated specifications",
            error: error.message
        });
    }
};

const destroySpecification = async (req, res) => {
    try {
        const { id } = req.body;

        // 1️⃣ Validate ID
        if (!id) {
            await logApiResponse(req, 'Specification ID is required', 400, { id: "Required" });
            return res.status(400).json({ message: 'Specification ID is required', errors: { id: "Required" } });
        }

        // 2️⃣ Check if specification exists
        const spec = await specification.findById(id).lean();
        if (!spec) {
            await logApiResponse(req, 'Specification not found', 404, { id: "Not Found" });
            return res.status(404).json({ message: 'Specification not found', errors: { id: "Not Found" } });
        }

        // 3️⃣ Delete specification
        await specification.deleteOne({ _id: id });

        // 4️⃣ Create notification
        const message = `"${spec.field_name}" permanently deleted`;
        await createNotification(req, 'Specification', id, message, 'specification');

        // 5️⃣ Log API response
        await logApiResponse(req, message, 200, { id });

        return res.status(200).json({ message });

    } catch (error) {
        console.error("Failed to delete specification:", error);
        await logApiResponse(req, "Failed to delete specification", 500, { error: error.message });
        return res.status(500).json({ message: "Failed to delete specification", error: error.message });
    }
};



module.exports = {
    createSpecification, updateSpecification, getSpecifications, getSpecification, getAssetSpecification, deleteSpecification, paginatedSpecifications, destroySpecification
}