const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    department_code: {
        type: String,
        required: [true, 'Department code is required'],
        index: true,
        unique: true
    },
    department_name: {
        type: String,
        required: [true, 'Department name is required'],
        index: true,
        unique: true,
        maxlength: [30, 'Department name must be at most 30 characters long'],
    },
    deleted_at: {
        type: Date,
        index: true,
        default: null
    },
    status: {
        type: Boolean,
        required: true,
        index: true,
        default: true
    },
    created_at: {
        type: Date,
        index: true,
        default: Date.now
    },
    updated_at: {
        type: Date,
        index: true,
        default: Date.now
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Department', departmentSchema);
