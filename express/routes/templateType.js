const express = require('express');
const router = express.Router();
const templateTypeController = require('../controllers/templateTypeController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkPermission, checkAnyPermission } = require("../middlewares/permissionsMiddleware");
// Route for creating a new TemplateType
router.post('/createTemplateType', authMiddleware, templateTypeController.createTemplateType);
router.post('/updateTemplateType', authMiddleware, templateTypeController.updateTemplateType);
router.post('/paginatedTemplateTypes', authMiddleware, templateTypeController.paginatedTemplateTypes);
router.post('/getTemplateTypes', authMiddleware, templateTypeController.getTemplateTypes);
router.post('/getTemplateType', authMiddleware, templateTypeController.getTemplateType);
router.post('/deleteTemplateType', authMiddleware, templateTypeController.deleteTemplateType);
// router.post('/template-type-master/:template_type_id', authMiddleware, templateTypeController.getTemplateTypeMaster);
// router.post('/template-by-type/', authMiddleware, templateTypeController.getAllTemplatesByTypes);

module.exports = router;