const { body, param } = require('express-validator');
const { Validate } = require('../middlewares/validationMiddleware');

const createDepartmentValidation = (req, res, next) => {
    return Validate([
        body('department_code', 'Department code is required')
            .isString().trim().escape().exists().notEmpty(),
        body('department_name', 'Department name is required')
            .isString().trim().escape().exists().notEmpty()
    ])(req, res, next);
};

const updateDepartmentValidation = (req, res, next) => {
    return Validate([
        param('id', 'Invalid department ID format').isMongoId(),
        body('department_code', 'Department code is required')
            .optional().isString().trim().escape(),
        body('department_name', 'Department name is required')
            .optional().isString().trim().escape()
    ])(req, res, next);
};

module.exports = {
    createDepartmentValidation,
    updateDepartmentValidation
};
