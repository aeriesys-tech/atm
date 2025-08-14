const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const authMiddleware = require('../middlewares/authMiddleware');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');
// const { checkPermission } = require("../middlewares/permissionsMiddleware");

// POST endpoint to create a new asset
router.post('/paginateAssets', authMiddleware, paginateValidation(['asset_name', 'asset_code']), assetController.paginatedAssets);
router.post('/createAsset', authMiddleware, assetController.addAsset);
router.post('/updateAsset', authMiddleware, assetController.updateAsset);
router.post('/getAssets', authMiddleware, assetController.getAllAssets);
router.post('/getAsset', authMiddleware, Validate([validateId('id', 'Asset ID')]), assetController.getAssetById);
router.post('/deleteAsset', authMiddleware, Validate([validateId('id', 'Asset ID')]), assetController.deleteAsset);
router.post('/destroyAsset', authMiddleware, Validate([validateId('id', 'Asset ID')]), assetController.destroyAsset);

module.exports = router;