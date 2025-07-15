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
        trim: true
    },
    slug: {
        type: String,
        index: true,
        default: null,
        trim: true
    },
    display_name_singular: {
        type: String,
        required: [true, 'Display name is required'],
        index: true,
        trim: true
    },
    display_name_plural: {
        type: String,
        required: [true, 'Display name is required'],
        index: true,
        trim: true
    },
    order: {
        type: Number,
        index: true,
        default: 0
    },
    icon: {
        type: String,
        default: null,
        trim: true
    },
    model_name: {
        type: String,
        required: [true, 'Table name is required'],
        index: true,
        trim: true
    },
    deleted_at: {
        type: Date,
        default: null
    },
    status: {
        type: Boolean,
        default: true,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false
});
masterSchema.virtual('masterFields', {
    ref: 'MasterField',
    localField: '_id',
    foreignField: 'master_id'
});
masterSchema.index(
    { master_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);

masterSchema.index(
    { model_name: 1 },
    { unique: true, partialFilterExpression: { deleted_at: null } }
);
masterSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Master', masterSchema, 'masters');
