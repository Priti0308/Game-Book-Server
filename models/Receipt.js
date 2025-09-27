const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  // --- Core References ---
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  // --- Snapshot Data ---
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },

  // --- Date and Time ---
  date: {
    type: Date,
    required: true,
  },
  day: {
    type: String,
    trim: true,
  },

  // --- Financial Calculations ---
  morningIncome: { type: Number, default: 0 },
  eveningIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  deduction: { type: Number, default: 0 },
  afterDeduction: { type: Number, default: 0 },
  payment: { type: Number, default: 0 },
  remainingBalance: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  finalTotal: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  cuttingAmount: { type: Number, default: 0 }, // <-- ADDED
  totalWithAdvance: { type: Number, default: 0 },

  // --- Game Number Inputs ---
  morningO: { type: Number, default: 0 },   // <-- ADDED
  morningJod: { type: Number, default: 0 }, // <-- ADDED
  morningKo: { type: Number, default: 0 },  // <-- ADDED
  eveningO: { type: Number, default: 0 },   // <-- ADDED
  eveningJod: { type: Number, default: 0 }, // <-- ADDED
  eveningKo: { type: Number, default: 0 },  // <-- ADDED

}, {
  // Automatically add 'createdAt' and 'updatedAt' fields
  timestamps: true,
});

module.exports = mongoose.model("Receipt", receiptSchema);