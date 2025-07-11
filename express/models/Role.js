const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role_code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    role_name: {
        type: String,
        required: true,
        trim: true,
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
        default: true,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    collection: 'roles',
});

module.exports = mongoose.model('Role', roleSchema);
