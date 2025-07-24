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

module.exports = router;
