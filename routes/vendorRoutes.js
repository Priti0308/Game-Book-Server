// vendorRoutes.js

const express = require("express");
const router = express.Router();

const {
  registerVendor,
  loginVendor,
  getVendorProfile,       // <-- This is the handler you want
  updateVendorProfile,
} = require("../controllers/vendorController");

const { protect } = require("../middleware/authMiddleware");

// Public Routes
router.post("/register", registerVendor);
router.post("/login", loginVendor);

// --- CORRECTED PRIVATE ROUTES ---
// Remove the duplicate router.get('/me', ...)
// This single block now handles GET and PUT for the /me route
router.route("/me")
  .get(protect, getVendorProfile)
  .put(protect, updateVendorProfile);

module.exports = router;