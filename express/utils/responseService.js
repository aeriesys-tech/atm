const ApiLog = require("../models/apiLog");

const responseService = {
    success: async (req, res, message, data = {}, statusCode = 200) => {
        try {
            // Log the response to the ApiLogs collection before sending it
            await logApiResponse(req, message, statusCode, data);

            // Send the success response to the client
            res.status(statusCode).json({
                status: "success",
                message,
                data,
            });
        } catch (err) {
            console.error("Error logging success response:", err);
            res.status(statusCode).json({
                status: "success",
                message,
                data,
            });
        }
    },

    error: async (req, res, message, errors = {}, statusCode = 500) => {
        try {
            // Log the error response to the ApiLogs collection before sending it
            await logApiResponse(req, message, statusCode, errors);

            // Send the error response to the client
            res.status(statusCode).json({
                status: "error",
                message,
                errors,
            });
        } catch (err) {
            console.error("Error logging error response:", err);
            res.status(statusCode).json({
                status: "error",
                message,
                errors,
            });
        }
    },
};


// Helper function to log the API response
async function logApiResponse(req, message, status, responseData) {
    try {
        const { method, originalUrl, ip } = req;
        const user_id = req.user ? req.user._id : null; // Assuming req.user is set after authentication
        const apiRequest = JSON.stringify(req.body || {});

        await ApiLog.create({
            user_id,
            api_name: `${method} ${originalUrl}`,
            api_request: apiRequest,
            status,
            ip_address: ip,
            message,
            response: JSON.stringify(responseData),
            timestamp: new Date(),
        });
    } catch (err) {
        console.error("Failed to log API response:", err);
        // Optionally, handle logging failure (e.g., log to a file or external service)
    }
}

module.exports = {
    responseService,
    logApiResponse,
};
