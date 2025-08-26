const express = require('express');
const router = express.Router();
const assetMasterController = require('../controllers/assetMasterController');
const authMiddleware = require('../middlewares/authMiddleware');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');
// const { checkPermission } = require("../middlewares/permissionsMiddleware");

// POST endpoint to create a new asset
router.post('/assetMaster/create', authMiddleware, assetMasterController.addAssetMaster);
router.post('/getAssetMaster', authMiddleware, assetMasterController.getAssetMaster);

module.exports = router;