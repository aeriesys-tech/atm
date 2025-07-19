const Department = require('../models/department');
const { createNotification } = require('../utils/notification');
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");

const paginatedDepartments = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'department_code',
        order = 'asc',
        search = '',
        status
    } = req.query;

    const allowedSortFields = ['_id', 'department_name', 'department_code'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };
    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { department_name: new RegExp(search, 'i') },
                    { department_code: new RegExp(search, 'i') }
                ]
            } : {},
            status !== undefined ? { status: status === 'active' } : {}
        ]
    };

    try {
        const Departments = await Department.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await Department.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated Departments retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            Departments,
            totalItems: count
        });

        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            Departments,
            totalItems: count
        });
    } catch (error) {
        console.error("Error retrieving paginated Departments:", error);
        await logApiResponse(req, "Failed to retrieve paginated Departments", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve paginated Departments",
            error: error.message
        });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { department_code, department_name } = req.body;

        const department = await Department.findOne({
            $or: [{ department_code }, { department_name }]
        });
        if (department) {
            let errors = {};
            if (department.department_code === department_code) errors.department_code = "Department code already exists";
            if (department.department_name === department_name) errors.department_name = "Department name already exists";
            await logApiResponse(req, "Duplicate Department", 400, errors);
            return res.status(400).json({ message: "Duplicate Department", errors });
        }
        const newDepartment = await Department.create({ department_code, department_name });
        await redisClient.del('departments');
        await createNotification(req, 'Department', newDepartment._id, 'Department created successfully');
        await logApiResponse(req, "Department created successfully", 201, newDepartment);
        res.status(201).json({
            message: "Department  created successfully", data: newDepartment
        });
    } catch (error) {
        await logApiResponse(req, "Failed to create Department", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create Department", error: error.message });
    }
};


const updateDepartment = async (req, res) => {
    try {
        const { id, department_code, department_name, status, deleted_at } = req.body;
        const existingDepartment = await Department.findById(id);
        if (!existingDepartment) {
            return logApiResponse(req, "Department not found", 404, { id: "Department not found" }) &&
                res.status(404).json({ message: "Department not found", errors: { id: "Department  not found" } });
        }

        const [duplicateCode, duplicateName] = await Promise.all([
            Department.findOne({ department_code, _id: { $ne: id } }),
            Department.findOne({ department_name, _id: { $ne: id } })
        ]);

        if (duplicateCode || duplicateName) {
            const errors = {};
            if (duplicateCode) errors.department_code = "Department code already exists";
            if (duplicateName) errors.department_name = "Department name already exists";

            return logApiResponse(req, "Validation Error", 400, errors) &&
                res.status(400).json({ message: "Validation Error", errors });
        }
        await Department.findByIdAndUpdate(id, { department_code, department_name, status, deleted_at, updated_at: Date.now() });
        const updatedDepartment = await Department.findById(id);
        await createNotification(req, 'Department', id, 'Department updated successfully');
        await logApiResponse(req, "Department updated successfully", 200, updatedDepartment);
        return res.status(200).json({ message: "Department updated successfully", data: updatedDepartment });

    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ status: true });
        await logApiResponse(req, "Departments retrieved successfully", 200, departments);
        res.status(200).json({ message: "Departments retrieved successfully", departments: departments });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const getDepartment = async (req, res) => {
    const { id } = req.body;
    try {
        const department = await Department.findById(id);
        if (!department) {
            await logApiResponse(req, "Department not found", 404, {});
            return res.status(404).json({ message: "Department not found" });
        }
        await logApiResponse(req, "Department retrieved successfully", 200, department);
        res.status(200).json({ message: "Department retrieved successfully", data: department });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const deleteDepartment = async (req, res) => {
    try {
        const { id, ids } = req.body;

        const toggleSoftDelete = async (_id) => {
            const department = await Department.findById(_id);
            if (!department) throw new Error(`Department with ID ${_id} not found`);
            department.deleted_at = department.deleted_at ? null : new Date();
            department.status = !department.deleted_at;
            department.updated_at = new Date();
            return department.save();
        };

        if (Array.isArray(ids)) {
            const updatedDepartments = await Promise.all(ids.map(toggleSoftDelete));
            await logApiResponse(req, 'Departments updated successfully', 200, updatedDepartments);
            return res.status(200).json({ message: 'Departments updated successfully', data: updatedDepartments });
        }

        if (id) {
            const updatedDepartment = await toggleSoftDelete(id);
            const message = updatedDepartment.deleted_at ? 'Department is inactivated successfully' : 'Department is activated successfully';
            await createNotification(req, 'Department', id, message);
            await logApiResponse(req, message, 200, updatedDepartment);
            return res.status(200).json({ message, data: updatedDepartment });
        }

        await logApiResponse(req, 'No ID or IDs provided', 400, {});
        return res.status(400).json({ message: 'No ID or IDs provided' });

    } catch (error) {
        await logApiResponse(req, "Role delete/restore failed", 500, { error: error.message });
        return res.status(500).json({ message: "Role delete/restore failed", error: error.message });
    }
};

const destroyDepartment = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return logApiResponse(req, 'Department ID is required', 400, false, null, res);
        }
        const department = await Department.findOne({ _id: id }).lean({ virtuals: false });
        if (!department) {
            return logApiResponse(req, 'Role not found', 404, false, null, res);
        }
        await Department.deleteOne({ _id: id });
        await createNotification(req, 'Department', id, 'Department permanently deleted');
        await logApiResponse(req, 'Department permanently deleted', 200, true, null, res);
        res.status(200).json({ message: 'Department permanently deleted' });
    } catch (error) {
        await logApiResponse(req, "Failed to create Department", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create Department", error: error.message });
    }
};


module.exports = {
    paginatedDepartments,
    createDepartment,
    updateDepartment,
    getDepartments,
    getDepartment,
    deleteDepartment,
    destroyDepartment

}