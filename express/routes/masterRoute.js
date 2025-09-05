const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
const uploadExcelMiddleware = require('../middlewares/uploadExcelMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { dynamicTableValidation, dynamicTableUpdateValidation } = require('../validations/dynamicTableValidation');
const { add_master_validation, update_master_validation } = require('../validations/masterValidation');
const { Validate } = require('../middlewares/validationMiddleware');
const { paginateValidation, validateId } = require('../validations/commonValidation');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");

// POST route to create a new user
router.post('/dynamic-data/paginate', authMiddleware, masterController.getPaginatedDynamicData);

router.post('/createMaster', authMiddleware, add_master_validation, masterController.createMaster);
router.post('/updateMaster', authMiddleware, update_master_validation, masterController.updateMaster);

router.post('/masters/add', authMiddleware, dynamicTableValidation, masterController.insertDynamicData);
router.post('/masters/update', authMiddleware, dynamicTableUpdateValidation, masterController.updateDynamicData);
router.post('/masters/destroy', authMiddleware, masterController.destroyDynamicData);


router.post('/deleteMaster', authMiddleware, Validate([validateId('id', 'Master ID')]), masterController.deleteMaster);
router.post('/destroyMaster', authMiddleware, Validate([validateId('id', 'Master ID')]), masterController.destroyMaster);

router.post('/masterfields-delete', authMiddleware, masterController.deleteDynamicData);


router.post('/paginateMasters', authMiddleware, paginateValidation(['master_name', 'display_name_singular', 'display_name_plural']), masterController.paginatedMasters);

router.post('/getMasters', authMiddleware, masterController.getMasters);

router.post('/masters/delete', authMiddleware, masterController.deleteMaster);

router.post('/masters-update', authMiddleware, dynamicTableUpdateValidation, masterController.updateDynamicData);
router.post('/download-empty-sheet', masterController.downloadExcel);
router.post('/upload-excel', authMiddleware, uploadExcelMiddleware.single('file'), masterController.uploadExcel);
router.post('/get-masters', authMiddleware, masterController.getAllDynamicData);

module.exports = router;
