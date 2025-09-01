//models/customer.js
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  srNo: { type: Number, required: true },       // auto-increment per vendor
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = customerSchema;  // export schema only (we'll bind model per vendor DB)
