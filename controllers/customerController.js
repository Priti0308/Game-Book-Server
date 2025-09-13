const Customer = require("../models/Customer");
const Counter = require("../models/Counter");

/**
 * Helper function to atomically get the next serial number for a given vendor.
 * This prevents race conditions where two customers might get the same srNo.
 * @param {string} vendorId - The ID of the vendor.
 * @returns {Promise<number>} The next unique serial number.
 */
async function getNextSequence(vendorId) {
  const counterName = `customerSrNo_${vendorId}`;
  const result = await Counter.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Increment sequence, or create counter if it doesn't exist
  );
  return result.seq;
}

// @desc    Create a new customer for the logged-in vendor
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;
    if (!name || !contact) {
      return res.status(400).json({ message: "Name and contact are required." });
    }

    const vendorId = req.vendor._id; // Get vendor ID from middleware
    const srNo = await getNextSequence(vendorId);

    const customer = new Customer({
      vendorId, // Link customer to the logged-in vendor
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
      return res.status(400).json({ message: "A customer with this contact number or Sr. No. already exists for your business." });
    }
    res.status(500).json({ message: "Server error while adding customer." });
  }
};

// @desc    Get all customers for the logged-in vendor
// @route   GET /api/customers
// @access  Private
const getAllCustomers = async (req, res) => {
  try {
    // Find only customers that belong to the logged-in vendor
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

    // SECURITY CHECK: Ensure the customer belongs to the logged-in vendor
    if (customer.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Access denied. You are not authorized to update this customer." });
    }
    
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body, // Pass the update data
      { new: true, runValidators: true } // Options: return the updated document
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

    // SECURITY CHECK: Ensure the customer belongs to the logged-in vendor
    if (customer.vendorId.toString() !== req.vendor._id.toString()) {
      return res.status(403).json({ message: "Access denied. You are not authorized to delete this customer." });
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
