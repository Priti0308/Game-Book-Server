// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcryptjs");
// const vendorController = require("../controllers/vendorController");
// const { protectVendor } = require("../middleware/authMiddleware");
// const { getVendorDb } = require("../utils/dbConnection");
// const VendorSchema = require("../models/Vendor").schema; // only schema

// // ✅ Auth routes
// router.post("/login", vendorController.loginVendor);
// router.get("/me", protectVendor, vendorController.getVendorProfile);

// // ✅ Add new vendor (vendor-specific DB only, no mainDB)
// router.post("/", async (req, res) => {
//   try {
//     const { name, businessName, mobile, email, address, password } = req.body;

//     if (!name || !businessName || !mobile || !email || !address || !password) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Each vendor DB is keyed by mobile (or UUID). Example: use mobile as dbName
//     const db = await getVendorDb(mobile);
//     const Vendor = db.models.Vendor || db.model("Vendor", VendorSchema);

//     // Check duplicates inside vendorDB
//     if (await Vendor.findOne({ mobile })) {
//       return res.status(400).json({ message: "Mobile already exists in vendor DB." });
//     }
//     if (await Vendor.findOne({ email })) {
//       return res.status(400).json({ message: "Email already exists in vendor DB." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const vendor = new Vendor({
//       name,
//       businessName,
//       mobile,
//       email,
//       address,
//       password: hashedPassword,
//       status: "pending",
//     });
//     await vendor.save();

//     res.status(201).json({ message: "Vendor added successfully", vendor });
//   } catch (error) {
//     console.error("🔥 Error adding vendor:", error);
//     res.status(500).json({ message: "Failed to add vendor" });
//   }
// });

// // ✅ Update own profile (vendorDB only)
// router.put("/me", protectVendor, async (req, res) => {
//   try {
//     const { name, businessName, mobile, email, address } = req.body;
//     if (!name || !businessName || !mobile || !email || !address) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const db = req.vendorDB;
//     const Vendor = db.models.Vendor || db.model("Vendor", VendorSchema);

//     const vendor = await Vendor.findById(req.vendor._id);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found in vendorDB" });

//     vendor.name = name;
//     vendor.businessName = businessName;
//     vendor.mobile = mobile;
//     vendor.email = email;
//     vendor.address = address;

//     await vendor.save();

//     res.json({ message: "Profile updated successfully", vendor });
//   } catch (error) {
//     console.error("🔥 Error updating vendor profile:", error);
//     res.status(500).json({ message: "Failed to update vendor profile", error: error.message });
//   }
// });

// // ✅ Delete vendor (vendorDB only)
// router.delete("/:id", async (req, res) => {
//   try {
//     const db = await getVendorDb(req.params.id); // use vendorID/dbName
//     const Vendor = db.models.Vendor || db.model("Vendor", VendorSchema);

//     const vendor = await Vendor.findByIdAndDelete(req.params.id);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });

//     res.json({ message: "Vendor deleted successfully" });
//   } catch (error) {
//     console.error("🔥 Error deleting vendor:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ Update vendor (approve/reject/update status in vendorDB only)
// router.put("/:id", async (req, res) => {
//   try {
//     const { name, businessName, mobile, email, address, status } = req.body;

//     const db = await getVendorDb(req.params.id);
//     const Vendor = db.models.Vendor || db.model("Vendor", VendorSchema);

//     const vendor = await Vendor.findById(req.params.id);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found in vendorDB" });

//     if (name) vendor.name = name;
//     if (businessName) vendor.businessName = businessName;
//     if (mobile) vendor.mobile = mobile;
//     if (email) vendor.email = email;
//     if (address) vendor.address = address;
//     if (status) vendor.status = status;

//     await vendor.save();

//     res.json({ message: "Vendor updated successfully", vendor });
//   } catch (error) {
//     console.error("🔥 Error updating vendor:", error);
//     res.status(500).json({ message: "Failed to update vendor", error: error.message });
//   }
// });

// // ✅ Change password (vendorDB only)
// router.put("/:id/password", async (req, res) => {
//   try {
//     const { password } = req.body;
//     if (!password) return res.status(400).json({ message: "Password is required" });

//     const db = await getVendorDb(req.params.id);
//     const Vendor = db.models.Vendor || db.model("Vendor", VendorSchema);

//     const vendor = await Vendor.findById(req.params.id);
//     if (!vendor) return res.status(404).json({ message: "Vendor not found" });

//     vendor.password = await bcrypt.hash(password, 10);
//     await vendor.save();

//     res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("🔥 Error changing password:", error);
//     res.status(500).json({ message: "Failed to update password" });
//   }
// });

// // ✅ Apply for vendor account
// router.post("/apply", vendorController.applyVendor);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { registerVendor, loginVendor } = require("../controllers/vendorController");

// Vendor Registration
router.post("/register", registerVendor);

// Vendor Login
router.post("/login", loginVendor);

module.exports = router;

