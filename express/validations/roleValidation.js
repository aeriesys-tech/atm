const { body, param, query } = require('express-validator');
const { Validate } = require('../middlewares/validationMiddleware');

const createRole = (req, res, next) => {
    return Validate([
        body("role_group_id", "Role group field is required").isString().escape().trim().exists().notEmpty(),
        body("role_code", "Role code field is required").isString().escape().trim().exists().notEmpty(),
        body("role_name", "Role name field is required").isString().escape().trim().exists().notEmpty(),
    ])(req, res, next);
};

const updateRole = (req, res, next) => {
    return Validate([
        body("role_group_id", "Role group field is required").isString().escape().trim().exists().notEmpty(),
        body("role_code", "Role code field is required").isString().escape().trim().exists().notEmpty(),
        body("role_name", "Role name field is required").isString().escape().trim().exists().notEmpty(),
    ])(req, res, next);
};

const getRole = (req, res, next) => {
    return Validate([
        param("id", "Invalid role ID format").isMongoId(),
    ])(req, res, next);
};

const deleteRole = (req, res, next) => {
    return Validate([
        param("id").optional().isMongoId().withMessage("Invalid role ID format"),
        body("ids").optional().isArray().withMessage("IDs must be an array")
            .custom(ids => ids.every(id => mongoose.Types.ObjectId.isValid(id)))
            .withMessage("Every ID in the array must be a valid MongoDB ID"),
    ])(req, res, next);
};

const paginatedRoles = (req, res, next) => {
    return Validate([
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
        query("sortBy").optional().isIn(['role_name', 'role_code', 'created_at', 'updated_at']).withMessage("Invalid sort field"),
        query("order").optional().isIn(['asc', 'desc']).withMessage("Order must be 'asc' or 'desc'"),
        query("search").optional().isString().withMessage("Search must be a string"),
        query("status").optional().isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'"),
    ])(req, res, next);
};

module.exports = {
    createRole,
    updateRole,
    getRole,
    deleteRole,
    paginatedRoles
};