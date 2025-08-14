const Role = require('../models/role');
const RoleGroup = require('../models/roleGroup');
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

	const safeSortBy = ['_id', 'role_code', 'role_name', 'created_at'].includes(sortBy)
		? sortBy
		: '_id';

	const sort = { [safeSortBy]: order === 'desc' ? -1 : 1 };

	const match = {};

	if (status === 'true' || status === 'false') {
		match.status = status === 'true';
	}

	if (search) {
		match.$or = [
			{ role_name: new RegExp(search, 'i') },
			{ role_code: new RegExp(search, 'i') },
			{ 'role_group.role_group_name': new RegExp(search, 'i') }
		];
	}

	try {
		const pipeline = [
			{
				$lookup: {
					from: 'rolegroups',
					localField: 'role_group_id',
					foreignField: '_id',
					as: 'role_group'
				}
			},
			{ $unwind: { path: '$role_group', preserveNullAndEmptyArrays: true } },
			{ $match: match },
			{ $sort: sort },
			{ $skip: (page - 1) * limit },
			{ $limit: Number(limit) }
		];

		const countPipeline = [
			{
				$lookup: {
					from: 'rolegroups',
					localField: 'role_group_id',
					foreignField: '_id',
					as: 'role_group'
				}
			},
			{ $unwind: { path: '$role_group', preserveNullAndEmptyArrays: true } },
			{ $match: match },
			{ $count: 'total' }
		];

		const [roles, countResult] = await Promise.all([
			Role.aggregate(pipeline),
			Role.aggregate(countPipeline)
		]);

		const totalItems = countResult[0]?.total || 0;

		const responseData = {
			totalPages: Math.ceil(totalItems / limit),
			currentPage: Number(page),
			totalItems,
			roles
		};

		await logApiResponse(req, "Paginated roles retrieved successfully", 200, responseData);
		res.status(200).json(responseData);
	} catch (error) {
		console.error("Error retrieving paginated roles:", error);
		await logApiResponse(req, "Failed to retrieve paginated roles", 500, { error: error.message });
		res.status(500).json({ message: "Failed to retrieve paginated roles", error: error.message });
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
		await createNotification(req, 'Role', newRole._id, ` "${newRole.role_name}" created successfully`, 'master');

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
			const errors = { id: "Role not found" };
			await logApiResponse(req, "Role not found", 404, errors);
			return res.status(404).json({ message: "Role not found", errors });
		}

		const [duplicateCode, duplicateName] = await Promise.all([
			Role.findOne({ role_code, _id: { $ne: id } }),
			Role.findOne({ role_name, _id: { $ne: id } })
		]);

		const errors = {};
		if (duplicateCode) errors.role_code = "Role code already exists";
		if (duplicateName) errors.role_name = "Role name already exists";

		if (Object.keys(errors).length > 0) {
			await logApiResponse(req, "Validation Error", 400, errors);
			return res.status(400).json({ message: "Validation Error", errors });
		}

		const beforeUpdate = {
			role_group_id: existingRole.role_group_id,
			role_code: existingRole.role_code,
			role_name: existingRole.role_name,
			status: existingRole.status,
			deleted_at: existingRole.deleted_at
		};

		await Role.findByIdAndUpdate(id, {
			role_group_id,
			role_code,
			role_name,
			status,
			deleted_at,
			updated_at: Date.now()
		});

		const updatedRole = await Role.findById(id);

		const afterUpdate = {
			role_group_id: updatedRole.role_group_id,
			role_code: updatedRole.role_code,
			role_name: updatedRole.role_name,
			status: updatedRole.status,
			deleted_at: updatedRole.deleted_at
		};

		const message = `Role updated successfully.\nBefore: ${JSON.stringify(beforeUpdate)}\nAfter: ${JSON.stringify(afterUpdate)}`;

		await createNotification(req, 'Role', id, message, 'master');
		await logApiResponse(req, "Role updated successfully", 200, updatedRole);

		return res.status(200).json({ message: "Role updated successfully", data: updatedRole });

	} catch (error) {
		await logApiResponse(req, "Failed to update role", 500, { error: error.message });
		return res.status(500).json({ message: "Failed to update role", error: error.message });
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

			const wasDeleted = !!role.deleted_at;
			role.deleted_at = wasDeleted ? null : new Date();
			role.status = !role.deleted_at;
			role.updated_at = new Date();

			const updatedRole = await role.save();
			const action = wasDeleted ? 'activated' : 'inactivated';
			const message = ` "${updatedRole.role_name}" has been ${action} successfully`;

			return { updatedRole, message };
		};

		if (Array.isArray(ids)) {
			const results = await Promise.all(ids.map(toggleSoftDelete));
			const updatedRoles = results.map(r => r.updatedRole);

			await logApiResponse(req, 'Roles updated successfully', 200, updatedRoles);
			return res.status(200).json({ message: 'Roles updated successfully', data: updatedRoles });
		}

		if (id) {
			const { updatedRole, message } = await toggleSoftDelete(id);

			await createNotification(req, 'Role', id, message, 'master');
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

		const role = await Role.findById(id).lean();
		if (!role) {
			return logApiResponse(req, 'Role not found', 404, false, null, res);
		}

		await Role.deleteOne({ _id: id });

		const message = `"${role.role_name}" permanently deleted`;
		await createNotification(req, 'Role', id, message, 'master');
		await logApiResponse(req, message, 200, true, null, res);

		return res.status(200).json({ message });
	} catch (error) {
		await logApiResponse(req, "Failed to delete role", 500, { error: error.message });
		return res.status(500).json({ message: "Failed to delete role", error: error.message });
	}
};


module.exports = { paginatedRoles, createRole, updateRole, getRoles, getRole, deleteRole, destroyRole }
