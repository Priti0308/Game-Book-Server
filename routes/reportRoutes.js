const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const mongoose = require("mongoose");
const { protectVendor } = require("../middleware/authMiddleware");
const customerSchema = require("../models/Customer");
const { receiptSchema } = require("../models/Receipt");

// Helper to get models per vendor DB
const getModels = (req) => {
  if (!req.vendorDB) throw new Error("Vendor DB not available");
  const Customer = req.vendorDB.model("Customer", customerSchema);
  const Receipt = req.vendorDB.model("Receipt", receiptSchema);
  return { Customer, Receipt };
};

// --- Route 1: Get all customers (No changes needed) ---
router.get("/customers", protectVendor, async (req, res) => {
  try {
    const { Customer } = getModels(req);
    const customers = await Customer.find().sort({ srNo: 1 });
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// --- Route 2: Generate a specific customer report (This is the correct, final version) ---
router.get("/customer/:customerId", protectVendor, async (req, res) => {
  try {
    const { Receipt } = getModels(req);
    const { customerId } = req.params;
    const { period, date } = req.query;

    // Step 1: Validate inputs
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID format." });
    }
    if (!period || !date) {
      return res.status(400).json({ message: "Period and date query parameters are required." });
    }

    // Step 2: Calculate date range reliably using dayjs
    let startDate;
    let endDate;

    if (period === "daily") {
      startDate = dayjs(date).startOf('day').toDate();
      endDate = dayjs(date).endOf('day').toDate();
    } else if (period === "monthly") {
      startDate = dayjs(date).startOf('month').toDate();
      endDate = dayjs(date).endOf('month').toDate();
    } else {
      return res.status(400).json({ message: "Invalid period. Use 'daily' or 'monthly'." });
    }

    // Step 3: Build the database query using the correct customerId and date objects
    const matchQuery = {
      customerId: customerId,
      date: { $gte: startDate, $lte: endDate },
    };

    const receipts = await Receipt.find(matchQuery);

    // Step 4: Calculate total income robustly using parseFloat
    const totalIncome = receipts.reduce(
      (sum, r) =>
        sum +
        (parseFloat(r.morningIncome) || 0) +
        (parseFloat(r.eveningIncome) || 0),
      0
    );

    // Step 5: Send the final response
    res.json({ totalIncome, receipts });

  } catch (err) {
    console.error("Error fetching customer report:", err);
    res.status(500).json({ message: "Failed to fetch report" });
  }
});

module.exports = router;
