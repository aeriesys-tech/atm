const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const authMiddleware = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/multerMiddleware');
const { createBatchValidation, updateBatchValidation, deleteBatchValidation, viewBatchValidation, uploadExcelValidation } = require('../validations/batchValidation');
const { Validate } = require('../middlewares/validationMiddleware');
const { validateId } = require('../validations/commonValidation');
const uploadExcelMiddleware = require('../middlewares/uploadExcelMiddleware');

router.post('/createBatch', upload.single('upload'), createBatchValidation, batchController.createBatch);
router.post('/updateBatch', upload.single('upload'), updateBatchValidation, batchController.updateBatch);
router.post('/deleteBatch', Validate([validateId('batch_id', 'Batch ID')]), batchController.deleteBatch);
router.post('/viewBatch', Validate([validateId('batch_id', 'Batch ID')]), batchController.viewBatch);
router.post('/getBatches', batchController.getBatches);
router.post('/uploadExcel', uploadExcelMiddleware.single('file'), uploadExcelValidation, batchController.uploadExcel);
router.post('/paginateBatches', batchController.paginateBatches);

module.exports = router;
