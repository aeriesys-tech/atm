const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId } = require('./commonValidation');


const add_department_validation = (req, res, next) => {
    return Validate([
        body('department_name').trim().notEmpty().withMessage('Department name is required').bail().isString().withMessage('Department name must be a string'),
        body('department_code').trim().notEmpty().withMessage('Department code is required').bail().isString().withMessage('Department code must be a string')
    ])(req, res, next);
};
const update_department_validation = (req, res, next) =>
    Validate([
        validateId('id', 'Department ID'),
        body('department_name').trim().notEmpty().withMessage('Department name is required').isString().withMessage('Department Must be a string'),
        body('department_code').trim().notEmpty().withMessage('Department code is required').isString().withMessage('Department  Must be a string')
    ])(req, res, next);

module.exports = { add_department_validation, update_department_validation }
