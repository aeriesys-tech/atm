// routes/index.js
const express = require('express');
const router = express.Router();

const authRoute = require('./authRoute');
const userRoute = require('./userRoute');
const roleRoute = require('./roleRoute');
const roleGroupRoute = require('./roleGroupRoute');
const departmentRoute = require("./departmentRoute");
const parameterTypeRoute = require("./parameterTypeRoute");
const masterRoute = require("./masterRoute");
const notificationRoute = require('./notificationRoute');
const templateTypeRoute = require('./templateTypeRoute');
const templateRoute = require('./templateRoute');
const templateMasterRoute = require('./templateMasterRoute');
const batchRoute = require('./batchRoute');
const variableRoute = require('./variableRoute');
const assetAttributeRoute = require('./assetAttributeRoute');
const dataSourceConfigurationRoute = require('./dataSourceConfigurationRoute');
const assetRoute = require('./assetRoute');
const specificationRoute = require('./specificationRoute');
const assetConfigurationRoute = require('./assetConfigurationRoute')


router.use('/', authRoute);
router.use('/users', userRoute);
router.use('/roles', roleRoute);
router.use('/role-groups', roleGroupRoute);
router.use('/departments', departmentRoute);
router.use('/parameter-types', parameterTypeRoute);
router.use('/masters', masterRoute);
router.use('/notifications', notificationRoute);
router.use('/template-types', templateTypeRoute);
router.use('/templates', templateRoute);
router.use('/template-masters', templateMasterRoute);
router.use('/batch', batchRoute);
router.use('/variable', variableRoute);
router.use('/asset-attributes', assetAttributeRoute);
router.use('/data-source-configurations', dataSourceConfigurationRoute);
router.use('/assets', assetRoute);
router.use('/specifications', specificationRoute);
router.use('/asset-configurations', assetConfigurationRoute);

module.exports = router;
