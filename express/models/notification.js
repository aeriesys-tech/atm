const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date_time: {
            type: Date,
            required: true,
        },
        module_name: {
            type: String,
            required: true, // e.g., 'User', 'Order'
        },
        module_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true, // ObjectId from related model
        },
        notification: {
            type: String,
            required: true, // message content
        },
        timestamp: {
            type: Date,
            default: Date.now, // automatically set
        },
    },
    {
        versionKey: false,
    }
);

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;
