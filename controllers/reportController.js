const dayjs = require("dayjs");
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);
const mongoose = require("mongoose");

// MODIFICATION: Import the compiled models directly instead of schemas
const Customer = require("../models/Customer");
const Receipt = require("../models/Receipt"); // Make sure your Receipt model file exports the model

// REMOVED: The getModels function is no longer needed

const getAllCustomersForReport = async (req, res) => {
  try {
    // MODIFICATION: Use the imported Customer model directly
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (err) {
    console.error("Error fetching customers for report:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

const generateCustomerReport = async (req, res) => {
  try {
    const { customerId, period } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer ID format." });
    }
    if (!period || !date) {
      return res.status(400).json({ message: "Period and date are required." });
    }
    
    const parsedDate = dayjs(date, 'YYYY-MM-DD', true);
    if (!parsedDate.isValid()) {
        return res.status(400).json({ message: "Invalid date format. Please use YYYY-MM-DD." });
    }

    let startDate;
    let endDate;

    if (period === "daily") {
      startDate = parsedDate.startOf('day').toDate();
      endDate = parsedDate.endOf('day').toDate();
    } else if (period === "weekly") {
      startDate = parsedDate.startOf('week').toDate();
      endDate = parsedDate.endOf('week').toDate();
    } else {
      return res.status(400).json({ message: "Invalid period. Use 'daily' or 'weekly'." });
    }

    const matchQuery = {
      customerId: new mongoose.Types.ObjectId(customerId),
      date: { $gte: startDate, $lte: endDate },
    };

    // MODIFICATION: Use the imported Receipt model directly
    const receipts = await Receipt.find(matchQuery);

    const totalIncome = receipts.reduce((sum, r) => sum + (parseFloat(r.afterDeduction) || 0), 0);

    res.json({ totalIncome });

  } catch (err) {
    console.error(`Error in generateCustomerReport for customer ${customerId}:`, err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

module.exports = {
    getAllCustomersForReport,
    generateCustomerReport,
};