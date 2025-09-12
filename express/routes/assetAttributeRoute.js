const express = require('express');
const router = express.Router();
const assetAttributeController = require('../controllers/assetAttributeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateId, paginateValidation } = require('../validations/commonValidation');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
const { add_asset_attribute_validation, update_asset_attribute_validation } = require('../validations/assetAttributeValidation');
const { Validate } = require('../middlewares/validationMiddleware');


router.post('/createAssetAttribute', authMiddleware, add_asset_attribute_validation, assetAttributeController.createAssetAttribute);
router.post('/updateAssetAttribute', authMiddleware, update_asset_attribute_validation, assetAttributeController.updateAssetAttribute);
router.post('/paginateAssetAttributes', authMiddleware, paginateValidation(['field_name', 'display_name', 'field_type', 'created_at', '_id']), assetAttributeController.paginatedAssetAttributes);
router.post('/getAssetAttributes', authMiddleware, assetAttributeController.getAllAssetAttributes);
router.post('/getAssetAttribute', authMiddleware, Validate([validateId('id', 'Asset Attribute ID')]), assetAttributeController.getAllAssetAttributes);
router.post('/deleteAssetAttribute', authMiddleware, Validate([validateId('id', 'Asset Attribute ID')]), assetAttributeController.toggleSoftDeleteAssetAttribute);
router.post('/destroyAssetAttribute', authMiddleware, Validate([validateId('id', 'Asset Attribute ID')]), assetAttributeController.destroyAssetAttribute);

module.exports = router;