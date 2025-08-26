const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateMasterSchema = new Schema({
    template_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    document_code: {
        type: String,
        required: true
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
    collection: 'template_master',
    strict: false // allows dynamic fields at root level
});

module.exports = mongoose.model('TemplateMaster', templateMasterSchema);
