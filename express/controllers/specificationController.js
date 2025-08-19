const mongoose = require('mongoose');
const { logApiResponse } = require('../utils/responseService');
const specification = require('../models/specification');

const createSpecification = async (req, res) => {
    const { asset_id, template_id, field_name, field_type, field_value, display_name, required, is_unique } = req.body;

    let validationErrors = {};

    // Validate asset_id
    if (!asset_id || !mongoose.Types.ObjectId.isValid(asset_id)) {
        validationErrors.asset_id = "Asset ID is required and must be a valid ObjectId";
    }

    // Validate template_id
    if (!template_id || !mongoose.Types.ObjectId.isValid(template_id)) {
        validationErrors.template_id = "Template ID is required and must be a valid ObjectId";
    }

    // Validate field_name
    if (!field_name) {
        validationErrors.field_name = "Field name is required";
    }

    // Validate field_type
    if (!field_type) {
        validationErrors.field_type = "Field type is required";
    }

    // Validate field_value based on field_type
    if (field_type === "select" && (field_value === undefined || field_value === "")) {
        validationErrors.field_value = "Field value is required for 'select' type";
    }

    // Validate display_name
    if (!display_name) {
        validationErrors.display_name = "Display name is required";
    }

    // Validate 'required' field
    if (required === undefined) {
        validationErrors.required = "Required status must be specified";
    }

    // If there are basic validation errors, return them before DB check
    if (Object.keys(validationErrors).length > 0) {
        await logApiResponse(req, "Validation Error", 400, validationErrors);
        return res.status(400).json({
            message: "Validation Error",
            errors: validationErrors
        });
    }

    try {
        if (is_unique === true) {
            const existingUnique = await specification.findOne({
                asset_id,
                template_id,
                field_name
            });

            if (existingUnique) {
                return res.status(400).json({
                    message: "The given data was invalid",
                    errors: {
                        field_name: `Field name '${field_name}' already exists for this template and asset.`
                    }
                });
            }
        }

        const newSpecification = new specification({
            asset_id,
            template_id,
            field_name,
            field_type,
            field_value,
            display_name,
            required,
            is_unique: is_unique === true,
            // master_id: master_id || null
        });

        const savedSpecification = await newSpecification.save();

        await logApiResponse(req, "Specification created successfully", 201, savedSpecification);
        return res.status(201).send(savedSpecification);

    } catch (error) {
        console.error("Failed to create Specification:", error);
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
    const { id, asset_id, template_id, field_name, is_unique, default: isDefault } = req.body;
    let validationErrors = {};
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "Validation Error",
            errors: { id: "Specification ID is required and must be a valid ObjectId" }
        });
    }

    try {
        if (is_unique === true) {
            const existingUnique = await specification.findOne({
                asset_id,
                template_id,
                field_name,
                _id: { $ne: id }
            });

            if (existingUnique) {
                return res.status(400).json({
                    message: "The given data was invalid",
                    errors: {
                        field_name: `Field name '${field_name}' already exists for this template and asset.`
                    }
                });
            }
        }
        if (isDefault === true || isDefault === "true") {
            const existingDefault = await specification.findOne({
                asset_id,
                template_id,
                field_name,
                default: true,
                _id: { $ne: id }
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
        const updatedSpecification = await specification.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSpecification) {
            await logApiResponse(req, "Specification not found", 404, {});
            return res.status(404).json({ message: "Specification not found" });
        }

        await logApiResponse(req, "Specification updated successfully", 200, updatedSpecification);
        return res.status(200).json(updatedSpecification);

    } catch (error) {
        console.error("Failed to update Specification:", error);
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
    const { asset_id, template_id } = req.body; // Changed from id to template_id
    try {
        // Find by template_id instead of the MongoDB document ID
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
            await logApiResponse(req, "Specification not found", 404, {}); // Log the not found response
            return res.status(404).send({ message: "Specification not found" });
        }

        await logApiResponse(req, "Specification successfully deleted", 200, { id }); // Log the success response
        res.status(200).send({ message: "Specification successfully deleted" });
    } catch (error) {
        await logApiResponse(req, "Error deleting Specification", 500, { error: error.message }); // Log the error response
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

    // ✅ Allow only safe sort fields
    const allowedSortFields = ['_id', 'field_name', 'display_name', 'created_at'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };

    // ✅ Build search & filter query
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


module.exports = {
    createSpecification, updateSpecification, getSpecifications, getSpecification, getAssetSpecification, deleteSpecification, paginatedSpecifications
}