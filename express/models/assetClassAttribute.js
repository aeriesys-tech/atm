const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetClassAttributeSchema = new Schema({
    asset_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
        required: [true, 'Asset ID is required'],
        index: true,
    },
    asset_attribute_ids: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AssetAttribute',
            required: [true, 'Asset attribute ID is required'],
            index: true,
        },
        order: {
            type: Number,
            required: true,
            index: true,
        },
    }],
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
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

assetClassAttributeSchema.index(
    { asset_id: 1, "asset_attribute_ids.id": 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);
assetClassAttributeSchema.index(
    { asset_id: 1, "asset_attribute_ids.order": 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

// Explicitly specify collection name
module.exports = mongoose.model(
    'AssetClassAttribute',
    assetClassAttributeSchema,
    'asset_class_attributes'
);
