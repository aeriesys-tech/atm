const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateId, paginateValidation } = require('../validations/commonValidation');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
const { add_role_validation, update_role_validation } = require('../validations/roleValidation');
const { Validate } = require('../middlewares/validationMiddleware');

// POST route to create a new role group
router.post('/createRole', authMiddleware, add_role_validation, roleController.createRole);
router.post('/updateRole', authMiddleware, update_role_validation, roleController.updateRole);
router.post('/paginateRoles', authMiddleware, paginateValidation(['role_name', 'role_group_id', 'role_code']), roleController.paginatedRoles);
router.post('/getRoles', authMiddleware, roleController.getRoles);
router.post('/getRole', authMiddleware, Validate([validateId('id', 'Role ID')]), roleController.getRole);
router.post('/deleteRole', authMiddleware, Validate([validateId('id', 'Role ID')]), roleController.deleteRole);
router.post('/destroyRole', authMiddleware, Validate([validateId('id', 'Role ID')]), roleController.destroyRole);

module.exports = router;