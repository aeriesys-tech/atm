const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaDefinitionSchema = new Schema({
    collectionName: {
        type: String,
        required: true,
        unique: true,
    },
    schemaDefinition: {
        type: Map,
        of: new Schema({
            type: { type: String, required: true },
            required: { type: Boolean, default: false },
            default: { type: mongoose.Schema.Types.Mixed, default: undefined }
        }),
        required: true
    },
    deleted_at: {
        type: Date,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const SchemaDefinitionModel = mongoose.model('SchemaDefinition', schemaDefinitionSchema);
module.exports = SchemaDefinitionModel;
