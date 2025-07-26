const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authMiddleware = require('../middlewares/authMiddleware');
const { Validate } = require('../middlewares/validationMiddleware');
const { validateId, paginateValidation } = require('../validations/commonValidation');
const { add_template_validation, update_template_validation } = require('../validations/templateValidation');


router.post('/paginatedTemplates', authMiddleware, paginateValidation(['template_name', 'template_type_id', 'template_code']), templateController.paginatedTemplates);
router.post('/createTemplate', authMiddleware, add_template_validation, templateController.createTemplate);
router.post('/deleteTemplate', authMiddleware, Validate([validateId('id', 'Template ID')]), templateController.deleteTemplate);
router.post('/destroyTemplate', authMiddleware, Validate([validateId('id', 'Template ID')]), templateController.destroyTemplate);
router.post('/updateTemplate', authMiddleware, update_template_validation, templateController.updateTemplate);

module.exports = router;