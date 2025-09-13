const express = require("express");
const router = express.Router();

// FIX 1: Import the correct middleware function, 'protect'
const { protect } = require("../middleware/authMiddleware");

// Import the controller functions
const {
    getAllCustomersForReport,
    generateCustomerReport,
} = require("../controllers/reportController");

// FIX 2: Use the correct middleware function name
router.use(protect);

// --- Routes ---

// Route to get a list of all customers (for populating a dropdown, etc.)
router.get("/customers", getAllCustomersForReport);

// Route to generate a specific report for one customer
router.get("/customer/:customerId", generateCustomerReport);

module.exports = router;

