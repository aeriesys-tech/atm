const RoleGroup = require('../models/RoleGroup');
const { logApiResponse } = require('../utils/responseService');

const getPaginatedRoleGroups = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'role_group_code',
        order = 'asc',
        search = '',
        status
    } = req.query;

    const allowedSortFields = ['_id', 'role_group_name', 'role_group_code'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };
    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { role_group_name: new RegExp(search, 'i') },
                    { role_group_code: new RegExp(search, 'i') }
                ]
            } : {},
            status !== undefined ? { status: status === 'active' } : {}
        ]
    };

    try {
        const roleGroups = await RoleGroup.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await RoleGroup.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated role groups retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            roleGroups,
            totalItems: count
        });

        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            roleGroups,
            totalItems: count
        });
    } catch (error) {
        console.error("Error retrieving paginated role groups:", error);
        await logApiResponse(req, "Failed to retrieve paginated role groups", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve paginated role groups",
            error: error.message
        });
    }
};

const createRoleGroup = async (req, res) => {
    try {
        const { role_group_code, role_group_name } = req.body;

        // Check if either code or name already exists (excluding soft-deleted ones if needed)
        const existingRoleGroup = await RoleGroup.findOne({
            $or: [
                { role_group_code },
                { role_group_name }
            ], // Optional: ignore soft-deleted
        });

        if (existingRoleGroup) {
            let errors = {};
            if (existingRoleGroup.role_group_code === role_group_code) {
                errors.role_group_code = "Role group code already exists";
            }
            if (existingRoleGroup.role_group_name === role_group_name) {
                errors.role_group_name = "Role group name already exists";
            }

            await logApiResponse(req, "Duplicate Role Group", 400, errors);

            return res.status(400).json({
                message: "Duplicate Role Group",
                errors
            });
        }

        // Create and save the new role group
        const newRoleGroup = new RoleGroup({
            role_group_code,
            role_group_name
        });

        await newRoleGroup.save();

        await logApiResponse(req, "Role group created successfully", 201, newRoleGroup);

        res.status(201).json({
            message: "Role group created successfully",
            data: newRoleGroup
        });

    } catch (error) {
        console.error("Failed to create role group:", error);

        let errors = {};
        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });

            await logApiResponse(req, "Validation Error", 400, errors);

            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.role_group_code) {
                errors.role_group_code = "Role group code must be unique";
            }
            if (error.keyPattern && error.keyPattern.role_group_name) {
                errors.role_group_name = "Role group name must be unique";
            }

            await logApiResponse(req, "Duplicate Key Error", 400, errors);

            return res.status(400).json({
                message: "Duplicate Key Error",
                errors
            });
        } else {
            const internalError = {
                message: "Internal Server Error",
                errors: "An unexpected error occurred"
            };

            await logApiResponse(req, internalError.message, 500, internalError);

            return res.status(500).json(internalError);
        }
    }
};

const updateRoleGroup = async (req, res) => {
    const { id } = req.params; // Using simple 'id' from the route parameter
    const { role_group_code, role_group_name, status, deleted_at } = req.body;

    try {
        const updatedRoleGroup = await RoleGroup.findByIdAndUpdate(id, {
            role_group_code,
            role_group_name,
            status,
            deleted_at,
            updated_at: Date.now()
        }, { new: true, runValidators: true });

        if (!updatedRoleGroup) {
            const errorMessage = {
                message: "Validation Error",
                errors: {
                    id: "Role group not found"
                }
            };

            await logApiResponse(req, errorMessage.message, 404, errorMessage);

            return res.status(404).json(errorMessage);
        }

        await logApiResponse(req, "Role group updated successfully", 200, updatedRoleGroup);

        res.status(200).json({
            message: "Role group updated successfully",
            data: updatedRoleGroup
        });
    } catch (error) {
        console.error("Error updating role group:", error);

        let errors = {};

        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });

            await logApiResponse(req, "Validation Error", 400, errors);

            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else if (error.code === 11000) { // Duplicate key error code
            if (error.keyPattern && error.keyPattern.role_group_code) {
                errors.role_group_code = "Role group code must be unique";
            }

            await logApiResponse(req, "Duplicate Key Error", 400, errors);

            return res.status(400).json({
                message: "Duplicate Key Error",
                errors
            });
        } else {
            const internalError = {
                message: "Internal Server Error",
                errors: {
                    message: "An unexpected error occurred"
                }
            };

            await logApiResponse(req, internalError.message, 500, internalError);

            return res.status(500).json(internalError);
        }
    }
};


