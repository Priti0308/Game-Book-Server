
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  srNo: { type: Number, required: true },       
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = customerSchema;  