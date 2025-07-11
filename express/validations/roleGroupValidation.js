const { body, param } = require('express-validator');
const { Validate } = require('../middlewares/validationMiddleware');

const createRoleGroupValidation = (req, res, next) => {
    return Validate([
        body('role_group_code', 'Role group code is required')
            .isString().trim().escape().exists().notEmpty(),
        body('role_group_name', 'Role group name is required')
            .isString().trim().escape().exists().notEmpty()
    ])(req, res, next);
};

const updateRoleGroupValidation = (req, res, next) => {
    return Validate([
        param('id', 'Invalid role group ID format').isMongoId(),
        body('role_group_code', 'Role group code is required')
            .optional().isString().trim().escape(),
        body('role_group_name', 'Role group name is required')
            .optional().isString().trim().escape()
    ])(req, res, next);
};

module.exports = {
    createRoleGroupValidation,
    updateRoleGroupValidation
};