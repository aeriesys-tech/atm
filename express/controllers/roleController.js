const Role = require('../models/Role');
const RoleGroup = require('../models/RoleGroup');
const mongoose = require('mongoose');
const { logApiResponse } = require('../utils/responseService');

// const paginatedRoles = async (req, res) => {
//     const { page = 1, limit = 10, sortBy = 'role_code', order = 'desc', search = '', status } = req.query;
//     const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
//     const searchQuery = {
//         $and: [
//             search ? {
//                 $or: [
//                     { role_name: new RegExp(search, 'i') },
//                     { role_code: new RegExp(search, 'i') }
//                 ]
//             } : {},
//             status ? { status: status === 'active' } : {}
//         ]
//     };

//     try {
//         const roles = await Role.find(searchQuery)
//             .sort(sort)
//             .skip((page - 1) * limit)
//             .limit(Number(limit));
//         const count = await Role.countDocuments(searchQuery);
//         await logApiResponse(req, 'Roles retrieved successfully', 200, { roles, totalPages: Math.ceil(count / limit), currentPage: Number(page), totalItems: count });

//         res.status(200).json({
//             totalPages: Math.ceil(count / limit),
//             currentPage: Number(page),
//             roles,
//             totalItems: count,
//         });
//     } catch (error) {
//         console.error("Error retrieving paginated roles:", error);
//         await logApiResponse(req, 'Error retrieving paginated roles', 500, { error: error.message });

//         res.status(500).json({ message: "Error retrieving paginated roles", error: error.message });
//     }
// };

const paginatedRoles = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'role_code',
        order = 'asc',
        search = '',
        status
    } = req.query;

    const allowedSortFields = ['_id', 'role_code', 'role_name', 'created_at'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };

    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { role_name: new RegExp(search, 'i') },
                    { role_code: new RegExp(search, 'i') }
                ]
            } : {},
            status !== undefined ? { status: status === 'active' } : {}
        ]
    };

    try {
        const roles = await Role.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await Role.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated roles retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            roles,
            totalItems: count
        });

        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            roles,
            totalItems: count
        });
    } catch (error) {
        console.error("Error retrieving paginated roles:", error);
        await logApiResponse(req, "Failed to retrieve paginated roles", 500, { error: error.message });

        res.status(500).json({
            message: "Failed to retrieve paginated roles",
            error: error.message
        });
    }
};


const createRole = async (req, res) => {
    const { role_group_id, role_code, role_name } = req.body;

    let validationErrors = {};
    if (!role_group_id || !mongoose.Types.ObjectId.isValid(role_group_id)) {
        validationErrors.role_group_id = "Role group ID is required and must be valid";
    }

    if (!role_code) {
        validationErrors.role_code = "Role code is required";
    }

    if (!role_name) {
        validationErrors.role_name = "Role name is required";
    }

    if (Object.keys(validationErrors).length > 0) {
        await logApiResponse(req, "Validation Error", 400, validationErrors); // Log the response
        return res.status(400).json({
            message: "Validation Error",
            errors: validationErrors
        });
    }

    try {
        const roleGroupExists = await RoleGroup.findById(role_group_id);
        if (!roleGroupExists) {
            validationErrors.role_group_id = "Role group not found";
        }
        const existingRoleCode = await Role.findOne({ role_code });
        if (existingRoleCode) {
            validationErrors.role_code = "Role with this code already exists";
        }

        const existingRoleName = await Role.findOne({ role_name });
        if (existingRoleName) {
            validationErrors.role_name = "Role with this name already exists";
        }
        if (Object.keys(validationErrors).length > 0) {
            await logApiResponse(req, "Duplicate Key Error", 409, validationErrors); // Log the response
            return res.status(409).json({
                message: "Duplicate Key Error",
                errors: validationErrors
            });
        }

        const newRole = new Role({
            role_group_id,
            role_code,
            role_name
        });
        await newRole.save();

        await logApiResponse(req, "Role created successfully", 201, newRole);

        res.status(201).json({
            message: "Role created successfully",
            data: newRole
        });
    } catch (error) {
        console.error("Failed to create role:", error);

        let errors = {};

        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
        }

        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.role_code) {
                errors.role_code = "Role with this code already exists";
            }
            if (error.keyPattern && error.keyPattern.role_name) {
                errors.role_name = "Role with this name already exists";
            }
        }

        if (Object.keys(errors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, errors);
            res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else {
            await logApiResponse(req, "Internal Server Error", 500, { message: "An unexpected error occurred" }); // Log the response
            res.status(500).json({
                message: "Internal Server Error",
                errors: {
                    message: "An unexpected error occurred"
                }
            });
        }
    }
};

