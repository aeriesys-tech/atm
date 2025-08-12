const { check, body } = require('express-validator');
const mongoose = require('mongoose');
const { Validate } = require('../middlewares/validationMiddleware');
const Variable = require('../models/variable');
const Batch = require("../models/batch");


const editVariablesValidation = (req, res, next) => {
    return Validate([
        body("variable_ids")
            .isArray({ min: 1 }).withMessage("An array of Variable IDs is required"),

        body("variable_ids.*")
            .custom(id => mongoose.Types.ObjectId.isValid(id))
            .withMessage("All Variable IDs must be valid Mongo ObjectIds"),

        body("variable_ids")
            .custom(async (ids) => {
                const existing = await Variable.find({ _id: { $in: ids } }).distinct('_id');
                const existingStrIds = existing.map(id => String(id));
                const missing = ids.filter(id => !existingStrIds.includes(id));

                if (missing.length > 0) {
                    throw new Error(`Variable ID(s) not found: ${missing.join(', ')}`);
                }
                return true;
            })
    ])(req, res, next);
};


const paginateBatchVariablesValidation = (req, res, next) => {
    return Validate([
        body("batch_id")
            .notEmpty().withMessage("Batch ID is required")
            .bail()
            .custom(id => mongoose.Types.ObjectId.isValid(id)).withMessage("Invalid Batch ID")
            .bail()
            .custom(async (id) => {
                const exists = await Batch.exists({ _id: id });
                if (!exists) {
                    throw new Error("Batch ID not found in DB");
                }
                return true;
            }),

        body("page")
            .optional()
            .isInt({ min: 1 }).withMessage("Page must be a positive integer"),

        body("limit")
            .optional()
            .isInt({ min: 1 }).withMessage("Limit must be a positive integer"),
    ])(req, res, next);
};


module.exports = {
    editVariablesValidation,
    paginateBatchVariablesValidation
};