const mongoose = require("mongoose");

// Defines the structure for each object inside the `gameRows` array
const gameRowSchema = new mongoose.Schema({
    type: { type: String, trim: true },
    income: { type: Number, default: 0 },
    o: { type: Number, default: 0 },
    jod: { type: Number, default: 0 },
    ko: { type: Number, default: 0 },
    pan: { type: String, trim: true },
    gun: { type: String, trim: true }
}, { _id: false }); // No separate _id for each row

// Defines the structure for the new Open/Close values
const openCloseSchema = new mongoose.Schema({
    open: { type: String, trim: true },
    close1: { type: String, trim: true },
    close2: { type: String, trim: true }
}, { _id: false });

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
    businessName: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerCompany: { type: String, trim: true }, // Added field

    // --- Date and Time ---
    date: { type: Date, required: true },
    day: { type: String, trim: true },

    // --- NEW DYNAMIC DATA STRUCTURES ---
    gameRows: [gameRowSchema],
    openCloseValues: openCloseSchema,

    // --- Financial Calculations (Sent from Frontend) ---
    // Note: The old fixed fields like 'morningIncome' are removed.
    totalIncome: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    afterDeduction: { type: Number, default: 0 },
    payment: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    finalTotal: { type: Number, default: 0 },
    advanceAmount: { type: Number, default: 0 },
    cuttingAmount: { type: Number, default: 0 },
    totalWithAdvance: { type: Number, default: 0 },

}, {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' fields
});

module.exports = mongoose.model("Receipt", receiptSchema);