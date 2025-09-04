//routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const { protectVendor } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const CustomerSchema = require("../models/Customer");

// Helper to get model per vendor DB
const getCustomerModel = (req) => {
  if (!req.vendorDB) throw new Error("Vendor DB not available");
  return req.vendorDB.model("Customer", CustomerSchema);
};

// GET all customers
router.get("/", protectVendor, async (req, res) => {
  try {
    const Customer = getCustomerModel(req);
    const customers = await Customer.find().sort({ srNo: 1 });
    res.json({ customers }); // frontend will do res.data.customers

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// POST add new customer
router.post("/", protectVendor, async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;
    if (!name || !contact) return res.status(400).json({ message: "Name and contact required" });

    const Customer = getCustomerModel(req);

    // Auto-increment Sr No
    const lastCustomer = await Customer.findOne().sort({ srNo: -1 });
    const srNo = lastCustomer ? lastCustomer.srNo + 1 : 1;

    const customer = new Customer({ srNo, name, contact, email, address });
    await customer.save();

    res.status(201).json({ message: "Customer added", customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add customer" });
  }
});
// PUT update customer
router.put("/:id", protectVendor, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email, address } = req.body;

    const Customer = getCustomerModel(req);
    const customer = await Customer.findById(id);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Update fields
    customer.name = name || customer.name;
    customer.contact = contact || customer.contact;
    customer.email = email || customer.email;
    customer.address = address || customer.address;

    await customer.save();

    res.json({ message: "Customer updated", customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update customer" });
  }
});

// DELETE a customer
router.delete("/:id", protectVendor, async (req, res) => {
  try {
    const { id } = req.params;

    const Customer = getCustomerModel(req);
    const customer = await Customer.findById(id);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    await customer.remove();

    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
});

module.exports = router;
