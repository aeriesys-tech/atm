// routes/index.js
const express = require('express');
const router = express.Router();

const authRoute = require('./authRoute');
const userRoute = require('./userRoute');

// ✅ Use router, NOT app
router.use('/', authRoute);   // /api/v1/auth/*
router.use('/users', userRoute);  // /api/v1/users/*

module.exports = router;
