const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Vendor", // Links this to the Vendor who owns the customer
  },
  srNo: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // --- ADDED THIS ---
  // company: {
  //   type: String,
  //   required: [true, "Please select a company"],
  //   trim: true,
  // },
  // ------------------
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensures that for any given vendor, the contact number and srNo are unique.
customerSchema.index({ vendorId: 1, contact: 1 }, { unique: true });
customerSchema.index({ vendorId: 1, srNo: 1 }, { unique: true });

module.exports = mongoose.model("Customer", customerSchema);