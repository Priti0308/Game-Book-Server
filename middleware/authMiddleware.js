const jwt = require("jsonwebtoken");
const { getVendorDb } = require("../utils/dbConnection");
const Vendor = require("../models/Vendor"); // mainDB Vendor model

const protectVendor = async (req, res, next) => {
  let token;

  // 🔻 Log incoming header
  console.log("🔐 Incoming Authorization Header:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 🔻 Log extracted token
      console.log("🔍 Extracted Token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔻 Log decoded token payload
      console.log("🧾 Decoded Token Payload:", decoded);

      // ✅ vendor always from mainDB
      const vendor = await Vendor.findById(decoded.id).select("-password");

      // 🔻 Log vendor info
      console.log("🏢 Vendor from mainDB:", vendor?._id, vendor?.businessName);

      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      // ✅ vendorDB only for business data
      const db = await getVendorDb(decoded.id.toString());

      // 🔻 Log vendor DB status
      console.log("📦 Vendor DB connected:", !!db);

      req.vendor = vendor;
      req.vendorDB = db;

      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    console.warn("⚠️ No Authorization header or Bearer token");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protectVendor };
