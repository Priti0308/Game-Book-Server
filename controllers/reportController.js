const dayjs = require("dayjs");
const mongoose = require("mongoose");
const customerSchema = require("../models/Customer");
const { receiptSchema } = require("../models/Receipt");

const getModels = (req) => {
  if (!req.vendorDB) {
    throw new Error("Vendor database connection is not available on the request object.");
  }
  const Customer = req.vendorDB.model("Customer", customerSchema);
  const Receipt = req.vendorDB.model("Receipt", receiptSchema);
  return { Customer, Receipt };
};

const getAllCustomersForReport = async (req, res) => {
  try {
    const { Customer } = getModels(req);
    const customers = await Customer.find().sort({ name: 1 }); // Sorting by name is usually better
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers for report:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

const generateCustomerReport = async (req, res) => {
  try {
    const { Receipt } = getModels(req);
    // MODIFIED: Get customerId and period from params
    const { customerId, period } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID format." });
    }
    if (!period || !date) {
      return res.status(400).json({ message: "Period in URL path and date in query are required." });
    }

    let startDate;
    let endDate;

    if (period === "daily") {
      startDate = dayjs(date).startOf('day').toDate();
      endDate = dayjs(date).endOf('day').toDate();
    } else if (period === "weekly") { // MODIFIED: Added weekly logic
      startDate = dayjs(date).startOf('week').toDate();
      endDate = dayjs(date).endOf('week').toDate();
    } else {
      return res.status(400).json({ message: "Invalid period. Use 'daily' or 'weekly'." });
    }

    const matchQuery = {
      customerId: new mongoose.Types.ObjectId(customerId),
      date: { $gte: startDate, $lte: endDate },
    };

    const receipts = await Receipt.find(matchQuery);

    // Assuming your receipt model uses 'afterDeduction' for this calculation
    const totalIncome = receipts.reduce((sum, r) => sum + (parseFloat(r.afterDeduction) || 0), 0);

    // MODIFIED: Send the response in the simple format the frontend expects
    res.json({ totalIncome });

  } catch (err) {
    console.error("Error generating customer report:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

module.exports = {
    getAllCustomersForReport,
    generateCustomerReport,
};