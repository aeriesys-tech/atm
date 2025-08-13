const express = require('express');
const router = express.Router();
const dataSourceConfigurationController = require('../controllers/dataSourceConfigurationController');
const authMiddleware = require('../middlewares/authMiddleware');

const { add_data_source_configuration_validation, update_data_source_validation } = require('../validations/dataSourceConfigurationValidation');
const { paginateValidation, validateId } = require('../validations/commonValidation');
const { Validate } = require('../middlewares/validationMiddleware');

router.post('/createDataSourceConfiguration', add_data_source_configuration_validation, dataSourceConfigurationController.createDataSourceConfiguration);
router.post('/updateDataSourceConfiguration', update_data_source_validation, dataSourceConfigurationController.updateDataSourceConfiguration);
router.post('/paginateDataSourceConfigurations', paginateValidation(['data_source']), dataSourceConfigurationController.paginatedDataSourceConfigurations);
router.post('/getDataSourceConfiguration', dataSourceConfigurationController.getDataSourceConfiguration);
router.post('/getDataSourceConfigurations', Validate([validateId('id', 'Data Source Configuration ID')]), dataSourceConfigurationController.getDataSourceConfigurations);
router.post('/deleteDataSourceConfigurations', Validate([validateId('id', 'Data Source Configuration ID')]), dataSourceConfigurationController.deleteDataSourceConfiguration);
router.post('/destroyDataSourceConfigurations', Validate([validateId('id', 'Data Source Configuration ID')]), dataSourceConfigurationController.destroyDataSourceConfiguration);

module.exports = router;