const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    module_name: {
        type: String,
        required: true,
    },
    module_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    notification: {
        type: String,
        required: true,
    },
    notification_type: {
        type: String,
        default: 'info',
    },
    date_time: {
        type: Schema.Types.Mixed, // <-- supports both Date or object with { before, after }
        default: () => new Date()
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
}, {
    versionKey: false,
    collection: 'notifications'
});

module.exports = mongoose.model('Notification', notificationSchema);
