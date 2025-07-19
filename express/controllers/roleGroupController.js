const RoleGroup = require('../models/RoleGroup');
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const { createNotification } = require('../utils/notification');

const paginatedRoleGroups = async (req, res) => {
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
        const role_group = await RoleGroup.findOne({
            $or: [{ role_group_code }, { role_group_name }]
        });
        if (role_group) {
            let errors = {};
            if (role_group.role_group_code === role_group_code) errors.role_group_code = "Role Group code already exists";
            if (role_group.role_group_name === role_group_name) errors.role_group_name = "Role Group name already exists";

            await logApiResponse(req, "Duplicate Role Group", 400, errors);
            return res.status(400).json({ message: "Duplicate Role Group", errors });
        }
        const newRoleGroup = await RoleGroup.create({ role_group_code, role_group_name });
        await redisClient.del('role_groups');
        await createNotification(req, 'Role Group', newRoleGroup._id, 'Role Group created successfully');
        await logApiResponse(req, "Role Group created successfully", 201, newRoleGroup);
        res.status(201).json({
            message: "Role Group  created successfully", data: newRoleGroup
        });
    } catch (error) {
        await logApiResponse(req, "Failed to create role group", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role group", error: error.message });
    }
};

const updateRoleGroup = async (req, res) => {
    try {
        const { id, role_group_code, role_group_name, status, deleted_at } = req.body;
        const existingRoleGroup = await RoleGroup.findById(id);
        if (!existingRoleGroup) {
            return logApiResponse(req, "Role group not found", 404, { id: "Role group not found" }) &&
                res.status(404).json({ message: "Role group not found", errors: { id: "Role group  not found" } });
        }

        const [duplicateCode, duplicateName] = await Promise.all([
            RoleGroup.findOne({ role_group_code, _id: { $ne: id } }),
            RoleGroup.findOne({ role_group_name, _id: { $ne: id } })
        ]);

        if (duplicateCode || duplicateName) {
            const errors = {};
            if (duplicateCode) errors.role_group_code = "Role group code already exists";
            if (duplicateName) errors.role_group_name = "Role group name already exists";

            return logApiResponse(req, "Validation Error", 400, errors) &&
                res.status(400).json({ message: "Validation Error", errors });
        }
        await RoleGroup.findByIdAndUpdate(id, { role_group_code, role_group_name, status, deleted_at, updated_at: Date.now() });
        const updatedRoleGroup = await RoleGroup.findById(id);
        await createNotification(req, 'Role Group', id, 'Role Group updated successfully');
        await logApiResponse(req, "Role group updated successfully", 200, updatedRoleGroup);
        return res.status(200).json({ message: "Role group updated successfully", data: updatedRoleGroup });

    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const getRoleGroups = async (req, res) => {
    try {
        const role_groups = await RoleGroup.find({ status: true });
        await logApiResponse(req, "Role Groups retrieved successfully", 200, role_groups);
        res.status(200).json({ message: "Role Groups retrieved successfully", role_groups: role_groups });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const getRoleGroup = async (req, res) => {
    const { id } = req.body;
    try {
        const role_group = await RoleGroup.findById(id);
        if (!role_group) {
            await logApiResponse(req, "Role group not found", 404, {});
            return res.status(404).json({ message: "Role group not found" });
        }
        await logApiResponse(req, "Role group retrieved successfully", 200, role_group);
        res.status(200).json({ message: "Role group retrieved successfully", data: role_group });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const deleteRoleGroup = async (req, res) => {
    try {
        const { id, ids } = req.body;

        const toggleSoftDelete = async (_id) => {
            const role_group = await RoleGroup.findById(_id);
            if (!role_group) throw new Error(`Role group with ID ${_id} not found`);
            role_group.deleted_at = role_group.deleted_at ? null : new Date();
            role_group.status = !role_group.deleted_at;
            role_group.updated_at = new Date();
            return role_group.save();
        };

        if (Array.isArray(ids)) {
            const updatedRoleGroups = await Promise.all(ids.map(toggleSoftDelete));
            await logApiResponse(req, 'Role Groups updated successfully', 200, updatedRoleGroups);
            return res.status(200).json({ message: 'Role Groups updated successfully', data: updatedRoleGroups });
        }

        if (id) {
            const updatedRoleGroup = await toggleSoftDelete(id);
            const message = updatedRoleGroup.deleted_at ? 'Role Group is inactivated successfully' : 'Role Group is activated successfully';
            await createNotification(req, 'Role Group', id, message);
            await logApiResponse(req, message, 200, updatedRoleGroup);
            return res.status(200).json({ message, data: updatedRoleGroup });
        }

        await logApiResponse(req, 'No ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No ID or IDs provided' });

    } catch (error) {
        await logApiResponse(req, "Role delete/restore failed", 500, { error: error.message });
        return res.status(500).json({ message: "Role delete/restore failed", error: error.message });
    }
};

const destroyRoleGroup = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return logApiResponse(req, 'Role Group ID is required', 400, false, null, res);
        }
        const role_group = await RoleGroup.findOne({ _id: id }).lean({ virtuals: false });
        if (!role_group) {
            return logApiResponse(req, 'Role not found', 404, false, null, res);
        }
        await RoleGroup.deleteOne({ _id: id });
        await createNotification(req, 'Role Group', id, 'Role Group permanently deleted');
        await logApiResponse(req, 'Role Group permanently deleted', 200, true, null, res);
        res.status(200).json({ message: 'Role Group permanently deleted' });
    } catch (error) {
        await logApiResponse(req, "Failed to create role group", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role group", error: error.message });
    }
};


module.exports = {
    paginatedRoleGroups,
    createRoleGroup,
    updateRoleGroup,
    getRoleGroups,
    getRoleGroup,
    deleteRoleGroup,
    destroyRoleGroup

}