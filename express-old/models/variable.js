const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
    batch_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    variable_code: {
        type: String,
        required: true
    },
    variable_description: {
        type: String,
        required: true
    },
    uom: {
        type: String,
        required: true
    },
    ds_tag_id: {
        type: String,
        required: true
    },
    ds_tag_code: {
        type: String,
        required: true
    },
    min: {
        type: Number,
        required: true
    },
    max: {
        type: Number,
        required: true
    },
    lcl: {
        type: Number,
        required: true
    },
    ucl: {
        type: Number,
        required: true
    },
    flatline_length: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'variables'
});

module.exports = mongoose.model('Variable', variableSchema);