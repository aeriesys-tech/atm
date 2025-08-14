const { body } = require('express-validator')
const { Validate } = require('../middlewares/validationMiddleware')
const mongoose = require('mongoose');
const { validateId, paginateValidation } = require('./commonValidation');


const add_data_source_configuration_validation = (req, res, next) => {
    return Validate([
        body('data_source').trim().notEmpty().withMessage('Data source is required').bail().isString().withMessage('Data Source must be a string'),

        body('description').trim().notEmpty().withMessage('Description is required').bail().isString().withMessage('Description must be a string'),

        // MySql required fields
        body('username').if((value, { req }) => req.body.data_source?.toLowerCase() === 'postgres' || req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Username is required').bail().isString().withMessage('Username must be a string'),

        body('password').if((value, { req }) => req.body.data_source?.toLowerCase() === 'postgres' || req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Password is required').bail().isString().withMessage('Password must be a string'),

        body('host').if((value, { req }) => req.body.data_source?.toLowerCase() === 'postgres' || req.body.data_source?.toLowerCase() === 'mysql').trim().notEmpty().withMessage('Host is required').bail().isString().withMessage('Host must be a string'),

        // Postgres required fields
        body('port_no').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'postgres').trim().notEmpty().withMessage('Port number is required').bail().isString().withMessage('Port number must be a string'),

        body('database_name').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'postgres').trim().notEmpty().withMessage('Database name is required').bail().isString().withMessage('Database name must be a string'),

        body('table_name').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'postgres').trim().notEmpty().withMessage('Table name is required').bail().isString().withMessage('Table name must be a string'),

        // InFluxDb required fields
        body('token').if((value, { req }) => req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Token is required').bail().isString().withMessage('Token must be a string'),

        body('org').if((value, { req }) => req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Org is required').bail().isString().withMessage('Org must be a string'),

        body('bucket').if((value, { req }) => req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Bucket is required').bail().isString().withMessage('Bucket must be a string'),

        body('url').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mongodb').trim().notEmpty().withMessage('Url is required').bail().isString().withMessage('Url must be a string')
    ])(req, res, next);
};

const update_data_source_validation = (req, res, next) =>
    Validate([
        validateId('id', 'Data Source Configuration ID'),
        body('data_source').trim().notEmpty().withMessage('Data source is required').bail().isString().withMessage('Data Source must be a string'),

        body('description').trim().notEmpty().withMessage('Description is required').bail().isString().withMessage('Description must be a string'),

        // MySql required fields
        body('username').if((value, { req }) => req.body.data_source?.toLowerCase() === 'postgres' || req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Username is required').bail().isString().withMessage('Username must be a string'),

        body('password').if((value, { req }) => req.body.data_source?.toLowerCase() === 'postgres' || req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Password is required').bail().isString().withMessage('Password must be a string'),

        body('host').if((value, { req }) => req.body.data_source?.toLowerCase() === 'postgres' || req.body.data_source?.toLowerCase() === 'mysql').trim().notEmpty().withMessage('Host is required').bail().isString().withMessage('Host must be a string'),

        // Postgres required fields
        body('port_no').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'postgres').trim().notEmpty().withMessage('Port number is required').bail().isString().withMessage('Port number must be a string'),

        body('database_name').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'postgres').trim().notEmpty().withMessage('Database name is required').bail().isString().withMessage('Database name must be a string'),

        body('table_name').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mysql' || req.body.data_source?.toLowerCase() === 'postgres').trim().notEmpty().withMessage('Table name is required').bail().isString().withMessage('Table name must be a string'),

        // InFluxDb required fields
        body('token').if((value, { req }) => req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Token is required').bail().isString().withMessage('Token must be a string'),

        body('org').if((value, { req }) => req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Org is required').bail().isString().withMessage('Org must be a string'),

        body('bucket').if((value, { req }) => req.body.data_source?.toLowerCase() === 'influxdb').trim().notEmpty().withMessage('Bucket is required').bail().isString().withMessage('Bucket must be a string'),

        body('url').if((value, { req }) => req.body.data_source?.toLowerCase() === 'mongodb').trim().notEmpty().withMessage('Url is required').bail().isString().withMessage('Url must be a string')
    ])(req, res, next);


module.exports = { add_data_source_configuration_validation, update_data_source_validation }