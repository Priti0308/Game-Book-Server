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



class Receipt {
  constructor({
    businessName = "फ्रेंडशिप",
    customerName = "",
    day = "",
    date = "",
    morningIncome = "",
    eveningIncome = "",
    totalIncome = "",
    deduction = "",
    afterDeduction = "",
    payment = "",
    remainingBalance = "",
    pendingAmount = "",
    finalTotal = "",
    totalReceived = "",
    advanceAmount = "",
    totalWithAdvance = "",
    isEditing = true,
  } = {}) {
    this.businessName = businessName;
    this.customerName = customerName;
    this.day = day;
    this.date = date;
    this.morningIncome = morningIncome;
    this.eveningIncome = eveningIncome;
    this.totalIncome = totalIncome;
    this.deduction = deduction;
    this.afterDeduction = afterDeduction;
    this.payment = payment;
    this.remainingBalance = remainingBalance;
    this.pendingAmount = pendingAmount;
    this.finalTotal = finalTotal;
    this.totalReceived = totalReceived;
    this.advanceAmount = advanceAmount;
    this.totalWithAdvance = totalWithAdvance;
    this.isEditing = isEditing;
  }
}

module.exports = Receipt;