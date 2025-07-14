const { body, param, query } = require('express-validator');
const { Validate } = require('../middlewares/validationMiddleware');

const createDepartment = (req, res, next) => {
    return Validate([
        body("department_code", "department code field is required").isString().escape().trim().exists().notEmpty(),
        body("department_name", "department name field is required").isString().escape().trim().exists().notEmpty(),
    ])(req, res, next);
};

const updateDepartment = (req, res, next) => {
    return Validate([
        body("id", "department id field is required").isString().escape().trim().exists().notEmpty(),
        body("department_code", "department code field is required").isString().escape().trim().exists().notEmpty(),
        body("department_name", "department name field is required").isString().escape().trim().exists().notEmpty(),
    ])(req, res, next);
};

const getDepartment = (req, res, next) => {
    return Validate([
        param("id", "Invalid department ID format").isMongoId(),
    ])(req, res, next);
};

const deleteDepartment = (req, res, next) => {
    return Validate([
        param("id").optional().isMongoId().withMessage("Invalid department ID format"),
        body("ids").optional().isArray().withMessage("IDs must be an array")
            .custom(ids => ids.every(id => mongoose.Types.ObjectId.isValid(id)))
            .withMessage("Every ID in the array must be a valid MongoDB ID"),
    ])(req, res, next);
};

const paginatedDepartments = (req, res, next) => {
    return Validate([
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
        query("sortBy").optional().isIn(['department_name', 'department_code', 'created_at', 'updated_at']).withMessage("Invalid sort field"),
        query("order").optional().isIn(['asc', 'desc']).withMessage("Order must be 'asc' or 'desc'"),
        query("search").optional().isString().withMessage("Search must be a string"),
        query("status").optional().isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'"),
    ])(req, res, next);
};

module.exports = {
    createDepartment,
    updateDepartment,
    getDepartment,
    deleteDepartment,
    paginatedDepartments
};