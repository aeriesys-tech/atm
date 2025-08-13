const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetAttributeSchema = new Schema({
    field_name: {
        type: String,
        index: true,
        required: [true, 'Field name is required']
    },
    field_type: {
        type: String,
        required: [true, 'Field type is required'],
        index: true,
        enum: ['string', 'number', 'select', 'date', 'textarea', 'file']
    },
    field_value: {
        type: [String],
        index: true,
        // required: [true, 'Field value is required']
    },
    display_name: {
        type: String,
        index: true,
        required: [true, 'Display name is required']
    },
    required: {
        type: Boolean,
        // default: true,
        index: true,
        required: [true, 'Field "required" status is required']
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
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});
assetAttributeSchema.index(
    { field_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

assetAttributeSchema.index(
    { field_type: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);
module.exports = mongoose.model('AssetAttribute', assetAttributeSchema, 'asset_attribute');
