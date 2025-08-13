const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middlewares/authMiddleware');

const { add_department_validation, update_department_validation } = require('../validations/departmentValidation');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');

router.post('/createDepartment', authMiddleware, add_department_validation, departmentController.createDepartment);
router.post('/updateDepartment', authMiddleware, update_department_validation, departmentController.updateDepartment);
router.post('/paginateDepartments', authMiddleware, paginateValidation(['department_name', 'department_code']), departmentController.paginatedDepartments);
router.post('/getDepartments', authMiddleware, departmentController.getDepartments);
router.post('/getDepartment', authMiddleware, Validate([validateId('id', 'Department ID')]), departmentController.getDepartment);
router.post('/deleteDepartment', authMiddleware, Validate([validateId('id', 'Department  ID')]), departmentController.deleteDepartment);
router.post('/destroyDepartment', authMiddleware, Validate([validateId('id', 'Department ID')]), departmentController.destroyDepartment);

module.exports = router;