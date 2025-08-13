const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetClassAttributeSchema = new Schema({
    asset_id: {
        type: String,
        required: [true, 'Asset ID is required'],
        index: true,
        ref: 'Asset'
    },
    asset_attribute_ids: [{
        id: {
            type: String,
            required: [true, 'Asset attribute ID is required'],
            index: true,
            ref: 'AssetAttribute'
        },
        order: {
            type: Number,
            required: true,
            index: true
        }
    }],
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
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});
assetClassAttributeSchema.index(
    { field_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

assetClassAttributeSchema.index(
    { field_type: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);
module.exports = mongoose.model('AssetClassAttribute', assetClassAttributeSchema, 'asset_class_attributes');
