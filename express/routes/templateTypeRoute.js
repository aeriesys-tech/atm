<<<<<<< HEAD
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

router.post('/getAllTemplateTypes', authMiddleware, templateTypeController.getAllTemplateTypes);
router.post('/templateTypeMaster', authMiddleware, templateTypeController.getTemplateTypeMaster);
// router.post('/template-type-master/:template_type_id', authMiddleware, templateTypeController.getTemplateTypeMaster);
router.post('/template-by-type', authMiddleware, templateTypeController.getAllTemplatesByTypes);

=======
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

router.post('/getAllTemplateTypes', authMiddleware, templateTypeController.getAllTemplateTypes);
router.post('/templateTypeMaster', authMiddleware, templateTypeController.getTemplateTypeMaster);
// router.post('/template-type-master/:template_type_id', authMiddleware, templateTypeController.getTemplateTypeMaster);
// router.post('/template-by-type/', authMiddleware, templateTypeController.getAllTemplatesByTypes);

>>>>>>> 9e3eb391741df0227a5acc9af9a7fe891d84837a
module.exports = router;