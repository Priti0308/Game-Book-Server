const dayjs = require("dayjs");
const mongoose = require("mongoose");
const customerSchema = require("../models/Customer");
const { receiptSchema } = require("../models/Receipt");

// Helper to get models from the correct vendor-specific database connection
const getModels = (req) => {
  if (!req.vendorDB) {
    throw new Error("Vendor database connection is not available on the request object.");
  }
  const Customer = req.vendorDB.model("Customer", customerSchema);
  const Receipt = req.vendorDB.model("Receipt", receiptSchema);
  return { Customer, Receipt };
};

// @desc    Get all customers for reporting purposes
// @route   GET /api/reports/customers
// @access  Private
const getAllCustomersForReport = async (req, res) => {
  try {
    const { Customer } = getModels(req);
    const customers = await Customer.find().sort({ srNo: 1 });
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers for report:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

// @desc    Generate a detailed report for a specific customer
// @route   GET /api/reports/customer/:customerId
// @access  Private
const generateCustomerReport = async (req, res) => {
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

    // Step 3: Build the database query
    const matchQuery = {
      customerId: new mongoose.Types.ObjectId(customerId),
      date: { $gte: startDate, $lte: endDate },
    };

    const receipts = await Receipt.find(matchQuery).sort({ date: -1 });

    // Step 4: Calculate total income robustly
    const totalIncome = receipts.reduce(
      (sum, r) =>
        sum +
        (parseFloat(r.morningIncome) || 0) +
        (parseFloat(r.eveningIncome) || 0),
      0
    );

    // Step 5: Send the final response in a format the frontend expects
    res.json({ summary: { totalIncome }, receipts });

  } catch (err) {
    console.error("Error generating customer report:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

module.exports = {
    getAllCustomersForReport,
    generateCustomerReport,
};
