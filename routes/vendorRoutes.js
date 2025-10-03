
const express = require("express");
const router = express.Router();

const {
  registerVendor,
  loginVendor,
  getVendorProfile,       
  updateVendorProfile,
  getAllVendors,
} = require("../controllers/vendorController");

const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllVendors);
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