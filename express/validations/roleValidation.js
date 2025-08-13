const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId, paginateValidation } = require('./commonValidation');
const RoleGroup = require('../models/roleGroup')


const add_role_validation = (req, res, next) => {
    return Validate([
        validateId('role_group_id', 'Role group ID', RoleGroup),
        body('role_name').trim().notEmpty().withMessage('Role name is required').bail().isString().withMessage('Role name must be a string'),
        body('role_code').trim().notEmpty().withMessage('Role code is required').bail().isString().withMessage('Role code must be a string')
    ])(req, res, next);
};
const update_role_validation = (req, res, next) =>
    Validate([
        validateId('role_group_id', 'Role group ID', RoleGroup),
        validateId('id', 'Role ID'),
        body('role_name').trim().notEmpty().withMessage('Role name is required').isString().withMessage('Must be a string'),
        body('role_code').trim().notEmpty().withMessage('Role code is required').isString().withMessage('Must be a string')
    ])(req, res, next);

module.exports = { add_role_validation, update_role_validation }
