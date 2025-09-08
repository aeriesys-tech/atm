// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const apiLogger = require('./middlewares/apiLogger');
const initializeDynamicModels = require('./utils/initializeDynamicModels');
const router = require('./routes/index'); // Central route file

const app = express();

// Environment variables
const PORT = process.env.PORT || 8080;
const URL = process.env.APP_URL || 'http://192.168.0.217';

// CORS configuration 
const corsOptions = {
	origin: '*', // ⚠️ Replace with specific domains in production
	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '500mb' }))
app.use(express.urlencoded({ limit: '500mb', extended: true }))
app.use(apiLogger);

// Serve uploads directory
app.use("/uploads", express.static("uploads"));

// API routes (centralized)
app.use('/api/v1', router);

// Serve React frontend (if deployed together)
const reactPath = path.join(__dirname, '../react/dist')
app.use(express.static(reactPath))
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../react/build', 'index.html'));
// });

// Global error handler
app.use((err, req, res, next) => {
	console.error("Unhandled Error:", err.stack);
	res.status(500).json({ error: 'Internal Server Error' });
});

// Connect to MongoDB and start server
mongoose
	.connect(process.env.MONGODB_URI, {})
	.then(() => {
		console.log(" MongoDB connected successfully");
		initializeDynamicModels();
		app.listen(PORT, () => {
			console.log(` PERP Server running at ${URL}:${PORT}`);
		});
	})
	.catch((err) => {
		console.error(" MongoDB connection error:", err);
	});

module.exports = app;
