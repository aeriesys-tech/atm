const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId } = require('./commonValidation');
const Template = require('../models/template')


const add_template_master_validation = (req, res, next) => {
    return Validate([
        validateId('id', 'Template ID', Template),
    ])(req, res, next);
};


module.exports = { add_template_master_validation }