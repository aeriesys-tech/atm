const Notification = require('../models/notification');
const { logApiResponse } = require('../utils/responseService');
const { Op } = require("sequelize");
const redisClient = require("../config/redisConfig");
const { createNotification } = require('../utils/notification');

const paginateNotifications = async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        order = 'asc',
        search = '',
        status
    } = req.query;

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
            status !== undefined ? { status: status === 'active' } : {}
        ]
    };

    try {
        const notifications = await Notification.find(searchQuery)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await Notification.countDocuments(searchQuery);

        await logApiResponse(req, "Paginated  notifications retrieved successfully", 200, {
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            notifications,
            totalItems: count
        });

        res.status(200).json({
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            notifications,
            totalItems: count
        });
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
    const { notification_id } = req.body;
    const user_id = req.user?.id;

    try {
        const newNotificationUser = new NotificationUser({
            user_id,
            notification_id
        });

        await newNotificationUser.save();

        return responseService.success(req, res, "NotificationUser created successfully", newNotificationUser, 201);
    } catch (error) {
        console.error("Failed to create NotificationUser:", error);
        return responseService.error(req, res, "Internal Server Error", {
            message: "An unexpected error occurred"
        }, 500);
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


const countUnreadNotifications = async (req, res) => {
    const userId = req.user.id;

    try {
        // Count total notifications
        const totalNotifications = await Notification.countDocuments({ user_id: userId });

        // Count notifications this user has already read
        const readNotifications = await NotificationUser.countDocuments({ user_id: userId });

        const unreadCount = totalNotifications - readNotifications;

        return responseService.success(req, res, "Unread notifications count fetched successfully", {
            unread_count: unreadCount
        });

    } catch (error) {
        console.error("Failed to count unread notifications:", error);
        return responseService.error(req, res, "Internal Server Error", {
            message: "An unexpected error occurred"
        }, 500);
    }
};


module.exports = {
    paginateNotifications,
    getNotification

}