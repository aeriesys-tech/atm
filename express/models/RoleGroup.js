const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleGroupSchema = new Schema({
    role_group_code: {
        type: String,
        required: [true, 'Role group code is required'],
        unique: true,
        trim: true
    },
    role_group_name: {
        type: String,
        required: [true, 'Role group name is required'],
        trim: true,
        maxlength: 30,
        unique: true
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

// Explicitly specify collection name
module.exports = mongoose.model('RoleGroup', roleGroupSchema, 'rolegroups');
