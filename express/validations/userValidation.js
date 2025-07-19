const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const { Validate } = require('../middlewares/validationMiddleware');
const Role = require('../models/Role');
const { validateId } = require('./commonValidation');
const department = require('../models/department');

const add_user_validation = (req, res, next) => {
	return Validate([
		validateId('role_id', 'Role ID', Role),
		validateId('department_id', 'Department ID', department),
		body("name", "Name is required").isString().trim().escape().notEmpty(),
		body("username", "Username is required").isString().trim().escape().notEmpty(),
		body("email", "Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
		body("mobile_no", "Mobile number is required").isString().trim().escape().notEmpty(),
		body("password").isString().trim().escape().notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
	])(req, res, next);
};

const update_user_validation = (req, res, next) => {
	return Validate([
		validateId('id', 'User ID'),
		validateId('role_id', 'Role ID', Role),
		validateId('department_id', 'Department ID', department),
		body("name", "Name is required").isString().trim().escape().notEmpty(),
		body("username", "Username is required").isString().trim().escape().notEmpty(),
		body("email", "Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(),
		body("mobile_no", "Mobile number is required").isString().trim().escape().notEmpty()
	])(req, res, next);
};

module.exports = {
	add_user_validation,
	update_user_validation,
};
