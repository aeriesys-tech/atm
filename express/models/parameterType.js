const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const parameterTypeSchema = new Schema({
    parameter_type_code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    parameter_type_name: {
        type: String,
        required: true,
        index: true,
        maxlength: 100 // Limits the maximum length of the parameter type name
    },
    order: {
        type: Number,
        required: true,
        index: true,
    },
    icon: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true,
        default: true // Assuming true means active and visible
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    versionKey: false,
    collection: 'parameter_type'
});

module.exports = mongoose.model('ParameterType', parameterTypeSchema);
