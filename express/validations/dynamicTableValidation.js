const { body } = require('express-validator');
const { Validate } = require('../middlewares/validationMiddleware');

const MasterField = require('../models/masterField');

const dynamicTableValidation = async (req, res, next) => {
    try {
        const masterFields = await MasterField.find({ master_id: req.params.masterId });
        const validations = masterFields
            .filter(masterField => masterField.required)
            .map(masterField => body(masterField.field_name)
                .isString()
                .escape()
                .trim()
                .exists({ checkFalsy: true }) // Ensures the field is not empty
                .withMessage(`${masterField.display_name} is required`)); // Fixed template literal syntax

        await Promise.all(validations.map(validation => validation.run(req)));
        Validate(validations)(req, res, next);
    } catch (err) {
        console.error('Error during dynamic table validation:', err);
        // Check if the error is a duplicate key error
        if (err.code === 11000) {
            // Extract field name from the error message
            const field = err.message.match(/index: \w+_1 dup key: { (\w+):/)[1];
            res.status(409).json({
                error: 'Validation error',
                message: `An item with the same ${field} already exists. Please use a unique value.`
            });
        } else {
            res.status(500).json({ error: 'An error occurred during validation.', details: err.toString() });
        }
    }
};

// const dynamicTableUpdateValidation = async (req, res, next) => {
//     try {
//         const masterFields = await MasterField.find({ master_id: req.params.masterId });
//         const validations = masterFields
//             .map(masterField => {
//                 let validator = body(masterField.field_name)
//                     .optional()
//                     .isString().withMessage(`${masterField.field_name} must be a string`)
//                     .trim().escape();
//                 if (masterField.required && req.body.hasOwnProperty(masterField.field_name)) {
//                     validator = validator.exists().notEmpty()
//                         .withMessage(`${masterField.display_name} field is required`);
//                 }
//                 return validator;
//             });

//         await Promise.all(validations.map(validation => validation.run(req)));
//         Validate(validations)(req, res, next);
//     } catch (err) {
//         console.error('Error during update validation:', err);
//         res.status(500).json({ message: 'An error occurred during validation.', errors: err.toString() });
//     }
// };
const dynamicTableUpdateValidation = async (req, res, next) => {
    try {
        const masterFields = await MasterField.find({ master_id: req.params.masterId });
        const validations = masterFields.map(masterField => {
            let validator = body(masterField.field_name).optional().trim().escape();

            // Determine the type of validation based on the masterField type
            if (masterField.type === 'string') {
                validator = validator.isString().withMessage(`${masterField.field_name} must be a string`);
            } else if (masterField.type === 'number') {
                validator = validator.isNumeric().withMessage(`${masterField.field_name} must be a number`);
            }

            // Check if the field is required and exists in the request body
            if (masterField.required && req.body.hasOwnProperty(masterField.field_name)) {
                validator = validator.exists().notEmpty()
                    .withMessage(`${masterField.display_name} field is required`);
            }

            return validator;
        });

        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));
        Validate(validations)(req, res, next);
    } catch (err) {
        console.error('Error during update validation:', err);
        res.status(500).json({ message: 'An error occurred during validation.', errors: err.toString() });
    }
};


module.exports = {
    dynamicTableValidation,
    dynamicTableUpdateValidation
};
