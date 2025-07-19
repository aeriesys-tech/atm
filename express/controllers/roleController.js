const Role = require('../models/Role');
const RoleGroup = require('../models/RoleGroup');
const mongoose = require('mongoose');
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const { createNotification } = require('../utils/notification');


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
    try {
        const { role_group_id, role_code, role_name } = req.body;

        const role = await Role.findOne({
            $or: [{ role_code }, { role_name }]
        });
        if (role) {
            let errors = {};
            if (role.role_code === role_code) errors.role_code = "Role code already exists";
            if (role.role_name === role_name) errors.role_name = "Role name already exists";
            await logApiResponse(req, "Duplicate Role", 400, errors);
            return res.status(400).json({ message: "Duplicate Role", errors });
        }
        const newRole = await Role.create({ role_group_id, role_code, role_name });
        await redisClient.del('roles');

        await logApiResponse(req, "Role created successfully", 201, newRole);
        await createNotification(req, 'Role', newRole._id, 'Role created successfully');

        res.status(201).json({
            message: "Role  created successfully", data: newRole
        });
    } catch (error) {
        console.log("error:", error);
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};

const updateRole = async (req, res) => {
    try {
        const { id, role_group_id, role_code, role_name, status, deleted_at } = req.body;
        const existingRole = await Role.findById(id);
        if (!existingRole) {
            return logApiResponse(req, "Role not found", 404, { id: "Role not found" }) &&
                res.status(404).json({ message: "Role not found", errors: { id: "Role not found" } });
        }

        const [duplicateCode, duplicateName] = await Promise.all([
            Role.findOne({ role_code, _id: { $ne: id } }),
            Role.findOne({ role_name, _id: { $ne: id } })
        ]);

        if (duplicateCode || duplicateName) {
            const errors = {};
            if (duplicateCode) errors.role_code = "Role code already exists";
            if (duplicateName) errors.role_name = "Role name already exists";

            return logApiResponse(req, "Validation Error", 400, errors) &&
                res.status(400).json({ message: "Validation Error", errors });
        }
        await Role.findByIdAndUpdate(id, { role_group_id, role_code, role_name, status, deleted_at, updated_at: Date.now() });
        const updatedRole = await Role.findById(id);
        await createNotification(req, 'Role', id, 'Role Updated successfully');
        await logApiResponse(req, "Role updated successfully", 200, updatedRole);
        return res.status(200).json({ message: "Role updated successfully", data: updatedRole });

    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });

        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await Role.find({ status: true });
        await logApiResponse(req, "Roles retrieved successfully", 200, roles);
        res.status(200).json({ message: "Roles retrieved successfully", roles: roles });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};

const getRole = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await Role.findById(id);
        if (!role) {
            await logApiResponse(req, "Role not found", 404, {});
            return res.status(404).json({ message: "Role not found" });
        }
        await logApiResponse(req, "Role retrieved successfully", 200, role);
        res.status(200).json({ message: "Role retrieved successfully", data: role });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const deleteRole = async (req, res) => {
    try {
        const { id, ids } = req.body;

        const toggleSoftDelete = async (_id) => {
            const role = await Role.findById(_id);
            if (!role) throw new Error(`Role with ID ${_id} not found`);
            role.deleted_at = role.deleted_at ? null : new Date();
            role.status = !role.deleted_at;
            role.updated_at = new Date();
            return role.save();
        };

        if (Array.isArray(ids)) {
            const updatedRoles = await Promise.all(ids.map(toggleSoftDelete));
            await logApiResponse(req, 'Roles updated successfully', 200, updatedRoles);
            return res.status(200).json({ message: 'Roles updated successfully', data: updatedRoles });
        }

        if (id) {
            const updatedRole = await toggleSoftDelete(id);
            const message = updatedRole.deleted_at ? 'Role is inactivated successfully' : 'Role is activated successfully';
            await createNotification(req, 'Role', id, message);
            await logApiResponse(req, message, 200, updatedRole);
            return res.status(200).json({ message, data: updatedRole });
        }

        await logApiResponse(req, 'No ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No ID or IDs provided' });

    } catch (error) {
        await logApiResponse(req, "Role delete/restore failed", 500, { error: error.message });
        return res.status(500).json({ message: "Role delete/restore failed", error: error.message });
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
        await createNotification(req, 'Role', id, 'Role permanently deleted');
        await logApiResponse(req, 'Role permanently deleted', 200, true, null, res);
        res.status(200).json({ message: 'role permanently deleted' });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};

module.exports = { paginatedRoles, createRole, updateRole, getRoles, getRole, deleteRole, destroyRole }