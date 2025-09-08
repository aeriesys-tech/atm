const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateId, paginateValidation } = require('../validations/commonValidation');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
const { add_role_validation, update_role_validation } = require('../validations/roleValidation');
const { Validate } = require('../middlewares/validationMiddleware');

router.post('/paginateEquipments', authMiddleware, paginateValidation(['equipment_code', 'equipment_name']), equipmentController.paginatedEquipments);
router.post('/downloadExcel', authMiddleware, equipmentController.downloadExcel);
router.post('/createEquipment', authMiddleware, equipmentController.addEquipment);
router.post('/updateEquipment', authMiddleware, equipmentController.updateEquipment);
router.post('/deleteEquipment', authMiddleware, equipmentController.deleteEquipment);
// router.post('/downloadEmptySheet', authMiddleware, equipmentController.downloadEquipmentExcel);


module.exports = router;