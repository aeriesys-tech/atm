const User = require('../models/user');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const Department = require('../models/department');
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
		await createNotification(req, 'User', newUser._id, 'User created successfully');
		await logApiResponse(req, "User created successfully", 201, newUser);
		res.status(201).json({
			message: "User created successfully", data: newUser
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

		const existingUser = await User.findById(id);
		if (!existingUser) {
			return logApiResponse(req, "User not found", 404, { id: "User not found" }) &&
				res.status(404).json({ message: "User not found", errors: { id: "User  not found" } });
		}

		const [duplicateUserName, duplicateEmail] = await Promise.all([
			User.findOne({ username, _id: { $ne: id } }),
			User.findOne({ email, _id: { $ne: id } })
		]);

		if (duplicateUserName || duplicateEmail) {
			const errors = {};
			if (duplicateUserName) errors.username = "Username already exists";
			if (duplicateEmail) errors.email = "Email already exists";
			await createNotification(req, 'User', id, 'User updated successfully');
			return logApiResponse(req, "Validation Error", 400, errors) &&
				res.status(400).json({ message: "Validation Error", errors });
		}
		await User.findByIdAndUpdate(id, { name, username, email, mobile_no, role_id, department_id, avatar: avatarUrl, updated_at: Date.now() });
		const updatedUser = await User.findById(id);
		await createNotification(req, 'User', id, 'User updated successfully');
		await logApiResponse(req, "User updated successfully", 200, updatedUser);
		return res.status(200).json({ message: "User updated successfully", data: updatedUser });

	} catch (error) {
		await logApiResponse(req, "Failed to create role", 500, { error: error.message });
		res.status(500).json({ message: "Failed to create role", error: error.message });
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

		// Function to toggle soft delete for a single user
		const toggleSoftDelete = async (userId) => {
			const user = await User.findById(userId);
			if (!user) {
				throw new Error(`User with ID ${userId} not found`);
			}

			if (user.deleted_at) {
				// Restore the user
				user.deleted_at = null;
				user.status = true;
			} else {
				// Soft delete the user
				user.deleted_at = new Date();
				user.status = false;
			}

			user.updated_at = new Date();
			return await user.save();
		};

		// Check if multiple IDs are provided
		if (ids && Array.isArray(ids)) {
			// Toggle soft delete for multiple users
			const promises = ids.map(toggleSoftDelete);
			const updatedUsers = await Promise.all(promises);

			await logApiResponse(req, 'Users updated successfully', 200, updatedUsers);

			res.status(200).json({
				message: 'Users updated successfully',
				data: updatedUsers
			});
		} else if (id) {
			// Toggle soft delete for a single user
			const updatedUser = await toggleSoftDelete(id);
			const message = updatedUser.deleted_at ? 'User soft-deleted successfully' : 'User restored successfully'
			await createNotification(req, 'User', id, message);
			await logApiResponse(req, message, 200, updatedUser);
			res.status(200).json({ message, data: updatedUser });
		} else {
			await logApiResponse(req, 'No ID or IDs provided', 400, {});

			res.status(400).json({ message: 'No ID or IDs provided' });
		}
	} catch (error) {
		console.error('Server error', error);

		if (error.message && error.message.includes('not found')) {
			await logApiResponse(req, error.message, 404, {});
			res.status(404).json({ message: error.message });
		} else if (error.name === 'CastError' && error.kind === 'ObjectId') {
			await logApiResponse(req, 'Invalid user ID format', 400, { error: error.message });
			res.status(400).json({ message: 'Invalid user ID format', error: error.message });
		} else {
			await logApiResponse(req, 'Server error', 500, { error: error.message });
			res.status(500).json({ message: 'Server error', error: error.message });
		}
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

	const searchConditions = [];

	if (search) {
		const orConditions = [
			{ name: new RegExp(search, 'i') },
			{ email: new RegExp(search, 'i') }
		];

		if (!isNaN(search)) {
			orConditions.push({ mobile_no: search });
		}

		searchConditions.push({ $or: orConditions });
	}

	if (status !== undefined) {
		searchConditions.push({ status: status === 'active' });
	}

	const searchQuery = searchConditions.length > 0 ? { $and: searchConditions } : {};

	try {
		const users = await User.find(searchQuery)
			.sort(sort)
			.skip((page - 1) * limit)
			.limit(Number(limit))
			.select('-password -jwt_token'); // Exclude sensitive fields

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

		const user = await User.findOne({ _id: id }).lean({ virtuals: false });

		if (!user) {
			return logApiResponse(req, 'User not found', 404, false, null, res);
		}

		await User.deleteOne({ _id: id });
		await createNotification(req, 'User', id, 'User is permanently deleted');
		await logApiResponse(req, 'User is permanently deleted', 200, true, null, res);
		res.status(200).json({ message: 'user permanently deleted' });
	} catch (error) {
		return logApiResponse(req, error.message || 'Internal Server Error', 500, false, null, res);
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