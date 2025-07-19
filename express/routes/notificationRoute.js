const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');

router.post('/paginateNotifications', authMiddleware, paginateValidation(['notification']), notificationController.paginateNotifications);
router.post('/getNotification', authMiddleware, Validate([validateId('id', 'Notification ID')]), notificationController.getNotification);

module.exports = router;