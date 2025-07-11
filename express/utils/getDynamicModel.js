const mongoose = require('mongoose');
const SchemaDefinitionModel = require('../models/SchemaDefinition');
const { mapSchemaDefinition } = require('./typeMapping');

async function getDynamicModel(collectionName) {
    if (mongoose.models[collectionName]) {
        return mongoose.model(collectionName);
    } else {
        const schemaDefinitionDoc = await SchemaDefinitionModel.findOne({ collectionName });
        if (!schemaDefinitionDoc) {
            console.error(`No schema found for ${collectionName}`);
            return null;
        }

        const schemaConfig = mapSchemaDefinition(schemaDefinitionDoc.schemaDefinition);

        const dynamicSchema = new mongoose.Schema(schemaConfig, { strict: false });
        mongoose.model(collectionName, dynamicSchema, collectionName);
        return mongoose.model(collectionName);
    }
}

module.exports = getDynamicModel;
