// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
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

// 1. Get all customers
router.get("/customers", protectVendor, async (req, res) => {
  try {
    const { Customer } = getModels(req);
    const customers = await Customer.find().sort({ srNo: 1 });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// GET daily/monthly income report for a customer
router.get("/customer/:customerId", protectVendor, async (req, res) => {
  try {
    const { Receipt, Customer } = getModels(req);
    const { customerId } = req.params;
    const { period, date } = req.query;

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    let match = { customerName: customer.name };


    if (period === "daily" && date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      match.date = { $gte: start, $lt: end };
    } else if (period === "monthly" && date) {
      const d = new Date(date);
      match.date = {
        $gte: new Date(d.getFullYear(), d.getMonth(), 1),
        $lt: new Date(d.getFullYear(), d.getMonth() + 1, 1),
      };
    }

    const receipts = await Receipt.find(match);

    // Only income
    const totalIncome = receipts.reduce(
      (sum, r) => sum + (r.morningIncome || 0) + (r.eveningIncome || 0),
      0
    );

    res.json({ customer, totalIncome });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch report" });
  }
});


module.exports = router;
