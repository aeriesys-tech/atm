const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const masterFieldSchema = new Schema({
    master_id: {
        type: Schema.Types.ObjectId,
        required: [true, 'Master ID is required'],
        index: true,
        ref: 'Master'
    },
    field_name: {
        type: String,
        trim: true,
        index: true,
        required: [true, 'Field name is required']
    },
    field_type: {
        type: String,
        index: true,
        required: [true, 'Field type is required']
    },
    display_name: {
        type: String,
        index: true,
        required: [true, 'Display name is required']
    },
    required: {
        type: Boolean,
        required: [true, 'Field required status is required'],
        index: true,
        default: true
    },
    default: {
        type: Boolean,
        required: [true, 'Field default is required'],
        index: true,
        default: false
    },
    // order: {
    //     type: Number,
    //     index: true,
    //     required: [true, 'Field order is required'],
    // },
    browse: {
        type: Boolean,
        index: true,
        default: true
    },
    read: {
        type: Boolean,
        index: true,
        default: true
    },
    edit: {
        type: Boolean,
        index: true,
        default: true
    },
    add: {
        type: Boolean,
        index: true,
        default: true
    },
    delete: {
        type: Boolean,
        index: true,
        default: true
    },
    order: {
        type: Number,
        index: true,
        required: false
    },
    validation: {
        type: String,
        index: true,
        required: false
    },
    tooltip: {
        type: String,
        index: true,
        required: false
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
        index: true,
        default: null
    },
    status: {
        type: Boolean,
        index: true,
        default: true
    },
    searchable: { type: Boolean, default: false }
}, {
    versionKey: false
});

module.exports = mongoose.model('MasterField', masterFieldSchema);
