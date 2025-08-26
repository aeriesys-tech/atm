const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateDataSchema = new Schema({
    template_id: {
        type: Schema.Types.ObjectId,
        ref: 'Template',
        index: true,
        required: [true, 'Template ID is required']
    },
    structure: {
        type: {},
        index: true,
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
    collection: 'template_data'
});

module.exports = mongoose.model('TemplateData', templateDataSchema, 'template_data');
