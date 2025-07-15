const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateMasterSchema = new Schema({
    template_type_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'TemplateType' },
    template_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Template' },
    master_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Master' },
    master_name: { type: String, required: true },
    document_id: { type: mongoose.Schema.Types.ObjectId, },
    document_code: { type: String, },
    document_heading_code: { type: String },
    heading_name: { type: String },
    node: { type: Schema.Types.Mixed }, // Dynamic data
    nodes: { type: Schema.Types.Mixed }, // Dynamic data
    template_master_code: {
        type: String,
        index: true,
        // default: () => 'TM' + Date.now()
    },
    source_id: { type: String },
    leaf_node: {
        type: Boolean,

        index: true
    }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('TemplateMaster', templateMasterSchema);
