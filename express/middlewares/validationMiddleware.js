const { validationResult } = require('express-validator');
const { logApiResponse } = require('../utils/responseService'); // Adjust the path as needed

const Validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.path] = error.msg;
            return acc;
        }, {});

        const errorMessage = "The given data was invalid";

        // Log the response to the ApiLogs collection before sending it
        await logApiResponse(req, errorMessage, 400, formattedErrors);

        // Send the validation error response to the client
        res.status(400).json({
            errors: formattedErrors,
            message: errorMessage
        });
    };
};

module.exports = {
    Validate
};