const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    role_code: {
        type: String,
        required: [true, 'Role code is required'],
        trim: true,
        index: true,
    },
    role_name: {
        type: String,
        required: [true, 'Role name is required'],
        trim: true,
        maxlength: 50,
        index: true,
    },
    role_group_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleGroup',
    },
    deleted_at: {
        type: Date,
        default: null, 
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    },
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});
roleSchema.index(
    { role_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

roleSchema.index(
    { role_code: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

// Explicitly specify collection name
module.exports = mongoose.models.Role || mongoose.model('Role', roleSchema, 'roles');
