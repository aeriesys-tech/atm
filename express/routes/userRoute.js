const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission } = require("../middlewares/permissionsMiddleware");
const { upload } = require('../middlewares/multerMiddleware');
const { add_user_validation, update_user_validation } = require('../validations/userValidation');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');

router.post('/createUser', authMiddleware, upload.single('avatar'), add_user_validation, userController.createUser);
router.post('/updateUser', authMiddleware, upload.single('avatar'), update_user_validation, userController.updateUser);
router.post('/paginateUsers', authMiddleware, paginateValidation(['username', 'email', 'role_id']), userController.paginatedUsers);
router.post('/getUsers', authMiddleware, userController.getUsers);
router.post('/getUser', authMiddleware, Validate([validateId('id', 'User ID')]), userController.getUser);
router.post('/deleteUser', authMiddleware, Validate([validateId('id', 'User ID')]), userController.deleteUser);
router.post('/destroyUser', authMiddleware, Validate([validateId('id', 'Role ID')]), userController.destroyUser);

module.exports = router;
