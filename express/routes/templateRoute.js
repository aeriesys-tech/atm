const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/paginatedTemplates', authMiddleware, templateController.paginatedTemplates);

module.exports = router;