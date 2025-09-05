const express = require('express');
const router = express.Router();
const assetMasterController = require('../controllers/assetMasterController');
const authMiddleware = require('../middlewares/authMiddleware');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');
// const { checkPermission } = require("../middlewares/permissionsMiddleware");

// POST endpoint to create a new asset
router.post('/createAssetMaster', authMiddleware, assetMasterController.addAssetMaster);
router.post('/getAssetMaster', authMiddleware, assetMasterController.getAssetMaster);
router.post('/getAssetTemplates', authMiddleware, assetMasterController.getAssetTemplates);
router.post('/assetTemplateAttributes', authMiddleware, assetMasterController.getAssetTemplatesWithAttributes);


module.exports = router;