const Notification = require('../models/notification');

/**
 * Creates and saves a new notification using data and req object.
 *
 * @param {Object} req - Express request object (should have `req.user`)
 * @param {String} module_name - Name of the related module (e.g., 'User', 'Role')
 * @param {mongoose.Types.ObjectId} module_id - ID of the related document
 * @param {String} message - Notification text
 * @param {Date} [date_time=new Date()] - Optional event timestamp
 * @returns {Promise<Object>} - The saved notification document
 */
const createNotification = async (
    req,
    module_name,
    module_id,
    message,
    notification_type,
    date_time = new Date()
) => {
    const user_id = req.user?.id || req.user?._id || null;

    if (!user_id || !module_name || !module_id || !message) {
        throw new Error('Missing required fields to create a notification');
    }

    const newNotification = new Notification({
        user_id,
        module_name,
        module_id,
        notification: message,
        notification_type,
        date_time,
    });

    return await newNotification.save();
};

module.exports = {
    createNotification,
};
