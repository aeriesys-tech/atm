const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const { Validate } = require('../middlewares/validationMiddleware');
const parameterType = require('../models/parameterType');
const { validateId } = require('./commonValidation');

const add_master_validation = (req, res, next) => {
    return Validate([
        validateId('masterData.parameter_type_id', 'Parameter Type ID', parameterType),

        body("masterData.master_name", "Master name is required")
            .isString().trim().escape().notEmpty(),

        body("masterData.display_name_singular", "Display name singular is required")
            .isString().trim().escape().notEmpty(),

        body("masterData.display_name_plural", "Display name plural is required")
            .isString().trim().escape().notEmpty(),

        body("masterData.model_name", "Model name is required")
            .isString().trim().escape().notEmpty(),

        body("masterData.order", "Order is required and must be a number")
            .isNumeric().withMessage("Order must be a number"),

        body('masterFieldData.*.field_name', 'Field name is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.field_type', 'Field type is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.display_name', 'Display name is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.tooltip', 'Tooltip is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.order', 'Order is required and must be a number')
            .isNumeric().withMessage("Order must be a number"),

        body('masterFieldData.*.required', 'Field required status must be a boolean')
            .isBoolean().withMessage("Required must be a boolean"),

        body('masterFieldData.*.default', 'Field default value must be a boolean')
            .isBoolean().withMessage("Default must be a boolean"),

        body('masterFieldData.*.is_unique', 'Field unique is required')
            .isBoolean().withMessage("unique must be a boolean"),
    ])(req, res, next);
};

const update_master_validation = (req, res, next) => {
    return Validate([
        validateId('id', 'Master ID'),
        validateId('masterData.parameter_type_id', 'Parameter Type ID', parameterType),
        body("masterData.master_name", "Master name is required")
            .isString().trim().escape().notEmpty(),
        body("masterData.display_name_singular", "Display name singular is required")
            .isString().trim().escape().notEmpty(),
        body("masterData.display_name_plural", "Display name plural is required")
            .isString().trim().escape().notEmpty(),
        body("masterData.model_name", "Model name is required")
            .isString().trim().escape().notEmpty(),
        body("masterData.order", "Order is required and must be a number")
            .isNumeric().withMessage("Order must be a number"),
        body('masterFieldData.*.field_name', 'Field name is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.field_type', 'Field type is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.display_name', 'Display name is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.tooltip', 'Tooltip is required')
            .isString().trim().escape().notEmpty(),

        body('masterFieldData.*.order', 'Order is required and must be a number')
            .isNumeric().withMessage("Order must be a number"),

        body('masterFieldData.*.required', 'Field required status must be a boolean')
            .isBoolean().withMessage("Required must be a boolean"),

        body('masterFieldData.*.default', 'Field default value must be a boolean')
            .isBoolean().withMessage("Default must be a boolean"),

        body('masterFieldData.*.is_unique', 'Field unique value must be a boolean')
            .isBoolean().withMessage("Unique must be a boolean"),
    ])(req, res, next);
};

module.exports = {
    add_master_validation,
    update_master_validation
};
