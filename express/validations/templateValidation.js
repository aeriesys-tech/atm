const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId, paginateValidation } = require('./commonValidation');
const TemplateType = require('../models/templateType')


const add_template_validation = (req, res, next) => {
    return Validate([
        validateId('template_type_id', 'Template Type ID', TemplateType),
        body('template_name').trim().notEmpty().withMessage('Template name is required').bail().isString().withMessage('Template name must be a string'),
        body('template_code').trim().notEmpty().withMessage('Template code is required').bail().isString().withMessage('Template code must be a string'),
        body('structure').notEmpty().withMessage('Structure is required').bail()
            .custom((value) => {
                let parsed;
                if (typeof value === 'string') {
                    try {
                        parsed = JSON.parse(value);
                    } catch (e) {
                        throw new Error('Structure must be valid JSON');
                    }
                } else if (typeof value !== 'object') {
                    throw new Error('Structure must be a valid object or JSON string');
                }

                return true;
            })
    ])(req, res, next);
};

const update_template_validation = (req, res, next) =>
    Validate([
        validateId('template_type_id', 'Template Type ID', TemplateType),
        validateId('id', 'Template Type ID'),
        body('template_name').trim().notEmpty().withMessage('Template name is required').isString().withMessage('Must be a string'),
        body('template_code').trim().notEmpty().withMessage('Template code is required').isString().withMessage('Must be a string'),
        body('structure').notEmpty().withMessage('Structure is required').bail()
            .custom((value) => {
                let parsed;
                if (typeof value === 'string') {
                    try {
                        parsed = JSON.parse(value);
                    } catch (e) {
                        throw new Error('Structure must be valid JSON');
                    }
                } else if (typeof value !== 'object') {
                    throw new Error('Structure must be a valid object or JSON string');
                }

                return true;
            })
    ])(req, res, next);

module.exports = { add_template_validation, update_template_validation }