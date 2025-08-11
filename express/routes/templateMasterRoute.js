const express = require('express');
const router = express.Router();
const templateMasterController = require('../controllers/templateMasterController');
const authMiddleware = require('../middlewares/authMiddleware');
const { add_template_master_validation } = require('../validations/templateMasterValidation');

router.post('/createTemplateMaster', authMiddleware, add_template_master_validation, templateMasterController.createTemplateMaster);

module.exports = router;