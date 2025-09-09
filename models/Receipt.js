
const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  // businessName: { type: String, default: "फ्रेंडशिप" },
  // customerName: { type: String, default: "" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
businessName: { type: String, required: true }, // snapshot for print
customerName: { type: String, required: true }, // snapshot for print

  day: { type: String, default: "" },
  date: { type: Date },
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
  isEditing: { type: Boolean, default: true },
}, { timestamps: true });

const Receipt = mongoose.model("Receipt", receiptSchema);

module.exports = {
  Receipt,
  receiptSchema
};


