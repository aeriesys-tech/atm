const mongoose = require('mongoose');
const Variable = require('../models/variable');
const { responseService, logApiResponse } = require('../utils/responseService');


const updateStatus = async (req, res) => {
    const { variable_ids } = req.body;

    if (!Array.isArray(variable_ids) || variable_ids.length === 0) {
        return responseService.error(req, res, "Validation Error", {
            variable_ids: "An array of Variable IDs is required"
        }, 400);
    }

    // const invalidVariableIds = variable_ids.filter(id => !mongoose.Types.ObjectId.isValid(id));
    // if (invalidVariableIds.length > 0) {
    //     return responseService.error(req, res, "Validation Error", {
    //         variable_ids: `Invalid ObjectId(s): ${invalidVariableIds.join(', ')}`
    //     }, 400);
    // }

    try {
        const updatedVariables = [];

        for (const id of variable_ids) {
            const variable = await Variable.findById(id);
            if (!variable) continue;

            variable.status = !variable.status;
            await variable.save();
            updatedVariables.push(variable);
        }

        return responseService.success(req, res, "Variable status updated successfully", {
            updated_variables: updatedVariables
        }, 200);
    } catch (error) {
        console.error("Failed to update variables:", error);
        return responseService.error(req, res, "Internal Server Error", {
            message: "An unexpected error occurred"
        }, 500);
    }
};

const updateVariableDetails = async (req, res) => {
    const { _id, ds_tag_id, ds_tag_code, min, max, lcl, ucl, flatline_length, status } = req.body;
    const variable_id = _id;
    if (!mongoose.Types.ObjectId.isValid(variable_id)) {
        return responseService.error(req, res, "Validation Error", {
            variable_id: "Invalid Variable ID"
        }, 400);
    }

    try {
        const variable = await Variable.findById(variable_id);
        if (!variable) {
            return responseService.error(req, res, "Not Found", {
                variable_id: "Variable not found"
            }, 404);
        }

        // Update only specific fields
        variable.ds_tag_id = ds_tag_id ?? variable.ds_tag_id;
        variable.ds_tag_code = ds_tag_code ?? variable.ds_tag_code;
        variable.min = min ?? variable.min;
        variable.max = max ?? variable.max;
        variable.lcl = lcl ?? variable.lcl;
        variable.ucl = ucl ?? variable.ucl;
        variable.flatline_length = flatline_length ?? variable.flatline_length;
        variable.status = status ?? variable.status;
        await variable.save();

        return responseService.success(req, res, "Variable details updated successfully", {
            updated_variable: variable
        }, 200);
    } catch (error) {
        console.error("Failed to update variable details:", error);
        return responseService.error(req, res, "Internal Server Error", {
            message: "An unexpected error occurred"
        }, 500);
    }
};



const paginateBatchVariables = async (req, res) => {
    const {
        batch_id,
        page = 1,
        limit = 10,
        sortBy = '_id',
        order = 'desc',
        search = ''
    } = req.body;

    if (!batch_id || !mongoose.Types.ObjectId.isValid(batch_id)) {
        return responseService.error(req, res, "Validation Error", {
            batch_id: "Invalid or missing batch_id"
        }, 400);
    }

    try {
        const query = {
            batch_id: new mongoose.Types.ObjectId(batch_id),
            $or: [
                { variable_code: { $regex: search, $options: 'i' } },
                { variable_description: { $regex: search, $options: 'i' } },
                { uom: { $regex: search, $options: 'i' } },
                { ds_tag_id: { $regex: search, $options: 'i' } },
                { ds_tag_code: { $regex: search, $options: 'i' } }
            ]
        };

        const total = await Variable.countDocuments(query);
        const variables = await Variable.find(query)
            .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return responseService.success(req, res, "Variables fetched successfully", {
            data: variables,
            pagination: {
                page: Number(page),
                totalItems: total,
                totalPages: Math.ceil(total / limit)
            }
        }, 200);
    } catch (error) {
        console.error("Error in paginateBatchVariables:", error);
        return responseService.error(req, res, "Internal Server Error", {
            message: "Something went wrong"
        }, 500);
    }
};


module.exports = {
    updateStatus,
    updateVariableDetails,
    paginateBatchVariables,
};