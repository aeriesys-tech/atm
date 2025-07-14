const User = require('../models/user');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');
const Department = require('../models/department');
const mongoose = require('mongoose');

const { logApiResponse } = require('../utils/responseService');

const createUser = async (req, res) => {
	const { name, username, email, password, mobile_no, role_id, department_id } = req.body;
	const avatarUrl = req.file ? req.file.path : null;

	let validationErrors = {};

	// Validate required fields
	if (!name) {
		validationErrors.name = "Name is required";
	}
	if (!email) {
		validationErrors.email = "Email is required";
	}
	if (!password) {
		validationErrors.password = "Password is required";
	}
	if (!mobile_no) {
		validationErrors.mobile_no = "Mobile number is required";
	} else if (!/^\d{10}$/.test(mobile_no)) {
		validationErrors.mobile_no = "Mobile number must be exactly 10 digits";
	}
	if (!role_id || !mongoose.Types.ObjectId.isValid(role_id)) {
		validationErrors.role_id = "Role ID is required and must be valid";
	}
	if (!department_id || !mongoose.Types.ObjectId.isValid(department_id)) {
		validationErrors.department_id = "Department ID is required and must be valid";
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		// Check if a user with the same email already exists
		const existingUserByEmail = await User.findOne({ email });
		if (existingUserByEmail) {
			validationErrors.email = "User with this email already exists";
		}

		// Check if a user with the same mobile number already exists
		if (mobile_no) {
			const existingUserByMobile = await User.findOne({ mobile_no });
			if (existingUserByMobile) {
				validationErrors.mobile_no = "User with this mobile number already exists";
			}
		}

		// If there are validation errors after database checks, return them
		if (Object.keys(validationErrors).length > 0) {
			await logApiResponse(req, "Duplicate Key Error", 409, validationErrors);
			return res.status(409).json({
				message: "Duplicate Key Error",
				errors: validationErrors
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user document
		const newUser = new User({
			name,
			username,
			email,
			password: hashedPassword,
			mobile_no,
			role_id,
			department_id,
			avatar: avatarUrl
		});

		// Save the new user to the database
		await newUser.save();
		await logApiResponse(req, "User created successfully", 201, newUser);
		// Send a successful response back
		res.status(201).json({
			message: "User created successfully",
			data: newUser
		});
	} catch (error) {
		console.error("Failed to create user:", error);

		let errors = {};

		if (error.name === 'ValidationError') {
			Object.keys(error.errors).forEach(key => {
				errors[key] = error.errors[key].message;
			});
			await logApiResponse(req, "Validation Error", 400, errors);
			res.status(400).json({
				message: "Validation Error",
				errors
			});
		} else if (error.code === 11000) {
			if (error.keyPattern && error.keyPattern.email) {
				errors.email = "User with this email already exists";
			}
			if (error.keyPattern && error.keyPattern.mobile_no) {
				errors.mobile_no = "User with this mobile number already exists";
			}
			await logApiResponse(req, "Duplicate Key Error", 409, errors);
			res.status(409).json({
				message: "Duplicate Key Error",
				errors
			});
		} else {
			await logApiResponse(req, "Internal Server Error", 500, { message: "An unexpected error occurred" });
			res.status(500).json({
				message: "Internal Server Error",
				errors: {
					message: "An unexpected error occurred"
				}
			});
		}
	}
};
const updateUser = async (req, res) => {
	const { id, name, username, email, mobile_no, role_id, department_id } = req.body;
	const avatarUrl = req.file ? req.file.location : null;

	let validationErrors = {};

	// Validate required fields
	if (!name) {
		validationErrors.name = "Name is required";
	}
	if (!email) {
		validationErrors.email = "Email is required";
	}
	if (!mobile_no) {
		validationErrors.mobile_no = "Mobile number is required";
	} else if (!/^\d{10}$/.test(mobile_no)) {
		validationErrors.mobile_no = "Mobile number must be exactly 10 digits";
	}
	if (!role_id || !mongoose.Types.ObjectId.isValid(role_id)) {
		validationErrors.role_id = "Role ID is required and must be valid";
	}
	if (!department_id || !mongoose.Types.ObjectId.isValid(department_id)) {
		validationErrors.department_id = "Department ID is required and must be valid";
	}

	// If there are validation errors, return them
	if (Object.keys(validationErrors).length > 0) {
		await logApiResponse(req, "Validation Error", 400, validationErrors);
		return res.status(400).json({
			message: "Validation Error",
			errors: validationErrors
		});
	}

	try {
		// Check if a user with the same email already exists
		const existingUserByEmail = await User.findOne({ email, _id: { $ne: id } });
		if (existingUserByEmail) {
			validationErrors.email = "User with this email already exists";
		}

		// Check if a user with the same mobile number already exists
		if (mobile_no) {
			const existingUserByMobile = await User.findOne({ mobile_no, _id: { $ne: id } });
			if (existingUserByMobile) {
				validationErrors.mobile_no = "User with this mobile number already exists";
			}
		}

		// If there are validation errors after database checks, return them
		if (Object.keys(validationErrors).length > 0) {
			await logApiResponse(req, "Duplicate Key Error", 409, validationErrors);
			return res.status(409).json({
				message: "Duplicate Key Error",
				errors: validationErrors
			});
		}

		// Find the user by ID and update the user document
		const updatedUser = await User.findByIdAndUpdate(id, {
			name,
			username,
			email,
			mobile_no,
			role_id,
			department_id,
			avatar: avatarUrl,
			updated_at: Date.now()
		}, { new: true, runValidators: true });

		if (!updatedUser) {
			await logApiResponse(req, "Validation Error", 404, { id: "User not found" });
			return res.status(404).json({
				message: "Validation Error",
				errors: { id: "User not found" }
			});
		}

		// Log the successful response
		await logApiResponse(req, "User updated successfully", 200, updatedUser);

		// Send a successful response back with updated user data
		res.status(200).json({
			message: "User updated successfully",
			data: updatedUser
		});
	} catch (error) {
		console.error("Failed to update user:", error);

		let errors = {};

		if (error.name === 'ValidationError') {
			Object.keys(error.errors).forEach(key => {
				errors[key] = error.errors[key].message;
			});
			await logApiResponse(req, "Validation Error", 400, errors);
			res.status(400).json({
				message: "Validation Error",
				errors
			});
		} else if (error.code === 11000) {
			if (error.keyPattern && error.keyPattern.email) {
				errors.email = "User with this email already exists";
			}
			if (error.keyPattern && error.keyPattern.mobile_no) {
				errors.mobile_no = "User with this mobile number already exists";
			}
			await logApiResponse(req, "Duplicate Key Error", 409, errors);
			res.status(409).json({
				message: "Duplicate Key Error",
				errors
			});
		} else {
			await logApiResponse(req, "Internal Server Error", 500, { message: "An unexpected error occurred" });
			res.status(500).json({
				message: "Internal Server Error",
				errors: {
					message: "An unexpected error occurred"
				}
			});
		}
	}
};


const getAllUsers = async (req, res) => {
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

const getUserById = async (req, res) => {
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



const toggleSoftDeleteUser = async (req, res) => {
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

			await logApiResponse(req, updatedUser.deleted_at ? 'User soft-deleted successfully' : 'User restored successfully', 200, updatedUser);

			res.status(200).json({
				message: updatedUser.deleted_at ? 'User soft-deleted successfully' : 'User restored successfully',
				data: updatedUser
			});
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


const getPaginatedUsers = async (req, res) => {
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


module.exports = {
	createUser,
	updateUser,
	getAllUsers,
	getUserById,
	toggleSoftDeleteUser,
	getPaginatedUsers
}