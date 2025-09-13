const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor");

// Vendor Registration
const registerVendor = async (req, res) => {
  try {
    const { businessName, ownerName, mobile, password, address } = req.body;

    // --- FIX: Basic input validation ---
    if (!businessName || !mobile || !password) {
      return res.status(400).json({ message: "Please provide business name, mobile, and password." });
    }

    // Check if vendor exists
    const existingVendor = await Vendor.findOne({ mobile });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor with this mobile number already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const vendor = new Vendor({
      businessName,
      ownerName,
      mobile,
      password: hashedPassword,
      address,
    });

    const savedVendor = await vendor.save();

    // --- FIX: Never send the password back, even if it's hashed ---
    const vendorData = savedVendor.toObject();
    delete vendorData.password;

    res.status(201).json({ message: "Vendor registered successfully", vendor: vendorData });
  } catch (err) {
    console.error("Vendor registration error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Vendor Login
const loginVendor = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // --- FIX: Basic input validation ---
    if (!mobile || !password) {
        return res.status(400).json({ message: "Please provide mobile and password." });
    }

    const vendor = await Vendor.findOne({ mobile });

    // --- FIX: Use a generic error message for security ---
    // This prevents attackers from knowing if a user account exists or not.
    // It checks for both vendor existence and password match in one go.
    if (!vendor || !(await bcrypt.compare(password, vendor.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // --- FIX: Add a check for the JWT secret to prevent crashes ---
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined.");
        return res.status(500).json({ message: "Server configuration error." });
    }

    const token = jwt.sign(
      { id: vendor._id, role: 'vendor' }, // Good to include role in the token
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    
    // --- FIX: Never send the password back in the login response ---
    const vendorData = vendor.toObject();
    delete vendorData.password;

    res.json({ token, vendor: vendorData });
  } catch (err) {
    console.error("Vendor login error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { registerVendor, loginVendor };