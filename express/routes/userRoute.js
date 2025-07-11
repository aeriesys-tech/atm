const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission } = require("../middlewares/permissionsMiddleware");
const { upload } = require('../middlewares/multerMiddleware');

router.post('/addUser', authMiddleware, upload.single('avatar'), userController.createUser);
router.post('/updateUser', authMiddleware, upload.single('avatar'), userController.updateUser);
router.post('/getUsers', authMiddleware, userController.getAllUsers);
router.post('/getUser', authMiddleware, userController.getUserById);
router.post('/deleteUser', authMiddleware, userController.toggleSoftDeleteUser);
router.post('/paginateUsers', authMiddleware, userController.getPaginatedUsers);

module.exports = router;
