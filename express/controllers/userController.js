const User = require('../models/User');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const Department = require('../models/Department');
const mongoose = require('mongoose');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const { logApiResponse } = require('../utils/responseService');
const { createNotification } = require('../utils/notification');

const createUser = async (req, res) => {
	try {
		const { name, username, email, password, mobile_no, role_id, department_id } = req.body;
		const avatarUrl = req.file ? req.file.path : null;

		const user = await User.findOne({
			$or: [{ email }, { username }]
		});
		if (user) {
			let errors = {};
			if (user.username === username) errors.username = "Username already exists";
			if (user.email === email) errors.email = "Email already exists";

			await logApiResponse(req, "Duplicate User", 400, errors);
			return res.status(400).json({ message: "Duplicate User", errors });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			name,
			username,
			email,
			password: hashedPassword,
			mobile_no,
			role_id,
			department_id,
			avatar: avatarUrl
		});

		await redisClient.del('users');

		const message = `User "${newUser.name}" created successfully.`;

		await createNotification(req, 'User', newUser._id, message, 'master');
		await logApiResponse(req, message, 201, newUser);

		res.status(201).json({
			message,
			data: newUser
		});
	} catch (error) {
		await logApiResponse(req, "Failed to create user", 500, { error: error.message });
		res.status(500).json({ message: "Failed to create user", error: error.message });
	}
};


const updateUser = async (req, res) => {
	try {
		const { id, name, username, email, mobile_no, role_id, department_id } = req.body;
		const avatarUrl = req.file ? req.file.location : null;

		const existingUser = await User.findById(id).lean();
		if (!existingUser) {
			await logApiResponse(req, "User not found", 404, { id: "User not found" });
			return res.status(404).json({ message: "User not found", errors: { id: "User not found" } });
		}

		const [duplicateUserName, duplicateEmail] = await Promise.all([
			User.findOne({ username, _id: { $ne: id } }),
			User.findOne({ email, _id: { $ne: id } })
		]);

		if (duplicateUserName || duplicateEmail) {
			const errors = {};
			if (duplicateUserName) errors.username = "Username already exists";
			if (duplicateEmail) errors.email = "Email already exists";
			await logApiResponse(req, "Validation Error", 400, errors);
			return res.status(400).json({ message: "Validation Error", errors });
		}

		const before = {
			name: existingUser.name,
			username: existingUser.username,
			email: existingUser.email,
			mobile_no: existingUser.mobile_no,
			role_id: existingUser.role_id,
			department_id: existingUser.department_id,
			avatar: existingUser.avatar
		};

		await User.findByIdAndUpdate(id, {
			name,
			username,
			email,
			mobile_no,
			role_id,
			department_id,
			avatar: avatarUrl,
			updated_at: Date.now()
		});

		const updatedUser = await User.findById(id).lean();

		const after = {
			name: updatedUser.name,
			username: updatedUser.username,
			email: updatedUser.email,
			mobile_no: updatedUser.mobile_no,
			role_id: updatedUser.role_id,
			department_id: updatedUser.department_id,
			avatar: updatedUser.avatar
		};

		const message = `User "${updatedUser.name}" updated successfully.\nBefore: ${JSON.stringify(before)}\nAfter: ${JSON.stringify(after)}`;

		await createNotification(req, 'User', id, message, 'master');
		await logApiResponse(req, "User updated successfully", 200, updatedUser);

		return res.status(200).json({ message: "User updated successfully", data: updatedUser });

	} catch (error) {
		await logApiResponse(req, "Failed to update user", 500, { error: error.message });
		return res.status(500).json({ message: "Failed to update user", error: error.message });
	}
};


const getUsers = async (req, res) => {
	try {
		const users = await User.find({ status: true }, '-password')
		await logApiResponse(req, "Users retrieved successfully", 200, users);
		res.status(200).json({
			message: "Users retrieved successfully",
			users: users
		});
	} catch (error) {
		await logApiResponse(req, "Failed to retrieve users", 500, { error: error.message });
		console.error("Failed to retrieve users:", error);
		res.status(500).json({
			message: "Failed to retrieve users",
			error: error.message
		});
	}
};

