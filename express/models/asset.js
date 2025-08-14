const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetSchema = new Schema({
    asset_code: {
        type: String,
        required: [true, 'Asset code is required'],
        trim: true,
        index: true,
        unique: true
    },
    asset_name: {
        type: String,
        required: [true, 'Asset name is required'],
        unique: true,
        index: true,
        trim: true
    },
    asset_id: {
        type: Schema.Types.ObjectId,
        ref: 'Asset'
    },
    structure: {
        type: String, // Assuming this is a String; modify the type as needed.
        index: true,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: true // Assuming true means active and visible
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
    },
    deleted_at: {
        type: Date,
        default: null
    }
}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Partial indexes to support Cosmos DB sorting & soft delete
assetSchema.index(
    { asset_code: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

assetSchema.index(
    { asset_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

// Explicitly specify collection name
module.exports = mongoose.model('Asset', assetSchema, 'assets');
