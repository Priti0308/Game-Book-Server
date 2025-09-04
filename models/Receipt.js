// const mongoose = require('mongoose');

// const receiptSchema = new mongoose.Schema({
//   businessName: { type: String, default: "फ्रेंडशिप" },
//   customerName: { type: String, default: "" },
//   day: { type: String, default: "" },
//   date: { type: String, default: "" },
//   morningIncome: { type: String, default: "" },
//   eveningIncome: { type: String, default: "" },
//   totalIncome: { type: String, default: "" },
//   deduction: { type: String, default: "" },
//   afterDeduction: { type: String, default: "" },
//   payment: { type: String, default: "" },
//   remainingBalance: { type: String, default: "" },
//   pendingAmount: { type: String, default: "" },
//   finalTotal: { type: String, default: "" },
//   totalReceived: { type: String, default: "" },
//   advanceAmount: { type: String, default: "" },
//   totalWithAdvance: { type: String, default: "" },
//   isEditing: { type: Boolean, default: true },
// }, { timestamps: true });

// module.exports = mongoose.model('Receipt', receiptSchema);



// class Receipt {
//   constructor({
//     businessName = "फ्रेंडशिप",
//     customerName = "",
//     day = "",
//     date = "",
//     morningIncome = "",
//     eveningIncome = "",
//     totalIncome = "",
//     deduction = "",
//     afterDeduction = "",
//     payment = "",
//     remainingBalance = "",
//     pendingAmount = "",
//     finalTotal = "",
//     totalReceived = "",
//     advanceAmount = "",
//     totalWithAdvance = "",
//     isEditing = true,
//   } = {}) {
//     this.businessName = businessName;
//     this.customerName = customerName;
//     this.day = day;
//     this.date = date;
//     this.morningIncome = morningIncome;
//     this.eveningIncome = eveningIncome;
//     this.totalIncome = totalIncome;
//     this.deduction = deduction;
//     this.afterDeduction = afterDeduction;
//     this.payment = payment;
//     this.remainingBalance = remainingBalance;
//     this.pendingAmount = pendingAmount;
//     this.finalTotal = finalTotal;
//     this.totalReceived = totalReceived;
//     this.advanceAmount = advanceAmount;
//     this.totalWithAdvance = totalWithAdvance;
//     this.isEditing = isEditing;
//   }
// }

// module.exports = Receipt;

// models/Receipt.js
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


