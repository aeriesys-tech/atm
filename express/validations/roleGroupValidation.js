const { body, param, query } = require('express-validator');
const { Validate } = require('../middlewares/validationMiddleware');

const createRoleGroup = (req, res, next) => {
    return Validate([
        body("role_group_code", "Role group code field is required").isString().escape().trim().notEmpty(),
        body("role_group_name", "Role group name field is required").isString().escape().trim().notEmpty(),
    ])(req, res, next);
};

const updateRoleGroup = (req, res, next) => {
    return Validate([
        body("id", "Role group id is required").isString().escape().trim().exists().notEmpty(),
        body("role_group_code", "Role group code field is required").isString().escape().trim().exists().notEmpty(),
        body("role_group_name", "Role group name field is required").isString().escape().trim().exists().notEmpty(),
    ])(req, res, next);
};

const getRoleGroup = (req, res, next) => {
    return Validate([
        param("id", "Invalid role ID format").isMongoId(),
    ])(req, res, next);
};

const deleteRoleGroup = (req, res, next) => {
    return Validate([
        param("id").optional().isMongoId().withMessage("Invalid role ID format"),
        body("ids").optional().isArray().withMessage("IDs must be an array")
            .custom(ids => ids.every(id => mongoose.Types.ObjectId.isValid(id)))
            .withMessage("Every ID in the array must be a valid MongoDB ID"),
    ])(req, res, next);
};

const paginatedRoleGroups = (req, res, next) => {
    return Validate([
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
        query("sortBy").optional().isIn(['role_group_name', 'role_group_code', 'created_at', 'updated_at']).withMessage("Invalid sort field"),
        query("order").optional().isIn(['asc', 'desc']).withMessage("Order must be 'asc' or 'desc'"),
        query("search").optional().isString().withMessage("Search must be a string"),
        query("status").optional().isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'"),
    ])(req, res, next);
};

module.exports = {
    createRoleGroup,
    updateRoleGroup,
    getRoleGroup,
    deleteRoleGroup,
    paginatedRoleGroups
};