const { check, body } = require('express-validator');
const { Validate } = require('../middlewares/validationMiddleware');
const mongoose = require("mongoose");


const createBatchValidation = (req, res, next) => {
    return Validate([
        check("no_of_tags")
            .notEmpty().withMessage("Number of tags is required")
            .bail()
            .isNumeric().withMessage("Number of tags must be a number")
            .bail()
            .custom(value => value >= 0).withMessage("Number of tags must be a positive number"),

        check("no_of_attributes")
            .notEmpty().withMessage("Number of attributes is required")
            .bail()
            .isNumeric().withMessage("Number of attributes must be a number")
            .bail()
            .custom(value => value >= 0).withMessage("Number of attributes must be a positive number"),

        check("batch_type")
            .notEmpty().withMessage("Batch type is required")
            .bail()
            .isIn(["atm", "direct"]).withMessage("Batch type must be either 'atm' or 'direct'"),

        body().custom((value, { req }) => {
            if (req.body.batch_type === 'atm') {
                if (!req.body.data) {
                    throw new Error("Data is required for 'atm' upload type");
                }
                if (!req.body.master) {
                    throw new Error("Master is required for 'atm' upload type");
                }
            }

            if (req.body.batch_type === 'direct' && !req.file) {
                throw new Error("File is required for 'direct' upload type");
            }

            return true;
        })
    ])(req, res, next);
};


const updateBatchValidation = (req, res, next) => {
    return Validate([
        check("batch_id")
            .notEmpty().withMessage("Batch ID is required")
            .bail()
            .custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid Batch ID"),

        check("no_of_tags")
            .optional()
            .isNumeric().withMessage("Number of tags must be a number")
            .bail()
            .custom(value => value >= 0).withMessage("Number of tags must be a positive number"),

        check("no_of_attributes")
            .optional()
            .isNumeric().withMessage("Number of attributes must be a number")
            .bail()
            .custom(value => value >= 0).withMessage("Number of attributes must be a positive number"),

        check("batch_type")
            .optional()
            .isIn(["atm", "direct"]).withMessage("Upload type must be either 'atm' or 'direct'")
    ])(req, res, next);
};

const uploadExcelValidation = (req, res, next) => {
    return Validate([
        body().custom((_, { req }) => {
            if (!req.file) {
                throw new Error("Excel file is required");
            }
            return true;
        })
    ])(req, res, next);
};


module.exports = {
    createBatchValidation,
    updateBatchValidation,
    uploadExcelValidation
};
