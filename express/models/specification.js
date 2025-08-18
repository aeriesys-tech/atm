const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const specificationSchema = new Schema({
    asset_id: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        index: true,
        required: [true, 'Asset ID is required']
    },
    template_id: {
        type: Schema.Types.ObjectId,
        ref: 'Template',
        index: true,
        required: [true, 'Template ID is required']
    },
    master_id: {
        type: Schema.Types.ObjectId,
        ref: 'Master',
        index: true,
        required: false
    },
    parameter_type_id: {
        type: Schema.Types.ObjectId,
        ref: 'ParameterType',
        index: true,
        required: false
    },
    field_name: {
        type: String,
        index: true,
        required: [true, 'Field name is required']
    },
    field_type: {
        type: String,
        index: true,
        required: [true, 'Field type is required']
    },
    field_value: {
        type: [Schema.Types.Mixed],
        index: true,
    },
    display_name: {
        type: String,
        index: true,
        required: [true, 'Display name is required']
    },
    required: {
        type: Boolean,
        index: true,
        required: [true, 'Required field must be specified']
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
    versionKey: false
});

module.exports = mongoose.model('Specification', specificationSchema);
