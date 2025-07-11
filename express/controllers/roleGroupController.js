const RoleGroup = require('../models/RoleGroup');
const { logApiResponse } = require('../utils/responseService');

const getPaginatedRoleGroups = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'asc', search = '', status } = req.query;
    const sort = {
        [sortBy]: order === 'desc' ? -1 : 1
    };
    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { role_group_name: new RegExp(search, 'i') },
                    { role_group_code: new RegExp(search, 'i') }
                ]
            } : {},
            status ? { status: status === 'active' } : {}
        ]
    };
    try {
        const roleGroups = await RoleGroup.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const count = await RoleGroup.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated role groups retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            roleGroups,
            totalItems: count
        });
        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            roleGroups,
            totalItems: count,
        });
    } catch (error) {
        console.error("Error retrieving paginated role groups:", error);
        await logApiResponse(req, "Failed to retrieve paginated role groups", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve paginated role groups",
            error: error.message
        });
    }
};


module.exports = {
    getPaginatedRoleGroups
}