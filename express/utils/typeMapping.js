// Assuming mapSchemaDefinition.js
const mongoose = require('mongoose');

const typeMapping = {
    String: mongoose.Schema.Types.String,
    Number: mongoose.Schema.Types.Number,
    Date: mongoose.Schema.Types.Date,
    Boolean: mongoose.Schema.Types.Boolean,
    Mixed: mongoose.Schema.Types.Mixed,
    ObjectId: mongoose.Schema.Types.ObjectId,
    Array: Array
};

function mapSchemaDefinition(schemaDefinition) {
    // Standard fields included in every dynamic model
    const standardFields = {
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now },
        deleted_at: { type: Date, default: null },
        status: { type: Boolean, default: true }
    };

    return Object.keys(schemaDefinition).reduce((acc, key) => {
        const field = schemaDefinition[key];
        if (!typeMapping[field.field_type]) {
            // console.error(`Unsupported type '${field.field_type}' for field '${key}'`);
            return acc;
        }
        acc[key] = {
            type: typeMapping[field.field_type],
            required: field.required,
            default: field.default
        };
        return acc;
    }, standardFields);
}

module.exports = { mapSchemaDefinition, typeMapping };
