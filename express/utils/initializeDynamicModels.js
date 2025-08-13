const mongoose = require('mongoose');
const SchemaDefinitionModel = require('../models/schemaDefinition');
const { mapSchemaDefinition } = require('./typeMapping');

async function initializeDynamicModels() {
    try {
        const schemaDefinitions = await SchemaDefinitionModel.find({});
        schemaDefinitions.forEach(definition => {
            try {
                const schemaConfig = mapSchemaDefinition(definition.schemaDefinition);
                if (!mongoose.models[definition.collectionName]) {
                    const dynamicSchema = new mongoose.Schema(schemaConfig, {
                        strict: false,
                        collection: definition.collectionName  // Ensure collection name is explicitly set
                    });
                    mongoose.model(definition.collectionName, dynamicSchema);
                }
            } catch (error) {
                console.error(`Error processing schema for collection ${definition.collectionName}: ${error}`);
            }
        });

    } catch (error) {
        console.error("Error reinitializing models:", error);
    }
}

module.exports = initializeDynamicModels;
