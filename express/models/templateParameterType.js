const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const templateParameterTypeSchema = new Schema({
    template_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TemplateType',
        required: true,
    },
    parameter_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParameterType',
        required: true,
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'template_parameter_types',
    versionKey: false
})

module.exports = mongoose.model('TemplateParameterType', templateParameterTypeSchema);