const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Assuming users are stored in MongoDB
        ref: 'User', // Reference to User model
        required: false, // Null allowed if unauthenticated
    },
    api_name: {
        type: String,
        required: true,
    },
    api_request: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    ip_address: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    response: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },

},
    {
        versionKey: false
    });

const ApiLog = mongoose.model('apiLog', apiLogSchema);

module.exports = ApiLog;
