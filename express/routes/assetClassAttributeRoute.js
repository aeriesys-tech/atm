const express = require('express');
const router = express.Router();
const assetClassAttributeController = require('../controllers/assetClassAttributeController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");

router.post('/createAssetClassAttribute', authMiddleware, assetClassAttributeController.createAssetClassAttribute);
router.post('/getAssetClassAttribute', authMiddleware, assetClassAttributeController.getAttributesByAssetId);
router.post('/deleteAssetClassAttribute', authMiddleware, assetClassAttributeController.deleteAttributeFromAsset);

module.exports = router;
