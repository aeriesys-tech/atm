const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { logApiResponse } = require('../utils/responseService');

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        await logApiResponse(req, 'No token provided', 401, {});
        return res.status(401).json({ message: 'No token provided' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        await logApiResponse(req, 'Token error: Format should be "Bearer <token>"', 401, {});
        return res.status(401).json({ message: 'Token error: Format should be "Bearer <token>"' });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user by ID and check if the stored token matches the provided one
        const user = await User.findById(decoded.id);

        if (!user) {
            await logApiResponse(req, 'User not found', 404, {});
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming you're storing the jwtToken in the User model as discussed earlier
        if (user.jwt_token !== token) {
            await logApiResponse(req, 'Token mismatch: The token provided does not match the active session.', 401, {});
            return res.status(401).json({ message: 'Token mismatch: The token provided does not match the active session.' });
        }

        req.user = user;
        await logApiResponse(req, 'User authenticated successfully', 200, { userId: user._id });
        next(); // User is authenticated
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            await logApiResponse(req, 'Unauthorized access: Token has expired', 401, {});
            return res.status(401).json({ message: 'Unauthorized access: Token has expired' });
        } else if (error.name === 'JsonWebTokenError') {
            await logApiResponse(req, 'Unauthorized access: Invalid token', 401, {});
            return res.status(401).json({ message: 'Unauthorized access: Invalid token' });
        } else {
            await logApiResponse(req, 'Internal server error', 500, { error: error.message });
            return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
};

module.exports = authMiddleware;
