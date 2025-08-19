const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const specificationController = require('../controllers/specificationController');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');
const { add_specification_validation, update_specification_validation } = require('../validations/specificationValidation')
// const { checkPermission } = require("../middlewares/permissionsMiddleware");

// POST route to create a new specification group
router.post('/createSpecification', authMiddleware, add_specification_validation, specificationController.createSpecification);
router.post('/updateSpecification', authMiddleware, update_specification_validation, specificationController.updateSpecification);
router.post('/paginateSpecifications', authMiddleware, paginateValidation(['field_name', 'field_type', 'display_name']), specificationController.paginatedSpecifications);
router.post('/getSpecifications', authMiddleware, specificationController.getSpecifications);
router.post('/getSpecification', authMiddleware, Validate([validateId('id', 'Specification ID')]), specificationController.getSpecification);
router.post('/deleteSpecification', authMiddleware, Validate([validateId('id', 'Specification ID')]), specificationController.deleteSpecification);

module.exports = router;
