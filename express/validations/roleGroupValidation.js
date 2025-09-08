const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId, paginateValidation } = require('./commonValidation');


const add_role_group_validation = (req, res, next) => {
    return Validate([
        body('role_group_name').trim().notEmpty().withMessage('Role Group Name is required').bail().isString().withMessage('Role Group Name must be a string'),
        body('role_group_code').trim().notEmpty().withMessage('Role Group Code is required').bail().isString().withMessage('Role Group Code must be a string')
    ])(req, res, next);
};
const update_role_group_validation = (req, res, next) =>
    Validate([
        validateId('id', 'Role group ID'),
        body('role_group_name').trim().notEmpty().withMessage('Role Group Name is required').isString().withMessage('Role group Must be a string'),
        body('role_group_code').trim().notEmpty().withMessage('Role Group Code is required').isString().withMessage('Role group  Must be a string')
    ])(req, res, next);

module.exports = { add_role_group_validation, update_role_group_validation }
