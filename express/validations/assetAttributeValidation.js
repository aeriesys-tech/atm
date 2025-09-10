const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId, paginateValidation } = require('./commonValidation');
const AssetAttribute = require('../models/assetAttribute')


const add_asset_attribute_validation = (req, res, next) => {
    return Validate([
        body('field_name').trim().notEmpty().withMessage('Field name is required').bail().isString().withMessage('Field name must be a string'),
        body('field_type').trim().notEmpty().withMessage('Field type is required').bail().isString().withMessage('Field Type must be a string'),
        body('field_value').trim().bail().isString().withMessage('Field Value must be a string'),
        body('display_name').trim().notEmpty().withMessage('Display name is required').bail().isString().withMessage('Display name must be a string'),
        body('required').trim().notEmpty().withMessage('required field is required').bail().isString().withMessage('Required field must be a string'),
    ])(req, res, next);
};
const update_asset_attribute_validation = (req, res, next) =>
    Validate([
        validateId('id', 'Asset Attribute ', AssetAttribute),
        body('field_name').trim().notEmpty().withMessage('Field name is required').bail().isString().withMessage('Field name must be a string'),
        body('field_type').trim().notEmpty().withMessage('Field type is required').bail().isString().withMessage('Field Type must be a string'),
        body('field_value').trim().bail().isString().withMessage('Field Value must be a string'),
        body('display_name').trim().notEmpty().withMessage('Display name is required').bail().isString().withMessage('Display name must be a string'),
        body('required').trim().notEmpty().withMessage('required field is required').bail().isString().withMessage('Required field must be a string'),
    ])(req, res, next);

module.exports = { add_asset_attribute_validation, update_asset_attribute_validation }
