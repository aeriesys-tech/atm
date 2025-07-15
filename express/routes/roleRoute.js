const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
const { createRole, updateRole, getRole, paginatedRoles, deleteRole, destroyRole } = require('../validations/roleValidation');

// POST route to create a new role group
router.post('/createRole', authMiddleware, createRole, roleController.createRole);
router.post('/updateRole', authMiddleware, updateRole, roleController.updateRole);
router.post('/paginateRoles', authMiddleware, paginatedRoles, roleController.paginatedRoles);
router.post('/getRoles', authMiddleware, roleController.getRoles);
router.post('/getRole', authMiddleware, getRole, roleController.getRole);
router.post('/deleteRole', authMiddleware, deleteRole, roleController.deleteRole);
router.post('/destroyRole', authMiddleware, roleController.destroyRole);


module.exports = router;