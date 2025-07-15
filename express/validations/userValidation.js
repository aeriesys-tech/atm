const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const { Validate } = require('../middlewares/validationMiddleware');

const createUserValidation = (req, res, next) => {
	return Validate([
		body('name', 'Name is required').isString().trim().escape().notEmpty(),
		body('email', 'Email is required').isEmail().normalizeEmail(),
		body("password", "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character")
			.isLength({ min: 8 })
			.matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
			.matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
			.matches(/[0-9]/).withMessage("Password must contain at least one numeric digit")
			.matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage("Password must contain at least one special character"),
		// body('mobile_no', 'Mobile number is required and must be exactly 10 digits')
		//     .isMobilePhone('en-IN'),
		body('role_id', 'Role ID is required and must be valid')
			.custom(role_id => mongoose.Types.ObjectId.isValid(role_id)),
		body('department_id', 'Department ID is required and must be valid')
			.custom(department_id => mongoose.Types.ObjectId.isValid(department_id))
	])(req, res, next);
};

const updateUserValidation = (req, res, next) => {
	return Validate([
		param('id', 'Invalid user ID format').isMongoId(),
		body('name', 'Name is required').optional().isString().trim().escape(),
		body('email', 'Email is required').optional().isEmail().normalizeEmail(),
		body('mobile_no', 'Mobile number is required and must be exactly 10 digits')
			.optional().isMobilePhone('en-IN'),
		body('role_id', 'Role ID is required and must be valid')
			.optional().custom(role_id => mongoose.Types.ObjectId.isValid(role_id)),
		body('department_id', 'Department ID is required and must be valid')
			.optional().custom(department_id => mongoose.Types.ObjectId.isValid(department_id))
	])(req, res, next);
};

const destroyUser = (req, res, next) => {
	return Validate([
		param("id").optional().isMongoId().withMessage("Invalid department ID format"),
	])(req, res, next);
};

module.exports = {
	createUserValidation,
	updateUserValidation,
	destroyUser
};
