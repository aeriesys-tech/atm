const mongoose = require('mongoose');
const notificationUserSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notification_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        required: true,
    },
}, {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: false }
})

const notificationUser = mongoose.model('NotificationUser', notificationUserSchema);
module.exports = notificationUser;