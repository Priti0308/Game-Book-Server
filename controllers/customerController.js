const Customer = require('../models/Customer');
const Activity = require('../models/Activity'); // <-- 1. IMPORT ACTIVITY MODEL
const Vendor = require('../models/Vendor'); // Optional: If you need to reference Vendor

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  try {
    const { name, mobile, email, address } = req.body;

    // Check if customer already exists for this vendor
    const customerExists = await Customer.findOne({ mobile, vendorId: req.vendor.id });
    if (customerExists) {
      return res.status(400).json({ message: 'Customer with this mobile number already exists' });
    }

    const customer = await Customer.create({
      name,
      mobile,
      email,
      address,
      vendorId: req.vendor.id, // Inject the logged-in vendor's ID
    });

    // --- 2. ADD THIS PART ---
    // Log the activity after the customer is successfully created
    if (customer) {
      await Activity.create({
        vendorId: req.vendor.id,
        type: 'NEW_CUSTOMER',
        description: `'${customer.name}' was added as a new customer`,
      });
    }
    // -------------------

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error while creating customer' });
  }
};

// @desc    Get all customers for the logged-in vendor
// @route   GET /api/customers
// @access  Private
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ vendorId: req.vendor.id }).sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error while fetching customers' });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, vendorId: req.vendor.id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    Object.assign(customer, req.body);
    const updatedCustomer = await customer.save();

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error while updating customer' });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, vendorId: req.vendor.id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer removed successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Server error while deleting customer' });
  }
};

module.exports = {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
};