const jwt = require("jsonwebtoken");
const { getVendorDb } = require("../utils/dbConnection");
const { VendorSchema } = require("../models/Vendor");

const protectVendor = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Connect to vendor DB
      const db = await getVendorDb(decoded.dbName);
      const Vendor = db.models.Vendor || db.model("Vendor", VendorSchema);

      const vendor = await Vendor.findById(decoded.id).select("-password");
      if (!vendor) return res.status(404).json({ message: "Vendor not found in vendorDB" });

      req.vendor = vendor;
      req.vendorDB = db;
      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("🔥 Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed", error: error.message });
  }
};

module.exports = { protectVendor };
