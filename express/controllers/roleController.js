const Role = require('../models/Role');
const mongoose = require('mongoose');
const { logApiResponse } = require('../utils/responseService');

const getPaginatedRoles = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'role_code', order = 'desc', search = '', status } = req.query;
    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { role_name: new RegExp(search, 'i') },
                    { role_code: new RegExp(search, 'i') }
                ]
            } : {},
            status ? { status: status === 'active' } : {}
        ]
    };

    try {
        const roles = await Role.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const count = await Role.countDocuments(searchQuery);
        await logApiResponse(req, 'Roles retrieved successfully', 200, { roles, totalPages: Math.ceil(count / limit), currentPage: Number(page), totalItems: count });

        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            roles,
            totalItems: count,
        });
    } catch (error) {
        console.error("Error retrieving paginated roles:", error);
        await logApiResponse(req, 'Error retrieving paginated roles', 500, { error: error.message });

        res.status(500).json({ message: "Error retrieving paginated roles", error: error.message });
    }
};

module.exports = {
    getPaginatedRoles
}