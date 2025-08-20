const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetConfigurationSchema = new Schema({
    asset_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
    },

    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
    },
    order: {
        type: Number,
        required: [true, 'Order is required'],
        index: true
    },
    row_limit: {
        type: Number,
        required: [true, 'Row limit is required']
    }
}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});


assetConfigurationSchema.index(
    { order: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

assetConfigurationSchema.index(
    { row_limit: 1 },
    { partialFilterExpression: { deleted_at: null } }
);

// Explicitly specify collection name
module.exports = mongoose.model('AssetConfiguration', assetConfigurationSchema, 'asset_configuration');
