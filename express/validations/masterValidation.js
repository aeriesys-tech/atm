const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const { Validate } = require('../middlewares/validationMiddleware');

const createMasterValidation = (req, res, next) => {
    return Validate([
        // Validate fields directly under the masterData object
        body('masterData.master_name', 'Master name is required')
            .trim().escape().exists().notEmpty(),
        body('masterData.parameter_type_id', 'Parameter type ID is required and must be valid')
            .custom(value => mongoose.Types.ObjectId.isValid(value)),
        body('masterData.display_name_singular', 'Display name singular is required')
            .trim().escape().exists().notEmpty(),
        body('masterData.display_name_plural', 'Display name plural is required')
            .trim().escape().exists().notEmpty(),
        body('masterData.model_name', 'Model name is required')
            .trim().escape().exists().notEmpty(),
        body('masterData.order', 'Order is required and must be a number')
            .isNumeric(),

        // Validate fields in the masterFieldData array
        body('masterFieldData.*.field_name', 'Field name is required')
            .trim().escape().exists().notEmpty(),
        body('masterFieldData.*.field_type', 'Field type is required')
            .trim().escape().exists().notEmpty(),
        body('masterFieldData.*.display_name', 'Display name is required')
            .trim().escape().exists().notEmpty(),
        body('masterFieldData.*.tooltip', 'Tooltip is required')
            .trim().escape().exists().notEmpty(),
        body('masterFieldData.*.order', 'Order is required and must be a number')
            .isNumeric(),
        body('masterFieldData.*.required', 'Field required status must be a boolean')
            .isBoolean(),
        body('masterFieldData.*.default', 'Field default value must be a boolean')
            .isBoolean().exists(),
    ])(req, res, next);
};

const updateMasterValidation = (req, res, next) => {
    return Validate([
        // body('id', 'Invalid master ID').custom(value => mongoose.Types.ObjectId.isValid(value)),
        body('id', 'Master ID must be valid')
            .optional().custom(value => mongoose.Types.ObjectId.isValid(value)),
        body('masterData.master_name', 'Master name is required')
            .optional().trim().escape().notEmpty(),
        body('masterData.parameter_type_id', 'Parameter type ID must be valid')
            .optional().custom(value => mongoose.Types.ObjectId.isValid(value)),
        body('masterData.display_name_singular', 'Display name singular is required')
            .optional().trim().escape().notEmpty(),
        body('masterData.display_name_plural', 'Display name plural is required')
            .optional().trim().escape().notEmpty(),
        body('masterData.model_name', 'Model name is required')
            .optional().trim().escape().notEmpty(),
        body('masterData.order', 'Order must be a number')
            .optional().isNumeric(),

        // Validate fields in the masterFieldData array
        body('masterFieldData.*.field_name', 'Field name is required for all fields')
            .optional().trim().escape().notEmpty(),
        body('masterFieldData.*.field_type', 'Field type is required for all fields')
            .optional().trim().escape().notEmpty(),
        body('masterFieldData.*.display_name', 'Display name is required for all fields')
            .optional().trim().escape().notEmpty(),
        body('masterFieldData.*.tooltip', 'Tooltip is required')
            .trim().escape().exists().notEmpty(),
        body('masterFieldData.*.order', 'Order is required for all fields and must be a number')
            .optional().isNumeric(),
        body('masterFieldData.*.required', 'Field required status must be a boolean')
            .optional().isBoolean(),
        body('masterFieldData.*.default', 'Field default value is required and must be a boolean')
            .optional().isBoolean().exists(),
    ])(req, res, next);
};

module.exports = {
    createMasterValidation,
    updateMasterValidation
};
