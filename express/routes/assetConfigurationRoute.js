const express = require('express');
const router = express.Router();
const assetConfigurationController = require('../controllers/assetConfigurationController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");

router.post('/upsertConfiguration', authMiddleware, assetConfigurationController.upsertConfiguration);
router.post('/getAssetConfiguration', authMiddleware, assetConfigurationController.getAssetConfiguration);

module.exports = router;
