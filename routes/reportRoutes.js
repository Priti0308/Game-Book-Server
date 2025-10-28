const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddleware');

// Destructure the functions from the imported controller object
const {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary,
    getAllCustomerBalances
} = require('../controllers/reportController');

// Now use the imported functions as handlers
router.get('/summary/daily', protect, getDailySummary);
router.get('/summary/weekly', protect, getWeeklySummary);
router.get('/summary/monthly', protect, getMonthlySummary);
router.get('/customers/all-balances', protect, getAllCustomerBalances);

module.exports = router;