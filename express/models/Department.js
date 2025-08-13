const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    department_code: {
        type: String,
        required: [true, 'Department code is required'],
        unique: true,
        trim: true,
        index: true
    },
    department_name: {
        type: String,
        required: [true, 'Department name is required'],
        trim: true,
        maxlength: [30, 'Department name must be at most 30 characters long'],
        unique: true,
        index: true
    },
    deleted_at: {
        type: Date,
        default: null
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Partial indexes to support Cosmos DB sorting & soft delete
departmentSchema.index(
    { department_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

departmentSchema.index(
    { department_code: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);
module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema, 'departments');
