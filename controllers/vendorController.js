
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Vendor = require("../models/Vendor"); 
const { getVendorDb } = require("../utils/dbConnection"); 

// Multi-vendor login
const loginVendor = async (req, res) => {
  const { mobile, password } = req.body;

  try {
    // Step 1: Check credentials in mainDB
    const vendorMain = await Vendor.findOne({ mobile });
    if (!vendorMain) return res.status(400).json({ message: "Vendor not found in main database" });

    const isMatch = await bcrypt.compare(password, vendorMain.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Step 2: Connect to vendor-specific DB
    const db = await getVendorDb(vendorMain._id.toString());
    const VendorModel = db.model("Vendor", require("../models/Vendor").schema);

    // Step 3: Fetch vendor data from their DB
    let vendorData = await VendorModel.findOne({ mobile });
    if (!vendorData) {
  vendorData = await VendorModel.create({
    _id: vendorMain._id,  // ⚠️ use mainDB _id
    name: vendorMain.name,
    businessName: vendorMain.businessName,
    mobile: vendorMain.mobile,
    email: vendorMain.email,
    address: vendorMain.address || "",
    password: vendorMain.password,
    status: vendorMain.status
  });
}


    // Step 4: Generate JWT with DB info
    const token = jwt.sign(
      {
        id: vendorMain._id,
        dbName: vendorMain._id.toString() // middleware can use this
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      vendor: {
        id: vendorData._id,
        name: vendorData.name,
        businessName: vendorData.businessName,
        mobile: vendorData.mobile,
        email: vendorData.email,
        address: vendorData.address,
        status: vendorData.status
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get profile from vendor DB via middleware
const getVendorProfile = async (req, res) => {
  try {
    if (!req.vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ vendor: req.vendor }); // <-- wrap it
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// Apply as a new vendor (stored in mainDB)
const applyVendor = async (req, res) => {
  try {
    const { businessName, email, password } = req.body;

    // check duplicate email
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // new vendor with pending status
    const newVendor = new Vendor({
      businessName,
      email,
      password,   // ⚠️ later we’ll hash this like user password
      status: 'pending',
    });

    await newVendor.save();

    res.status(201).json({
      message: 'Application submitted. Please wait for admin approval.',
      vendorId: newVendor._id,
    });
  } catch (err) {
    console.error('Error in applyVendor:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginVendor, getVendorProfile, applyVendor };
