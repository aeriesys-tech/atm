const ParameterType = require('../models/parameterType');
const Master = require('../models/master');
const { logApiResponse } = require('../utils/responseService');

const createParameterType = async (req, res) => {
    try {
        const { parameter_type_code, parameter_type_name, order, status, deleted_at } = req.body;
        const existingParameterType = await ParameterType.findOne({ parameter_type_code });
        if (existingParameterType) {
            await logApiResponse(req, 'Parameter type code already exists', 400, { message: 'Parameter type code already exists' });
            return res.status(400).json({ message: 'Parameter type code already exists' });
        }
        const newParameterType = new ParameterType({
            parameter_type_code,
            parameter_type_name,
            order,
            status: status !== undefined ? status : true,
            deleted_at: deleted_at || null
        });
        const savedParameterType = await newParameterType.save();

        await logApiResponse(req, 'Parameter type created successfully', 201, savedParameterType);
        res.status(201).json(savedParameterType);
    } catch (error) {
        console.error('Server error:', error);
        await logApiResponse(req, 'Server error', 500, { message: 'Server error', error });
        res.status(500).json({ message: 'Server error', error });
    }
};

const updateParameterType = async (req, res) => {
    try {
        const { id } = req.params;
        const { parameter_type_code, parameter_type_name, order, status, deleted_at } = req.body;
        const existingParameterType = await ParameterType.findOne({ parameter_type_code });
        if (existingParameterType && existingParameterType._id.toString() !== id) {
            await logApiResponse(req, 'Parameter type code already exists', 400, { message: 'Parameter type code already exists' });
            return res.status(400).json({ message: 'Parameter type code already exists' });
        }
        const updatedParameterType = await ParameterType.findByIdAndUpdate(
            id,
            {
                parameter_type_code,
                parameter_type_name,
                order,
                status: status !== undefined ? status : true,
                deleted_at: deleted_at || null,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!updatedParameterType) {
            await logApiResponse(req, 'ParameterType not found', 404, { message: 'ParameterType not found' });
            return res.status(404).json({ message: 'ParameterType not found' });
        }

        await logApiResponse(req, 'ParameterType updated successfully', 200, updatedParameterType);
        res.status(200).json(updatedParameterType);
    } catch (error) {
        console.error('Server error:', error);
        await logApiResponse(req, 'Server error', 500, { message: 'Server error', error });
        res.status(500).json({ message: 'Server error', error });
    }
};

const getParameterTypes = async (req, res) => {
    try {
        const parameterTypes = await ParameterType.find().sort({ order: 1 });
        const parameterTypesWithMasters = await Promise.all(parameterTypes.map(async (parameterType) => {
            const masters = await Master.find({
                parameter_type_id: parameterType._id,
                status: true
            }).select('master_name _id order').sort({ order: 1 });
            const masterDetails = masters.map(master => ({
                masterName: master.master_name,
                masterId: master._id,
                order: master.order
            }));
            return {
                ...parameterType.toObject(),
                masterDetails,
                masterCount: masterDetails.length  // Add the count of master details
            };
        }));

        await logApiResponse(req, 'Parameter types retrieved successfully', 200, parameterTypesWithMasters);
        res.status(200).json(parameterTypesWithMasters);
    } catch (error) {
        console.error('Server error:', error);
        await logApiResponse(req, 'Server error', 500, { message: 'Server error', error });
        res.status(500).json({ message: 'Server error', error });
    }
};

const getParameterType = async (req, res) => {
    try {
        const { id } = req.params;

        const parameterType = await ParameterType.findById(id);
        if (!parameterType) {
            await logApiResponse(req, 'ParameterType not found', 404, {});
            return res.status(404).json({ message: 'ParameterType not found' });
        }

        await logApiResponse(req, 'ParameterType retrieved successfully', 200, parameterType);
        res.status(200).json(parameterType);
    } catch (error) {
        console.error('Server error:', error);
        await logApiResponse(req, 'Server error', 500, { message: 'Server error', error });
        res.status(500).json({ message: 'Server error', error });
    }
};

const deleteParameterType = async (req, res) => {
    try {
        const { id } = req.params;

        const parameterType = await ParameterType.findById(id);
        if (!parameterType) {
            await logApiResponse(req, 'ParameterType not found', 404, {});
            return res.status(404).json({ message: 'ParameterType not found' });
        }

        if (parameterType.deleted_at) {
            parameterType.deleted_at = null;
            parameterType.status = true;
        } else {
            parameterType.deleted_at = new Date();
            parameterType.status = false;
        }

        parameterType.updated_at = new Date();

        const updatedParameterType = await parameterType.save();

        await logApiResponse(req, 'ParameterType toggled successfully', 200, updatedParameterType);
        res.status(200).json(updatedParameterType);
    } catch (error) {
        console.error('Server error:', error);
        await logApiResponse(req, 'Server error', 500, { message: 'Server error', error });
        res.status(500).json({ message: 'Server error', error });
    }
};

const paginatedParameterTypes = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'created_at', order = 'desc', search = '' } = req.query;
    const sort = {
        [sortBy]: order === 'desc' ? -1 : 1
    };
    const searchQuery = search ? {
        $or: [
            { parameter_type_name: new RegExp(search, 'i') },
            { parameter_type_code: new RegExp(search, 'i') }
        ]
    } : {};

    try {
        const parameterTypes = await ParameterType.find(searchQuery)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await ParameterType.countDocuments(searchQuery);

        res.json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            parameterTypes,
            totalItems: count,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createParameterType, updateParameterType, getParameterTypes, getParameterType, deleteParameterType, paginatedParameterTypes }
