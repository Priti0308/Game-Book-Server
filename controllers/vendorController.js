const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register Vendor
const registerVendor = async (req, res) => {
  try {
    const { businessName, name, email, mobile, password, address } = req.body;

    // Check if vendor already exists
    const vendorExists = await Vendor.findOne({ mobile });
    if (vendorExists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const vendor = await Vendor.create({
      businessName,
      name,
      email,
      mobile,
      password: hashedPassword,
      address,
    });

    if (vendor) {
      const vendorData = vendor.toObject();
      delete vendorData.password;
      res.status(201).json({
        message: "Vendor registered successfully",
        vendor: vendorData,
        token: generateToken(vendor._id),
      });
    } else {
      res.status(400).json({ message: "Invalid vendor data" });
    }
  } catch (err) {
    console.error("Error registering vendor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Vendor
const loginVendor = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const vendor = await Vendor.findOne({ mobile });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const vendorData = vendor.toObject();
    delete vendorData.password;

    res.json({
      message: "Login successful",
      vendor: vendorData,
      token: generateToken(vendor._id),
    });
  } catch (err) {
    console.error("Error logging in vendor:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Vendor Profile
const getVendorProfile = async (req, res) => {
  if (req.vendor) {
    const vendorData = req.vendor.toObject();
    delete vendorData.password;
    res.json({ vendor: vendorData });
  } else {
    res.status(404).json({ message: "Vendor not found" });
  }
};

// Update Vendor Profile
const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);

    if (vendor) {
      vendor.businessName = req.body.businessName || vendor.businessName;
      vendor.name = req.body.name || vendor.name;
      vendor.email = req.body.email || vendor.email;
      vendor.mobile = req.body.mobile || vendor.mobile;
      vendor.address = req.body.address || vendor.address;

      const updatedVendor = await vendor.save();
      const vendorData = updatedVendor.toObject();
      delete vendorData.password;

      res.json({
        message: "Profile updated successfully",
        vendor: vendorData,
      });
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (err) {
    console.error("Error updating vendor profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
};
