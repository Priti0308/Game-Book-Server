
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Vendor = require("../models/Vendor"); 
const vendorController = require("../controllers/vendorController"); 
const { protectVendor } = require("../middleware/authMiddleware");

// ✅ Auth routes
router.post("/login", vendorController.loginVendor);
router.get("/me", protectVendor, vendorController.getVendorProfile);

// ✅ Get all vendors (mainDB)
router.get("/", async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Add new vendor (mainDB)
router.post("/", async (req, res) => {
  try {
    const { name, businessName, mobile, email, address, password } = req.body;

    if (!name || !businessName || !mobile || !email || !address || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check duplicates
    if (await Vendor.findOne({ mobile })) {
      return res.status(400).json({ message: "Mobile already exists." });
    }
    if (await Vendor.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = new Vendor({ name, businessName, mobile, email, address, password: hashedPassword });
    await vendor.save();

    res.status(201).json({ message: "Vendor added successfully", vendor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add vendor" });
  }
});

// ✅ Update own profile with detailed logging

// Update own profile (mainDB)
router.put("/me", protectVendor, async (req, res) => {
  try {
    const { name, businessName, mobile, email, address } = req.body;

    if (!name || !businessName || !mobile || !email || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const vendor = await Vendor.findById(req.vendor._id); // ✅ mainDB
    if (!vendor) return res.status(404).json({ message: "Vendor not found in mainDB" });

    vendor.name = name;
    vendor.businessName = businessName;
    vendor.mobile = mobile;
    vendor.email = email;
    vendor.address = address;

    await vendor.save();

    res.json({ message: "Profile updated successfully", vendor });
  } catch (error) {
    console.error("🔥 Error updating vendor profile:", error);
    res.status(500).json({ message: "Failed to update vendor profile", error: error.message });
  }
});
// ✅ Delete vendor
router.delete("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Approve / Reject / Update vendor (mainDB)
router.put("/:id", async (req, res) => {
  try {
    const { name, businessName, mobile, email, address, status } = req.body;

    const vendor = await Vendor.findById(req.params.id); // mainDB
    if (!vendor) return res.status(404).json({ message: "Vendor not found in mainDB" });

    if (name) vendor.name = name;
    if (businessName) vendor.businessName = businessName;
    if (mobile) vendor.mobile = mobile;
    if (email) vendor.email = email;
    if (address) vendor.address = address;
    if (status) vendor.status = status;

    await vendor.save();

    console.log("MainDB vendor updated successfully");
    res.json({ message: "Vendor updated successfully", vendor });
  } catch (error) {
    console.error("🔥 Error updating mainDB vendor:", error);
    res.status(500).json({ message: "Failed to update vendor", error: error.message });
  }
});


// ✅ Change password
router.put("/:id/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });

    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.password = await bcrypt.hash(password, 10);
    await vendor.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update password" });
  }
});

// ✅ Apply for vendor account (mainDB)
router.post("/apply", vendorController.applyVendor);

module.exports = router;
