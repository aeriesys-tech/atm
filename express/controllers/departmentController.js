const Department = require('../models/department');
const { logApiResponse } = require('../utils/responseService');

const getPaginatedDepartment = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '', status } = req.query;

    // Building the sort object dynamically based on the query parameters
    const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

    // Implementing search functionality
    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { department_name: new RegExp(search, 'i') },
                    { department_code: new RegExp(search, 'i') }
                ]
            } : {},
            status ? { status: status === 'active' } : {}
        ]
    };

    try {
        const departments = await Department.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        const count = await Department.countDocuments(searchQuery);

        res.json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            departments,
            totalItems: count,
        });
    } catch (error) {
        console.error("Error retrieving paginated departments:", error);
        await logApiResponse(req, "Error retrieving paginated departments", 500, { error: error.message });
        res.status(500).json({ message: "Error retrieving paginated departments", error: error.message });
    }
};


module.exports = {
    getPaginatedDepartment
}