const getRoleGroups = async (req, res) => {
    try {
        // Fetch all role groups from the database where status is true
        const roleGroups = await RoleGroup.find({ status: true });

        // Send a successful response back with the data
        await logApiResponse(req, "Role groups retrieved successfully", 200, roleGroups);
        res.status(200).json({
            message: "Role groups retrieved successfully",
            roleGroups: roleGroups
        });
    } catch (error) {
        console.error("Error retrieving role groups:", error);
        await logApiResponse(req, "Failed to retrieve role groups", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve role groups",
            error: error.message
        });
    }
};

const getRoleGroup = async (req, res) => {
    const { id } = req.params; // Get the 'id' from the URL parameters

    try {
        // Fetch the role group from the database by ID
        const roleGroup = await RoleGroup.findById(id);

        if (!roleGroup) {
            await logApiResponse(req, "Role group not found", 404, null);
            return res.status(404).json({
                message: "Role group not found"
            });
        }

        await logApiResponse(req, "Role group retrieved successfully", 200, roleGroup);
        // Send a successful response back with the data
        res.status(200).json({
            message: "Role group retrieved successfully",
            data: roleGroup
        });
    } catch (error) {
        console.error("Error retrieving role group:", error);

        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            await logApiResponse(req, "Invalid role group ID format", 400, error.message);
            return res.status(400).json({
                message: "Invalid role group ID format",
                error: error.message
            });
        }

        await logApiResponse(req, "Failed to retrieve role group", 500, "An unexpected error occurred");
        res.status(500).json({
            message: "Failed to retrieve role group",
            error: "An unexpected error occurred"
        });
    }
};



const deleteRoleGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { ids } = req.body;

        // Function to toggle soft delete for a single role group
        const toggleSoftDelete = async (roleGroupId) => {
            const roleGroup = await RoleGroup.findById(roleGroupId);
            if (!roleGroup) {
                throw new Error(`Role group with ID ${roleGroupId} not found`);
            }

            if (roleGroup.deleted_at) {
                // Restore the role group
                roleGroup.deleted_at = null;
                roleGroup.status = true;
            } else {
                // Soft delete the role group
                roleGroup.deleted_at = new Date();
                roleGroup.status = false;
            }

            roleGroup.updated_at = new Date();
            return await roleGroup.save();
        };

        // Check if multiple IDs are provided
        if (ids && Array.isArray(ids)) {
            // Toggle soft delete for multiple role groups
            const promises = ids.map(toggleSoftDelete);
            const updatedRoleGroups = await Promise.all(promises);

            await logApiResponse(req, 'Role groups updated successfully', 200, updatedRoleGroups);
            res.status(200).json({
                message: 'Role groups updated successfully',
                data: updatedRoleGroups
            });
        } else if (id) {
            // Toggle soft delete for a single role group
            const updatedRoleGroup = await toggleSoftDelete(id);

            await logApiResponse(req, updatedRoleGroup.deleted_at ? 'Role group soft-deleted successfully' : 'Role group restored successfully', 200, updatedRoleGroup);
            res.status(200).json({
                message: updatedRoleGroup.deleted_at ? 'Role group soft-deleted successfully' : 'Role group restored successfully',
                data: updatedRoleGroup
            });
        } else {
            await logApiResponse(req, 'No ID or IDs provided', 400, null);
            res.status(400).json({ message: 'No ID or IDs provided' });
        }
    } catch (error) {
        console.error('Server error', error);

        if (error.message && error.message.includes('not found')) {
            await logApiResponse(req, error.message, 404, null);
            res.status(404).json({ message: error.message });
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            await logApiResponse(req, 'Invalid role group ID format', 400, error.message);
            res.status(400).json({ message: 'Invalid role group ID format', error: error.message });
        } else {
            await logApiResponse(req, 'Server error', 500, error.message);
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};



module.exports = {
    getPaginatedRoleGroups,
    createRoleGroup,
    updateRoleGroup,
    getRoleGroups,
    getRoleGroup,
    deleteRoleGroup

}