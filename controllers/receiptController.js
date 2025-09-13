const Receipt = require("../models/Receipt");
const Customer = require("../models/Customer");

// @desc    Create a new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
  try {
    const { customerId, date, morningIncome, eveningIncome, ...otherFields } = req.body;

    if (!customerId || !date) {
      return res.status(400).json({ message: "Customer and date are required." });
    }

    const customer = await Customer.findById(customerId);
    if (!customer || customer.vendorId.toString() !== req.vendor._id.toString()) {
        return res.status(404).json({ message: "Customer not found or not associated with this vendor." });
    }

    const totalIncome = (Number(morningIncome) || 0) + (Number(eveningIncome) || 0);

    const receipt = new Receipt({
      ...otherFields,
      vendorId: req.vendor._id,
      customerId,
      customerName: customer.name, // Snapshot of customer name
      businessName: req.vendor.businessName, // Snapshot of business name
      date,
      morningIncome,
      eveningIncome,
      totalIncome,
    });

    await receipt.save();
    res.status(201).json({ message: "Receipt created successfully", receipt });

  } catch (err) {
    console.error("Error creating receipt:", err);
    res.status(500).json({ message: "Failed to create receipt" });
  }
};

// @desc    Get all receipts for the logged-in vendor
// @route   GET /api/receipts
// @access  Private
const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ vendorId: req.vendor._id }).sort({ date: -1 });
    res.json({ receipts });
  } catch (err) {
    console.error("Error fetching receipts:", err);
    res.status(500).json({ message: "Failed to fetch receipts" });
  }
};

// @desc    Get a single receipt by ID
// @route   GET /api/receipts/:id
// @access  Private
const getReceiptById = async (req, res) => {
    try {
        const receipt = await Receipt.findOne({ _id: req.params.id, vendorId: req.vendor._id });

        if (!receipt) {
            return res.status(404).json({ message: "Receipt not found" });
        }
        res.json(receipt);
    } catch (err) {
        console.error("Error fetching receipt:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update a receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
    try {
        const { morningIncome, eveningIncome, ...otherFields } = req.body;

        const totalIncome = (Number(morningIncome) || 0) + (Number(eveningIncome) || 0);
        
        const updatedReceipt = await Receipt.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.vendor._id },
            { ...otherFields, morningIncome, eveningIncome, totalIncome },
            { new: true, runValidators: true }
        );

        if (!updatedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized to update it." });
        }
        res.json({ message: "Receipt updated successfully", receipt: updatedReceipt });
    } catch (err) {
        console.error("Error updating receipt:", err);
        res.status(500).json({ message: "Failed to update receipt" });
    }
};

// @desc    Delete a receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
    try {
        const deletedReceipt = await Receipt.findOneAndDelete({ _id: req.params.id, vendorId: req.vendor._id });

        if (!deletedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized to delete it." });
        }
        res.json({ message: "Receipt deleted successfully" });
    } catch (err) {
        console.error("Error deleting receipt:", err);
        res.status(500).json({ message: "Failed to delete receipt" });
    }
};


module.exports = {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
};
