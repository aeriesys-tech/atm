const express = require('express');
const router = express.Router();
const roleGroupController = require('../controllers/roleGroupController');
// const excelMiddleware = require('../middlewares/excelMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
const { createRoleGroup, updateRoleGroup, getRoleGroup, paginatedRoleGroups, deleteRoleGroup } = require('../validations/roleGroupValidation');
// POST route to create a new role group
// router.post('/role-groups/upload', excelMiddleware.single('file'), roleGroupController.bulkCreateRoleGroups);
router.post('/createRoleGroup', authMiddleware, createRoleGroup, roleGroupController.createRoleGroup);
router.post('/updateRoleGroup', authMiddleware, updateRoleGroup, roleGroupController.updateRoleGroup);
router.post('/getRoleGroups', authMiddleware, roleGroupController.getRoleGroups);
router.post('/paginateRoleGroups', authMiddleware, roleGroupController.getPaginatedRoleGroups);
router.post('/getRoleGroup', authMiddleware, getRoleGroup, roleGroupController.getRoleGroup);
router.post('/deleteRoleGroup', authMiddleware, deleteRoleGroup, roleGroupController.deleteRoleGroup);
router.post('/destroyRoleGroup', authMiddleware, deleteRoleGroup, roleGroupController.destroyRoleGroup);

module.exports = router;