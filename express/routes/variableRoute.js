const express = require('express');
const router = express.Router();
const variableController = require('../controllers/variableController');
const { editVariablesValidation, paginateBatchVariablesValidation } = require("../validations/variableValidation");
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/updateStatus', editVariablesValidation, variableController.updateStatus);
router.post('/paginateBatchVariables', paginateBatchVariablesValidation, variableController.paginateBatchVariables);
router.post('/updateVariableDetails', variableController.updateVariableDetails);

module.exports = router;