const updateRole = async (req, res) => {

    const { id, role_group_id, role_code, role_name, status, deleted_at } = req.body;

    let validationErrors = {};
    if (role_group_id === "") {
        validationErrors.role_group_id = "Please select a role group";
    } else if (role_group_id && !mongoose.Types.ObjectId.isValid(role_group_id)) {
        validationErrors.role_group_id = "Role group ID must be valid";
    }

    // Validate role_code
    if (!role_code) {
        validationErrors.role_code = "Role code is required";
    }

    // Validate role_name
    if (!role_name) {
        validationErrors.role_name = "Role name is required";
    }

    // If there are validation errors, return them
    if (Object.keys(validationErrors).length > 0) {
        await logApiResponse(req, "Validation Error", 400, validationErrors); // Log the response
        return res.status(400).json({
            message: "Validation Error",
            errors: validationErrors
        });
    }

    try {
        if (role_group_id && !(await RoleGroup.findById(role_group_id))) {
            validationErrors.role_group_id = "Role group not found";
        }

        if (role_code) {
            const existingRole = await Role.findOne({ role_code, _id: { $ne: id } });
            if (existingRole) {
                validationErrors.role_code = "Role with this code already exists";
            }
        }

        // Check if a role with the same name exists and is not the same as the role being updated
        if (role_name) {
            const existingRoleName = await Role.findOne({ role_name, _id: { $ne: id } });
            if (existingRoleName) {
                validationErrors.role_name = "Role with this name already exists";
            }
        }

        // If there are validation errors after database checks, return them
        if (Object.keys(validationErrors).length > 0) {
            await logApiResponse(req, "Duplicate Key Error", 409, validationErrors); // Log the response
            return res.status(409).json({
                message: "Duplicate Key Error",
                errors: validationErrors
            });
        }

        // Find the role by ID and update it
        const updatedRole = await Role.findByIdAndUpdate(id, {
            role_group_id,
            role_code,
            role_name,
            status,
            deleted_at,
            updated_at: Date.now()
        }, { new: true, runValidators: true }); // Return the updated document and run validators

        if (!updatedRole) {
            await logApiResponse(req, "Validation Error", 404, { id: "Role not found" }); // Log the response
            return res.status(404).json({
                message: "Validation Error",
                errors: {
                    id: "Role not found"
                }
            });
        }

        // Log the success response
        await logApiResponse(req, "Role updated successfully", 200, updatedRole);

        // Send a successful response back with updated role data
        res.status(200).json({
            message: "Role updated successfully",
            data: updatedRole
        });
    } catch (error) {
        console.error("Failed to update role:", error);

        let errors = {};

        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
        }

        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.role_code) {
                errors.role_code = "Role with this code already exists";
            }
            if (error.keyPattern && error.keyPattern.role_name) {
                errors.role_name = "Role with this name already exists";
            }
        }

        if (Object.keys(errors).length > 0) {
            await logApiResponse(req, "Validation Error", 400, errors); // Log the response
            res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else {
            await logApiResponse(req, "Internal Server Error", 500, { message: "An unexpected error occurred" }); // Log the response
            res.status(500).json({
                message: "Internal Server Error",
                errors: {
                    message: "An unexpected error occurred"
                }
            });
        }
    }
};

const getRoles = async (req, res) => {
    try {
        // Fetch all roles from the database with status true
        const roles = await Role.find({ status: true });

        // Log the successful response
        await logApiResponse(req, "Roles retrieved successfully", 200, roles);

        // Send a successful response back with the roles data
        res.status(200).json({
            message: "Roles retrieved successfully",
            roles: roles
        });
    } catch (error) {
        console.error("Failed to retrieve roles:", error);

        // Log the error response
        await logApiResponse(req, "Failed to retrieve roles", 500, { error: error.message });

        res.status(500).json({
            message: "Failed to retrieve roles",
            error: error.message
        });
    }
};

