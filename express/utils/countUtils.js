const mongoose = require('mongoose');

// Function to get document counts for a given model
exports.getDocumentCount = async (modelName) => {
    if (mongoose.models[modelName]) {
        return await mongoose.models[modelName].countDocuments();
    } else {
        console.error(`Model ${modelName} does not exist.`);
        return 0;
    }
};
