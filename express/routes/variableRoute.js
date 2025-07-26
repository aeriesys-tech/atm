const express = require('express');
const router = express.Router();
const variableController = require('../controllers/variableController');
const { editVariablesValidation, paginateBatchVariablesValidation } = require("../validations/variableValidation");
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/editVariables', editVariablesValidation, variableController.editVariables);
router.post('/paginateBatchVariables', paginateBatchVariablesValidation, variableController.paginateBatchVariables);


module.exports = router;