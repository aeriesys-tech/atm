const { body, param } = require('express-validator');
const mongoose = require('mongoose');
const { Validate } = require('../middlewares/validationMiddleware');
const parameterType = require('../models/parameterType');
const asset = require('../models/asset');
const template = require('../models/template');
const master = require('../models/master');
const { validateId } = require('./commonValidation');

const add_specification_validation = (req, res, next) => {
    return Validate([
        validateId('asset_id', 'Asset ID ', asset),
        validateId('template_id', 'Template ID ', template),
        body('field_name', 'Field name is required')
            .isString().trim().escape().notEmpty(),
        body('field_type', 'Field type is required')
            .isString().trim().escape().notEmpty(),
        body('field_value', 'Field value is required')
            .isString().trim().escape().notEmpty(),
        body('display_name', 'Display name is required')
            .isString().trim().escape().notEmpty(),
        body('required', 'Field required status must be a boolean')
            .isBoolean().withMessage("Required must be a boolean"),
        body('is_unique', 'Field unique is required')
            .isBoolean().withMessage("unique must be a boolean")
    ])(req, res, next);
};

const update_specification_validation = (req, res, next) => {
    return Validate([
        validateId('id', 'Specification ID'),
        validateId('specification.asset_id', 'Asset ID ', asset),
        validateId('specification.template_id', 'Template ID ', template),
        validateId('specification.master_id', 'Master ID ', master),
        body('specification.*.field_name', 'Field name is required')
            .isString().trim().escape().notEmpty(),
        body('specification.*.field_type', 'Field type is required')
            .isString().trim().escape().notEmpty(),
        body('specification.*.field_value', 'Field value is required')
            .isString().trim().escape().notEmpty(),
        body('specification.*.display_name', 'Display name is required')
            .isString().trim().escape().notEmpty(),
        body('specification.*.required', 'Field required status must be a boolean')
            .isBoolean().withMessage("Required must be a boolean"),
        body('specification.*.is_unique', 'Field unique is required')
            .isBoolean().withMessage("unique must be a boolean")
    ])(req, res, next);
};

module.exports = {
    add_specification_validation,
    update_specification_validation
};
