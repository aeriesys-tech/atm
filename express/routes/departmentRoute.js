const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
// const excelMiddleware = require('../middlewares/excelMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
const { createDepartment, updateDepartment, getDepartment, paginatedDepartments, deleteDepartment, destroyDepartment } = require('../validations/departmentValidation');
// POST route to create a new role group
// router.post('/role-groups/upload', excelMiddleware.single('file'), roleGroupController.bulkCreateRoleGroups);
router.post('/createDepartment', authMiddleware, createDepartment, departmentController.createDepartment);
router.post('/updateDepartment', authMiddleware, updateDepartment, departmentController.updateDepartment);
router.post('/getDepartments', authMiddleware, departmentController.getDepartments);
router.post('/paginateDepartments', authMiddleware, departmentController.paginatedDepartments);
router.post('/getDepartment', authMiddleware, getDepartment, departmentController.getDepartment);
router.post('/deleteDepartment', authMiddleware, deleteDepartment, departmentController.deleteDepartment);
router.post('/destroyDepartment', authMiddleware, destroyDepartment, departmentController.destroyDepartment);

module.exports = router;