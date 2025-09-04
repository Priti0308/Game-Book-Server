//routes/receiptRoutes
// const express = require('express');
// const router = express.Router();
// const receiptController = require('../controllers/receiptController');

// router.get('/receipt', receiptController.getReceipt);
// router.post('/receipt', receiptController.saveReceipt);
// router.post('/generate-pdf', receiptController.generatePDF);

// module.exports = router;

const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

const { protectVendor } = require('../middleware/authMiddleware');

router.get('/receipt', protectVendor, receiptController.getReceipt);
router.post('/receipt', protectVendor, receiptController.saveReceipt);
router.post('/generate-pdf', protectVendor, receiptController.generatePDF);

module.exports = router;