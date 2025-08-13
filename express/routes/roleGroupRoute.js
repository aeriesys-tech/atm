const express = require('express');
const router = express.Router();
const roleGroupController = require('../controllers/roleGroupController');
const authMiddleware = require('../middlewares/authMiddleware');

const { add_role_group_validation, update_role_group_validation } = require('../validations/roleGroupValidation');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');

router.post('/createRoleGroup', authMiddleware, add_role_group_validation, roleGroupController.createRoleGroup);
router.post('/updateRoleGroup', authMiddleware, update_role_group_validation, roleGroupController.updateRoleGroup);
router.post('/paginateRoleGroups', authMiddleware, paginateValidation(['role_group_name', 'role_group_code']), roleGroupController.paginatedRoleGroups);
router.post('/getRoleGroups', authMiddleware, roleGroupController.getRoleGroups);
router.post('/getRoleGroup', authMiddleware, Validate([validateId('id', 'Role group ID')]), roleGroupController.getRoleGroup);
router.post('/deleteRoleGroup', authMiddleware, Validate([validateId('id', 'Role group  ID')]), roleGroupController.deleteRoleGroup);
router.post('/destroyRoleGroup', authMiddleware, Validate([validateId('id', 'Role group ID')]), roleGroupController.destroyRoleGroup);

module.exports = router;