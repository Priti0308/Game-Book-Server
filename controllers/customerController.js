const Customer = require("../models/Customer");
const Counter = require("../models/Counter");

// Helper function to get the next serial number
async function getNextSequence(vendorId) {
  const counterName = `customerSrNo_${vendorId}`;
  const result = await Counter.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
}

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  try {
    // 1. Destructure the new 'company' field from the request body
    const { name, contact, email, address, company } = req.body;

    // 2. Add 'company' to the validation check
    if (!name || !contact || !company) {
      return res.status(400).json({ message: "Name, contact, and company are required." });
    }

    const vendorId = req.vendor._id;
    const srNo = await getNextSequence(vendorId);

    const customer = new Customer({
      vendorId,
      srNo,
      name,
      contact,
      email,
      address,
     
    });

    await customer.save();
    res.status(201).json({ message: "Customer added successfully", customer });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "A customer with this contact number already exists." });
    }
     if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error while adding customer." });
  }
};

// @desc    Get all customers for the vendor
// @route   GET /api/customers
// @access  Private
const getAllCustomers = async (req, res) => {
  try {
    // This query correctly fetches all fields, including 'company'
    const customers = await Customer.find({ vendorId: req.vendor._id }).sort({ srNo: 1 });
    res.json({ customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers." });
  }
};

// @desc    Update a specific customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    if (customer.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Update failed. Another customer already has this contact number." });
    }
    res.status(500).json({ message: "Failed to update customer." });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    if (customer.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Access denied." });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json({ message: "Customer deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete customer." });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
};