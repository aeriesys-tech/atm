const express = require('express');
const router = express.Router();
const masterController = require('../controllers/masterController');
// const uploadExcelMiddleware = require('../middlewares/uploadExcelMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const { dynamicTableValidation, dynamicTableUpdateValidation } = require('../validations/dynamicTableValidation');
const { createMasterValidation, updateMasterValidation } = require('../validations/masterValidation');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");

// POST route to create a new user
// router.post('/dynamic-data/:masterId/paginate', authMiddleware, masterController.getPaginatedDynamicData);

router.post('/createMaster', authMiddleware, createMasterValidation, masterController.createMaster);
router.post('/updateMaster', authMiddleware, masterController.updateMaster);

router.post('/masters/add', authMiddleware, dynamicTableValidation, masterController.insertDynamicData);
// router.post('/masters/:masterId/update/:docId', authMiddleware, dynamicTableUpdateValidation, checkPermission("masters.update"), masterController.updateDynamicData);
// router.post('/masters/:masterId/add', masterController.insertDynamicData);

router.post('/deleteMaster', authMiddleware, masterController.toggleSoftDeleteMaster);

// router.post('/masterfields-delete/:masterId/:docId', authMiddleware, checkPermission("masters.delete"), masterController.toggleSoftDeleteDynamicData);
// router.post('/restore-master/:id', masterController.restoreMaster);

router.post('/paginateMasters', authMiddleware, masterController.paginatedMasters);


// router.post('/schema-definitions', authMiddleware, checkPermission("masters.view"), masterController.getAllSchemaDefinitions);
// router.post('/collections/:masterId/data', authMiddleware, checkAnyPermission("masters.view", "templates.view"), masterController.getCollectionData);

router.post('/getMasters', authMiddleware, masterController.getMasters);

// router.post('/download-empty-sheet/:masterId', authMiddleware, checkPermission("masters.view"), masterController.downloadExcel);
// router.post('/upload-excel/:masterId', authMiddleware, uploadExcelMiddleware.single('file'), checkPermission("masters.view"), masterController.uploadExcel);

// router.post('/get-masters', // authMiddleware, checkPermission("masters.view"),
//     masterController.getAllDynamicData);

// router.post('/get-svp', // authMiddleware, checkPermission("masters.view"),
//     masterController.getSvp);

// router.post('/get-usecase', // authMiddleware, checkPermission("masters.view"),
//     masterController.getUsecase);


// router.post('/collections/:collectionName/data', masterController.getDynamicData);

module.exports = router;