const getUser = async (req, res) => {
	const { id } = req.body; // Get the user ID from the URL parameter

	try {
		// Fetch the user by ID from the database excluding the password field
		const user = await User.findById(id, '-password')
			.populate('role_id', 'role_name') // Optionally populate role details
			.populate('department_id', 'department_name'); // Optionally populate department details

		if (!user) {
			await logApiResponse(req, "User not found", 404, { message: "User not found" });
			return res.status(404).json({
				message: "User not found"
			});
		}

		await logApiResponse(req, "User retrieved successfully", 200, user);
		// Send a successful response back with the user data
		res.status(200).json({
			message: "User retrieved successfully",
			data: user
		});
	} catch (error) {
		console.error("Failed to retrieve user:", error);

		if (error.kind === 'ObjectId') {
			await logApiResponse(req, "Invalid user ID format", 400, { message: "Invalid user ID format", error: error.message });
			return res.status(400).json({
				message: "Invalid user ID format",
				error: error.message
			});
		}

		await logApiResponse(req, "Failed to retrieve user", 500, { message: "Failed to retrieve user", error: "An unexpected error occurred" });
		res.status(500).json({
			message: "Failed to retrieve user",
			error: "An unexpected error occurred"
		});
	}
};



const deleteUser = async (req, res) => {
	try {
		const { id, ids } = req.body;

		const toggleSoftDelete = async (_id) => {
			const user = await User.findById(_id);
			if (!user) throw new Error(`User with ID ${_id} not found`);

			user.deleted_at = user.deleted_at ? null : new Date();
			user.status = !user.deleted_at;
			user.updated_at = new Date();
			await user.save();

			const action = user.deleted_at ? 'inactivated' : 'activated';
			const message = `User "${user.name}" is ${action} successfully`;
			await createNotification(req, 'User', _id, message, 'master');
			return { user, message };
		};

		if (Array.isArray(ids)) {
			const results = await Promise.all(ids.map(toggleSoftDelete));
			const updatedUsers = results.map(r => r.user);
			const messages = results.map(r => r.message);
			await logApiResponse(req, 'Users updated successfully', 200, updatedUsers);
			return res.status(200).json({ message: messages.join('; '), data: updatedUsers });
		}

		if (id) {
			const { user, message } = await toggleSoftDelete(id);
			await logApiResponse(req, message, 200, user);
			return res.status(200).json({ message, data: user });
		}

		await logApiResponse(req, 'No ID or IDs provided', 400, {});
		return res.status(400).json({ message: 'No ID or IDs provided' });

	} catch (error) {
		await logApiResponse(req, "User delete/restore failed", 500, { error: error.message });
		return res.status(500).json({ message: "User delete/restore failed", error: error.message });
	}
};


const paginatedUsers = async (req, res) => {
	const {
		page = 1,
		limit = 10,
		sortBy = 'name',
		order = 'desc',
		search = '',
		status
	} = req.query;

	const allowedSortFields = ['_id', 'name', 'email', 'mobile_no', 'created_at'];
	const cleanSortBy = String(sortBy).trim();
	const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

	const sort = {
		[safeSortBy]: order === 'desc' ? -1 : 1
	};

	const searchQuery = {
		$and: [
			search ? {
				$or: [
					{ name: new RegExp(search, 'i') },
					{ email: new RegExp(search, 'i') },
					{ mobile_no: new RegExp(search, 'i') },
					{ username: new RegExp(search, 'i') },
					...(isNaN(search) ? [] : [{ mobile_no: search }])
				]
			} : {},
			(status === 'true' || status === 'false') ? { status: status === 'true' } : {}
		]
	};

	try {
		const users = await User.find(searchQuery)
			.sort(sort)
			.skip((page - 1) * limit)
			.limit(Number(limit))
			.select('-password -jwt_token');

		const count = await User.countDocuments(searchQuery);

		await logApiResponse(req, "Paginated users retrieved successfully", 200, {
			totalPages: Math.ceil(count / limit),
			currentPage: Number(page),
			users,
			totalItems: count
		});

		res.status(200).json({
			totalPages: Math.ceil(count / limit),
			currentPage: Number(page),
			users,
			totalItems: count
		});
	} catch (error) {
		console.error("Error retrieving paginated users:", error);
		await logApiResponse(req, "Failed to retrieve paginated users", 500, { error: error.message });
		res.status(500).json({
			message: "Failed to retrieve paginated users",
			error: error.message
		});
	}
};


const destroyUser = async (req, res) => {
	try {
		const { id } = req.body;

		if (!id) {
			return logApiResponse(req, 'User ID is required', 400, false, null, res);
		}

		const user = await User.findOne({ _id: id }).lean();
		if (!user) {
			return logApiResponse(req, 'User not found', 404, false, null, res);
		}

		await User.deleteOne({ _id: id });

		const message = `User "${user.name}" permanently deleted`;
		await createNotification(req, 'User', id, message, 'master');
		await logApiResponse(req, message, 200, true, null, res);

		return res.status(200).json({ message });
	} catch (error) {
		await logApiResponse(req, 'Failed to delete User', 500, false, { error: error.message }, res);
		return res.status(500).json({ message: 'Failed to delete User', error: error.message });
	}
};


module.exports = {
	createUser,
	updateUser,
	getUsers,
	getUser,
	deleteUser,
	paginatedUsers,
	destroyUser
}
