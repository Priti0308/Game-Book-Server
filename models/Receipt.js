const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  // --- Core References ---
  // Link to the Vendor who created this receipt. Essential for security.
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  // Link to the Customer this receipt is for.
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },

  // --- Snapshot Data ---
  // Store the names at the time of creation for printing historical receipts,
  // even if the original customer/vendor name changes later.
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
    default: Date.now,
  },
  day: { // Optional: Store the day of the week as a string if needed
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
  totalReceived: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  totalWithAdvance: { type: Number, default: 0 },

  // --- State Management ---
  // This field seems intended for frontend state management.
  isEditing: {
    type: Boolean,
    default: false,
  },
}, {
  // Automatically add 'createdAt' and 'updatedAt' fields
  timestamps: true,
});

// Compile the schema into a model and export it.
// This is the standard pattern for a single-database architecture.
module.exports = mongoose.model("Receipt", receiptSchema);

