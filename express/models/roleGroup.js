const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleGroupSchema = new Schema({
    role_group_code: {
        type: String,
        required: [true, 'Role group code is required'],
        trim: true,
        index: true
    },
    role_group_name: {
        type: String,
        required: [true, 'Role group name is required'],
        trim: true,
        maxlength: 30,
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
roleGroupSchema.index(
    { role_group_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

roleGroupSchema.index(
    { role_group_code: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

// Explicitly specify collection name
module.exports = mongoose.model('RoleGroup', roleGroupSchema, 'rolegroups');
