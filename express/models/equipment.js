const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const equipmentSchema = new Schema(
    {
        status: {
            type: Boolean,
            default: true,
        },
        deleted_at: {
            type: Date,
            default: null,
        },
    },
    {
        strict: false, // allows dynamic fields
        versionKey: false,
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

// Explicitly specify collection name
module.exports = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema, 'equipments');
