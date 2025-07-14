const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const masterSchema = new Schema({
    parameter_type_id: {
        type: Schema.Types.ObjectId,
        ref: 'ParameterType',
        required: [true, 'Parameter type ID is required']
    },
    master_name: {
        type: String,
        required: [true, 'Master name is required'],
        index: true,
        unique: true
    },
    slug: {
        type: String,
        // required: true,
        index: true,
        default: null
    },
    display_name_singular: {
        type: String,
        index: true,
        required: [true, 'Display name is required'],
    },
    display_name_plural: {
        type: String,
        index: true,
        required: [true, 'Display name is required'],
    },
    order: {
        type: Number,
        index: true,
        required: false
    },
    icon: {
        type: String,
        default: null
    },
    model_name: {
        type: String,
        index: true,
        required: [true, 'Table name is required'],
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    deleted_at: {
        type: Date,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false
});

masterSchema.virtual('masterFields', {
    ref: 'MasterField',
    localField: '_id',
    foreignField: 'master_id'
});

masterSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Master', masterSchema);