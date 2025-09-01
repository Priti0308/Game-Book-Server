const jwt = require("jsonwebtoken");
const { getVendorDb } = require("../utils/dbConnection");
const Vendor = require("../models/Vendor"); // mainDB Vendor model

const protectVendor = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ vendor always from mainDB
      const vendor = await Vendor.findById(decoded.id).select("-password");
      if (!vendor) return res.status(404).json({ message: "Vendor not found" });

      // ✅ vendorDB only for business data
      const db = await getVendorDb(decoded.id.toString());

      req.vendor = vendor;
      req.vendorDB = db;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protectVendor };
