const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission } = require("../middlewares/permissionsMiddleware");
const { upload } = require('../middlewares/multerMiddleware');
const { destroyUser } = require('../validations/userValidation');

router.post('/createUser', authMiddleware, upload.single('avatar'), userController.createUser);
router.post('/updateUser', authMiddleware, upload.single('avatar'), userController.updateUser);
router.post('/getUsers', authMiddleware, userController.getAllUsers);
router.post('/getUser', authMiddleware, userController.getUserById);
router.post('/deleteUser', authMiddleware, userController.toggleSoftDeleteUser);
router.post('/paginateUsers', authMiddleware, userController.getPaginatedUsers);
router.post('/destroyUser', authMiddleware, destroyUser, userController.destroyUser);

module.exports = router;
