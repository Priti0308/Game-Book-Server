const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddleware');

// ... (imports)
const {
    getWeeklySummary,
    getMonthlySummary,
    getYearlySummary, // Import new function
    getAllCustomerBalances
} = require('../controllers/reportController');

// ... (other routes)
router.get('/summary/weekly', protect, getWeeklySummary);
router.get('/summary/monthly', protect, getMonthlySummary);
router.get('/summary/yearly', protect, getYearlySummary); // Add new route
router.get('/customers/all-balances', protect, getAllCustomerBalances);

module.exports = router;