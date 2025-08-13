const express = require('express');
const router = express.Router();
const assetAttributeController = require('../controllers/assetAttributeController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateId, paginateValidation } = require('../validations/commonValidation');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
// const { add_role_validation, update_role_validation } = require('../validations/roleValidation');
const { Validate } = require('../middlewares/validationMiddleware');


router.post('/updateAssetAttribute', authMiddleware, assetAttributeController.updateAssetAttribute);
router.post('/createAssetAttribute', authMiddleware, assetAttributeController.createAssetAttribute);
router.post('/paginateAssetAttributes', authMiddleware, paginateValidation(['field_name', 'display_name']), assetAttributeController.paginatedAssetAttributes);
router.post('/getAssetAttributes', authMiddleware, assetAttributeController.getAllAssetAttributes);
router.post('/getAssetAttribute', authMiddleware, Validate([validateId('id', 'Asset Attribute ID')]), assetAttributeController.getAllAssetAttributes);
router.post('/deleteAssetAttribute', authMiddleware, Validate([validateId('id', 'Asset Attribute ID')]), assetAttributeController.toggleSoftDeleteAssetAttribute);
router.post('/destroyAssetAttribute', authMiddleware, Validate([validateId('id', 'Asset Attribute ID')]), assetAttributeController.destroyAssetAttribute);

module.exports = router;