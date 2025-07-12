const Department = require('../models/department');
const { logApiResponse } = require('../utils/responseService');

const paginatedDepartments = async (req, res) => {
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

const createDepartment = async (req, res) => {
    const { department_code, department_name } = req.body;

    try {
        // Check if a department with the same code already exists
        const existingDepartment = await Department.findOne({ department_code });
        await logApiResponse(req, "Duplicate Key Error", 409, {
            errors: {
                department_code: "Department with this code already exists"
            }
        });
        if (existingDepartment) {
            return res.status(409).json({
                message: "Duplicate Key Error",
                errors: {
                    department_code: "Department with this code already exists"
                }
            });
        }

        // Create a new department document
        const newDepartment = new Department({
            department_code,
            department_name
        });

        // Save the new department to the database
        await newDepartment.save();

        // Send a successful response back
        await logApiResponse(req, "Department created successfully", 201, newDepartment);
        res.status(201).json({
            message: "Department created successfully",
            data: newDepartment
        });
    } catch (error) {
        console.error("Failed to create department:", error);

        let errors = {};

        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            await logApiResponse(req, "Validation Error", 400, errors);
            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.department_code) {
                errors.department_code = "Department with this code already exists";
            }
            await logApiResponse(req, "Validation Error", 409, errors);
            return res.status(409).json({
                message: "Validation Error",
                errors
            });
        } else {
            await logApiResponse(req, "Internal Server Error", 500, {
                errors: {
                    message: "An unexpected error occurred"
                }
            });
            return res.status(500).json({
                message: "Internal Server Error",
                errors: {
                    message: "An unexpected error occurred"
                }
            });
        }
    }
};

const updateDepartment = async (req, res) => {
    const { id } = req.params; // Department ID from the URL parameter
    const { department_code, department_name, status, deleted_at } = req.body;

    try {
        // Check if a department with the same code already exists and isn't the same as the one being updated
        if (department_code) {
            const existingDepartment = await Department.findOne({ department_code, _id: { $ne: id } });
            if (existingDepartment) {
                await logApiResponse(req, "Duplicate Key Error", 409, {
                    errors: {
                        department_code: "Another department with this code already exists"
                    }
                });
                return res.status(409).json({
                    message: "Duplicate Key Error",
                    errors: {
                        department_code: "Another department with this code already exists"
                    }
                });
            }
        }

        // Find the department by ID and update it
        const updatedDepartment = await Department.findByIdAndUpdate(id, {
            department_code,
            department_name,
            status,
            deleted_at,
            updated_at: Date.now()
        }, { new: true, runValidators: true }); // This option returns the updated document and runs validators

        if (!updatedDepartment) {
            await logApiResponse(req, "Validation Error", 404, {
                errors: {
                    id: "Department not found"
                }
            });
            return res.status(404).json({
                message: "Validation Error",
                errors: {
                    id: "Department not found"
                }
            });
        }

        // Send a successful response back with updated department data
        await logApiResponse(req, "Department updated successfully", 200, updatedDepartment);
        res.status(200).json({
            message: "Department updated successfully",
            data: updatedDepartment
        });
    } catch (error) {
        console.error("Failed to update department:", error);

        let errors = {};

        if (error.name === 'ValidationError') {
            Object.keys(error.errors).forEach(key => {
                errors[key] = error.errors[key].message;
            });
            await logApiResponse(req, "Validation Error", 400, errors);
            return res.status(400).json({
                message: "Validation Error",
                errors
            });
        } else if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.department_code) {
                errors.department_code = "Another department with this code already exists";
            }
            await logApiResponse(req, "Duplicate Key Error", 409, errors);
            return res.status(409).json({
                message: "Duplicate Key Error",
                errors
            });
        } else {
            await logApiResponse(req, "Internal Server Error", 500, {
                errors: {
                    message: "An unexpected error occurred"
                }
            });
            return res.status(500).json({
                message: "Internal Server Error",
                errors: {
                    message: "An unexpected error occurred"
                }
            });
        }
    }
};

const getDepartments = async (req, res) => {
    try {
        // Fetch all departments from the database
        const departments = await Department.find({ status: true });

        // Send a successful response back with the departments data
        await logApiResponse(req, "Departments retrieved successfully", 200, departments);
        res.status(200).json({
            message: "Departments retrieved successfully",
            departments: departments
        });
    } catch (error) {
        console.error("Failed to retrieve departments:", error);
        await logApiResponse(req, "Failed to retrieve departments", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve departments",
            error: error.message
        });
    }
};

const getDepartment = async (req, res) => {
    const { id } = req.params; // Get the department ID from the URL parameter

    try {
        // Fetch the department by ID from the database
        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        // Send a successful response back with the department data
        await logApiResponse(req, "Department retrieved successfully", 200, department);
        res.status(200).json({
            message: "Department retrieved successfully",
            data: department
        });
    } catch (error) {
        console.error("Failed to retrieve department:", error);

        if (error.kind === 'ObjectId') {
            await logApiResponse(req, "Invalid department ID format", 400, { error: error.message });
            return res.status(400).json({
                message: "Invalid department ID format",
                error: error.message
            });
        }
        await logApiResponse(req, "Failed to retrieve department", 500, "An unexpected error occurred");
        res.status(500).json({
            message: "Failed to retrieve department",
            error: "An unexpected error occurred"
        });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { ids } = req.body;

        // Function to toggle soft delete for a single department
        const toggleSoftDelete = async (departmentId) => {
            const department = await Department.findById(departmentId);
            if (!department) {
                throw new Error(`Department with ID ${departmentId} not found`);
            }

            if (department.deleted_at) {
                // Restore the department
                department.deleted_at = null;
                department.status = true;
            } else {
                // Soft delete the department
                department.deleted_at = new Date();
                department.status = false;
            }

            department.updated_at = new Date();
            return await department.save();
        };

        // Check if multiple IDs are provided
        if (ids && Array.isArray(ids)) {
            // Toggle soft delete for multiple departments
            const promises = ids.map(toggleSoftDelete);
            const updatedDepartments = await Promise.all(promises);
            await logApiResponse(req, "Departments updated successfully", 200, updatedDepartments);
            res.status(200).json({
                message: 'Departments updated successfully',
                data: updatedDepartments
            });
        } else if (id) {
            // Toggle soft delete for a single department
            const updatedDepartment = await toggleSoftDelete(id);
            await logApiResponse(req, updatedDepartment.deleted_at ? 'Department soft-deleted successfully' : 'Department restored successfully', 200, updatedDepartment);
            res.status(200).json({
                message: updatedDepartment.deleted_at ? 'Department soft-deleted successfully' : 'Department restored successfully',
                data: updatedDepartment
            });
        } else {
            await logApiResponse(req, "No ID or IDs provided", 400, "No ID or IDs provided");
            res.status(400).json({ message: 'No ID or IDs provided' });
        }
    } catch (error) {
        console.error('Server error', error);

        if (error.message && error.message.includes('not found')) {
            await logApiResponse(req, { message: error.message }, 404, { message: error.message });
            res.status(404).json({ message: error.message });
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            await logApiResponse(req, "Invalid department ID format", 400, { error: error.message });
            res.status(400).json({ message: 'Invalid department ID format', error: error.message });
        } else {
            await logApiResponse(req, "Server error", 500, { error: error.message });
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    }
};


module.exports = {
    paginatedDepartments,
    createDepartment,
    updateDepartment,
    getDepartments,
    getDepartment,
    deleteDepartment
}