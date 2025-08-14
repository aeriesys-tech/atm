const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateSchema = new Schema({
    template_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateType',
        required: true,
    },
    template_code: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true
    },
    template_name: {
        type: String,
        required: true,
        index: true,
        maxlength: 100 // Limits the maximum length of the parameter type name
    },
    structure: {
        type: {},
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
    collection: 'template'
});

module.exports = mongoose.model('Template', templateSchema);
