const Notification = require('../models/notification');
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const { createNotification } = require('../utils/notification');
const NotificationUser = require('../models/notificationUser');

const paginateNotifications = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        order = 'desc',
        search = '',
        status,

    } = req.query;

    const {
        user_id

    } = req.body;

    const allowedSortFields = ['_id', 'data_time', 'module_name', 'notification'];
    const cleanSortBy = String(sortBy).trim();
    const safeSortBy = allowedSortFields.includes(cleanSortBy) ? cleanSortBy : '_id';

    const sort = {
        [safeSortBy]: order === 'desc' ? -1 : 1
    };

    const searchQuery = {
        $and: [
            search ? {
                $or: [
                    { module_name: new RegExp(search, 'i') },
                    { notification: new RegExp(search, 'i') }
                ]
            } : {},
            status !== undefined ? { status: status === 'active' } : {},
            user_id ? { user_id } : {} // <-- conditionally add user_id
        ]
    };

    try {
        const notifications = await Notification.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await Notification.countDocuments(searchQuery);

        const responseData = {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            notifications,
            totalItems: count
        };

        await logApiResponse(req, "Paginated notifications retrieved successfully", 200, responseData);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error retrieving paginated notifications:", error);
        await logApiResponse(req, "Failed to retrieve paginated notifications", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to retrieve paginated notifications",
            error: error.message
        });
    }
};


const createNotificationUser = async (req, res) => {
    const { id } = req.body;
    const user_id = req.user._id;

    try {
        const newNotificationUser = await NotificationUser.findOneAndUpdate(
            { user_id, notification_id: id },
            { $setOnInsert: { user_id, notification_id: id } },
            { new: true, upsert: true }
        );

        await logApiResponse(req, "NotificationUser upserted successfully", 200, newNotificationUser);
        res.status(200).json({ message: "NotificationUser upserted successfully", data: newNotificationUser });
    } catch (error) {
        console.error("Failed to upsert NotificationUser:", error);
        await logApiResponse(req, "Failed to upsert NotificationUser", 500, { error: error.message });
        res.status(500).json({
            message: "Failed to upsert NotificationUser",
            error: error.message
        });
    }
};




const getNotification = async (req, res) => {
    const { id } = req.body;
    try {
        const notification = await Notification.findById(id);
        if (!notification) {
            await logApiResponse(req, "Notification not found", 404, {});
            return res.status(404).json({ message: "Notification not found" });
        }
        await logApiResponse(req, "Notification retrieved successfully", 200, notification);
        res.status(200).json({ message: "Notification retrieved successfully", data: notification });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const getNotificationUsers = async (req, res) => {
    const user_id = req.user._id;
    try {
        const notification_users = await NotificationUser.findById(user_id);
        await logApiResponse(req, "Notification retrieved successfully", 200, notification_users);
        res.status(200).json({ message: "Notification retrieved successfully", data: notification_users });
    } catch (error) {
        await logApiResponse(req, "Failed to create role", 500, { error: error.message });
        res.status(500).json({ message: "Failed to create role", error: error.message });
    }
};


const countUnreadNotifications = async (req, res) => {
    const user_id = req.user._id;
    try {
        const totalNotifications = await Notification.countDocuments({ user_id });
        const readNotifications = await NotificationUser.countDocuments({ user_id });

        const unreadCount = totalNotifications - readNotifications;

        await logApiResponse(req, "Notification count retrieved successfully", 200, unreadCount);
        res.status(200).json({ message: "Notification count retrieved successfully", data: unreadCount });

    } catch (error) {
        console.error("Failed to count unread notifications:", error);
        return responseService.error(req, res, "Internal Server Error", {
            message: "An unexpected error occurred"
        }, 500);
    }
};


const readAllNotifications = async (req, res) => {
    const user_id = req.user._id;

    try {
        const notifications = await Notification.find();
        const upserted = [];
        console.log("notificationsss", notifications);
        for (const notification of notifications) {
            const result = await NotificationUser.findOneAndUpdate(
                { user_id, notification_id: notification._id },
                { $setOnInsert: { user_id, notification_id: notification._id } },
                { new: true, upsert: true }
            );
            upserted.push(result);
        }

        await logApiResponse(req, "All NotificationUsers upserted successfully", 200, { upserted });
        res.status(200).json({ message: "All NotificationUsers upserted successfully" });
    } catch (error) {
        await logApiResponse(req, "Failed to upsert NotificationUsers", 500, { error: error.message });
        res.status(500).json({ message: "Failed to upsert NotificationUsers", error: error.message });
    }
};

module.exports = {
    paginateNotifications,
    getNotification,
    countUnreadNotifications,
    createNotificationUser,
    readAllNotifications,
    getNotificationUsers

}
