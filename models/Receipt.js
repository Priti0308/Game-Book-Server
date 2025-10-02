const mongoose = require("mongoose");

// Defines the structure for each object inside the `gameRows` array
const gameRowSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    type: { type: String, trim: true },
    income: { type: String, default: '0' },
    o: { type: String, default: '0' },
    jod: { type: String, default: '0' },
    ko: { type: String, default: '0' },
    pan: { type: String, trim: true },
    gun: { type: String, trim: true },
    multiplier: { type: Number } // This is new, for row-specific multipliers
}, { _id: false });

// Defines the structure for the Open/Close/Jod values
const openCloseSchema = new mongoose.Schema({
    open: { type: String, trim: true },
    close: { type: String, trim: true }, // Changed from close1/close2
    jod: { type: String, trim: true }     // New field
}, { _id: false });

const receiptSchema = new mongoose.Schema({
    // --- Core References ---
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Correctly referencing the User model
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
    customerCompany: { type: String, trim: true },

    // --- Date and Time ---
    date: { type: Date, required: true },
    day: { type: String, trim: true },

    // --- Dynamic Data Structures ---
    gameRows: [gameRowSchema],
    openCloseValues: openCloseSchema,

    // --- Financial Calculations (Sent from Frontend) ---
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
    jama: { type: Number, default: 0 },
    jamaTotal: { type: Number, default: 0 },
    oFinalTotal: { type: Number, default: 0 },
    jodFinalTotal: { type: Number, default: 0 },
    koFinalTotal: { type: Number, default: 0 },

}, {
    timestamps: true, // Automatically add 'createdAt' and 'updatedAt' fields
});

module.exports = mongoose.model("Receipt", receiptSchema);

