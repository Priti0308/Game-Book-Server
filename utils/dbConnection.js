// utils/dbConnection.js
const mongoose = require("mongoose");

const connections = {}; // cache vendor DB connections

/**
 * Get or create a Mongoose connection for a vendor
 * @param {string} vendorId - The vendor identifier (used as DB name)
 */
const getVendorDb = async (vendorId) => {
  if (!vendorId) throw new Error("Vendor ID is required to connect to DB");

  // If already connected, reuse it
  if (connections[vendorId]) {
    return connections[vendorId];
  }

  // Create new connection
  const uri = `${process.env.MONGO_URI}${vendorId}?retryWrites=true&w=majority`;

  try {
  const connection = await mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connections[vendorId] = connection;
  console.log(`✅ Connected to vendor DB: ${vendorId}`);
  return connection;
} catch (err) {
  console.error(`❌ Error connecting to vendor DB: ${vendorId}`, err);
  throw err;
}

};

module.exports = { getVendorDb };
