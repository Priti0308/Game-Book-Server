const Customer = require('../models/Customer');
const Activity = require('../models/Activity');

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = async (req, res) => {
  try {
    const { name, address } = req.body;

    // Validation for required field
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    // Check if a customer with the same name already exists for this vendor
    const customerExists = await Customer.findOne({ name, vendorId: req.vendor.id });
    if (customerExists) {
      return res.status(400).json({ message: 'A customer with this name already exists' });
    }

    // Auto-increment srNo logic
    const lastCustomer = await Customer.findOne({ vendorId: req.vendor.id }).sort({ srNo: -1 });
    const srNo = lastCustomer ? lastCustomer.srNo + 1 : 1;

    const customer = await Customer.create({
      name,
      address,
      srNo, // Add the calculated serial number
      vendorId: req.vendor.id,
    });

    // Log the activity
    await Activity.create({
      vendorId: req.vendor.id,
      type: 'NEW_CUSTOMER',
      description: `'${customer.name}' was added as a new customer`,
    });

    res.status(201).json({ customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error while creating customer' });
  }
};

/**
 * @desc    Get all customers for the logged-in vendor
 * @route   GET /api/customers
 * @access  Private
 */
const getAllCustomers = async (req, res) => {
  try {
    // Sort by srNo for a consistent, sequential list
    const customers = await Customer.find({ vendorId: req.vendor.id }).sort({ srNo: 1 });
    res.status(200).json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error while fetching customers' });
  }
};

/**
 * @desc    Update a customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res) => {
  try {
    const { name, address } = req.body;
    
    const customer = await Customer.findOne({ _id: req.params.id, vendorId: req.vendor.id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Securely update only allowed fields
    customer.name = name || customer.name;
    customer.address = address || customer.address;
    
    const updatedCustomer = await customer.save();

    res.status(200).json({ customer: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error while updating customer' });
  }
};

/**
 * @desc    Delete a customer
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
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
