const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

router.get('/receipt', receiptController.getReceipt);
router.post('/receipt', receiptController.saveReceipt);
router.post('/generate-pdf', receiptController.generatePDF);

module.exports = router;