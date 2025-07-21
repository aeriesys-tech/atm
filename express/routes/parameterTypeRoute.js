const express = require('express');
const router = express.Router();
const parameterTypeController = require('../controllers/parameterTypeController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
const { createParameterType, updateParameterType, getParameterType, paginatedParameterTypes, deleteParameterType } = require('../validations/parameterTypeValidation');

// POST route to create a new role group
router.post('/createParameterType', authMiddleware, createParameterType, parameterTypeController.createParameterType);
router.post('/updateParameterType', authMiddleware, updateParameterType, parameterTypeController.updateParameterType);
router.post('/paginateParameterTypes', authMiddleware, paginatedParameterTypes, parameterTypeController.paginatedParameterTypes);
router.post('/getParameterTypes', authMiddleware, parameterTypeController.getParameterTypes);
router.post('/getParameterType', authMiddleware, getParameterType, parameterTypeController.getParameterType);
router.post('/deleteParameterType', authMiddleware, deleteParameterType, parameterTypeController.deleteParameterType);



module.exports = router;