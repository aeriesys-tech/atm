const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId } = require('./commonValidation');


const add_department_validation = (req, res, next) => {
    return Validate([
        body('department_name').trim().notEmpty().withMessage('Department Name is required').bail().isString().withMessage('Department Name must be a string'),
        body('department_code').trim().notEmpty().withMessage('Department Code is required').bail().isString().withMessage('Department Code must be a string')
    ])(req, res, next);
};
const update_department_validation = (req, res, next) =>
    Validate([
        validateId('id', 'Department ID'),
        body('department_name').trim().notEmpty().withMessage('Department Name is required').isString().withMessage('Department Name Must be a string'),
        body('department_code').trim().notEmpty().withMessage('Department Code is required').isString().withMessage('Department Code Must be a string')
    ])(req, res, next);

module.exports = { add_department_validation, update_department_validation }
