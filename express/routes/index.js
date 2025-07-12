// routes/index.js
const express = require('express');
const router = express.Router();

const authRoute = require('./authRoute');
const userRoute = require('./userRoute');
const roleRoute = require('./roleRoute');
const roleGroupRoute = require('./roleGroupRoute');

// ✅ Use router, NOT app
router.use('/', authRoute);   // /api/v1/auth/*
router.use('/users', userRoute);  // /api/v1/users/*
router.use('/roles', roleRoute);  // /api/v1/users/*
router.use('/role-groups', roleGroupRoute);  // /api/v1/users/*

module.exports = router;