const getRole = async (req, res) => {
    const { id } = req.params; // Get the role ID from the URL parameter

    try {
        // Fetch the role by ID from the database
        const role = await Role.findById(id);

        if (!role) {
            // Log the error response for role not found
            await logApiResponse(req, "Role not found", 404, {});

            return res.status(404).json({
                message: "Role not found"
            });
        }

        // Log the successful response
        await logApiResponse(req, "Role retrieved successfully", 200, role);

        // Send a successful response back with the role data
        res.status(200).json({
            message: "Role retrieved successfully",
            data: role
        });
    } catch (error) {
        console.error("Failed to retrieve role:", error);

        if (error.kind === 'ObjectId') {
            // Log the error response for invalid role ID format
            await logApiResponse(req, "Invalid role ID format", 400, { error: error.message });

            return res.status(400).json({
                message: "Invalid role ID format",
                error: error.message
            });
        }

        // Log the general error response
        await logApiResponse(req, "Failed to retrieve role", 500, { error: "An unexpected error occurred" });

        res.status(500).json({
            message: "Failed to retrieve role",
            error: "An unexpected error occurred"
        });
    }
};


const deleteRole = async (req, res) => {
    try {
        const { id, ids } = req.body;

        // Function to toggle soft delete for a single role
        const toggleSoftDelete = async (roleId) => {
            const role = await Role.findById(roleId);
            if (!role) {
                throw new Error(`Role with ID ${roleId} not found`);
            }

            if (role.deleted_at) {
                // Restore the role
                role.deleted_at = null;
                role.status = true;
            } else {
                // Soft delete the role
                role.deleted_at = new Date();
                role.status = false;
            }

            role.updated_at = new Date();
            return await role.save();
        };

        // Check if multiple IDs are provided
        if (ids && Array.isArray(ids)) {
            // Toggle soft delete for multiple roles
            const promises = ids.map(toggleSoftDelete);
            const updatedRoles = await Promise.all(promises);

            // Log the successful response
            await logApiResponse(req, 'Roles updated successfully', 200, updatedRoles);

            res.status(200).json({
                message: 'Roles updated successfully',
                data: updatedRoles
            });
        } else if (id) {
            // Toggle soft delete for a single role
            const updatedRole = await toggleSoftDelete(id);

            // Log the successful response
            await logApiResponse(req, updatedRole.deleted_at ? 'Role soft-deleted successfully' : 'Role restored successfully', 200, updatedRole);

            res.status(200).json({
                message: updatedRole.deleted_at ? 'Role soft-deleted successfully' : 'Role restored successfully',
                data: updatedRole
            });
        } else {
            // Log the bad request response
            await logApiResponse(req, 'No ID or IDs provided', 400, {});

            res.status(400).json({ message: 'No ID or IDs provided' });
        }
    } catch (error) {
        console.error('Server error', error);

        if (error.message && error.message.includes('not found')) {
            // Log the not found error response
            await logApiResponse(req, error.message, 404, {});

            res.status(404).json({ message: error.message });
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // Log the invalid ID format error response
            await logApiResponse(req, 'Invalid role ID format', 400, { error: error.message });

            res.status(400).json({ message: 'Invalid role ID format', error: error.message });
        } else {
            // Log the server error response
            await logApiResponse(req, 'Server error', 500, { error: error.message });

            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};

const destroyRole = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return logApiResponse(req, 'Role ID is required', 400, false, null, res);
        }

        const role = await Role.findOne({ _id: id }).lean({ virtuals: false });

        if (!role) {
            return logApiResponse(req, 'Role not found', 404, false, null, res);
        }

        await Role.deleteOne({ _id: id });
        await logApiResponse(req, 'Role permanently deleted', 200, true, null, res);
        res.status(200).json({ message: 'role permanently deleted' });
    } catch (error) {
        return logApiResponse(req, error.message || 'Internal Server Error', 500, false, null, res);
    }
};



module.exports = {
    paginatedRoles,
    createRole,
    updateRole,
    getRoles,
    getRole,
    deleteRole,
    destroyRole
}