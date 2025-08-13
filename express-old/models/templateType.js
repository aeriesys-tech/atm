const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateTypeSchema = new Schema({
    template_type_code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    template_type_name: {
        type: String,
        required: true,
        index: true,
        maxlength: 100 // Limits the maximum length of the parameter type name
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
    collection: 'template_type'
});

module.exports = mongoose.model('TemplateType', templateTypeSchema);
