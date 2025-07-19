// validators/commonValidators.js
const { body, query } = require("express-validator");
const mongoose = require("mongoose");

const validateId = (field = 'id', label = 'ID', model = null) =>
    body(field)
        .notEmpty().withMessage(`${label} is required`)
        .bail()
        .custom(async (value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error(`${label} must be a valid ObjectId`);
            }
            if (model) {
                const exists = await model.findById(value);
                if (!exists) {
                    throw new Error(`${label} does not exist`);
                }
            }
            return true;
        });


const paginateValidation = (sortableFields = []) => {
    return [
        query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
        query("limit").optional().isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
        query("sortBy").optional().isIn(sortableFields).withMessage("Invalid sort field"),
        query("order").optional().isIn(['asc', 'desc']).withMessage("Order must be 'asc' or 'desc'"),
        query("search").optional().isString().withMessage("Search must be a string"),
        query("status").optional().isIn(['active', 'inactive']).withMessage("Status must be 'active' or 'inactive'")
    ];
};

module.exports = {
    validateId,
    paginateValidation
};
