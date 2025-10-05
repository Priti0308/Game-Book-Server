const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { generateCustomerReport } = require("../controllers/reportController");

// Apply authentication middleware to all routes in this file
router.use(protect);

// --- Routes ---

// MODIFIED: This route now correctly matches the frontend request
// e.g., GET /api/reports/60d...a1/daily?date=2025-10-05
router.get("/:customerId/:period", generateCustomerReport);

module.exports = router;