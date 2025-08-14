const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission } = require("../middlewares/permissionsMiddleware");
const { upload } = require('../middlewares/multerMiddleware');

router.post('/login', authController.loginUser);
router.post('/validate-otp', authController.validateOtp);
router.post('/resend-otp', authController.resendOtp);

router.post('/password', authMiddleware, authController.updatePassword);
router.post('/profile', authMiddleware, upload.single('avatar'), authController.updateProfile);
// router.post('/me', authMiddleware.verifyToken, authController.me);
router.post('/me', authMiddleware, authController.me);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-forgot-password-otp', authController.resendForgotPasswordOtp);

router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
