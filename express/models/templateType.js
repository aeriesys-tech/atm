const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateTypeSchema = new Schema({
    parameter_type_id: [{
        type: String,
        // ref: 'ParameterType',
        index: true,
        required: true
    }],
    template_type_code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        maxlength: 30
    },
    template_type_name: {
        type: String,
        required: true,
        trim: true,
        index: true,
        maxlength: 50
    },
    order: {
        type: Number,
        required: true,
        index: true,
    },
    icon: {
        type: String,
    },
    status: {
        type: Boolean,
        required: true,
        default: true // Assuming true means active and visible
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
    }
}, {
    versionKey: false,
    collection: 'template_type' // Set the custom collection name
});

module.exports = mongoose.model('TemplateType', templateTypeSchema);