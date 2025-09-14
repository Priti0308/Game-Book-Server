// file: controllers/receiptController.js

const Receipt = require("../models/Receipt");
const Customer = require("../models/Customer");

// @desc    Create a new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
  try {
    const receipt = new Receipt({
        ...req.body,
        date: new Date(req.body.date), // Ensure date is a proper Date object
        vendorId: req.vendor._id      // Inject the logged-in vendor's ID
    });
    
    await receipt.save();
    res.status(201).json({ message: "Receipt saved successfully", receipt }); // Return the full receipt object
  } catch (error) {
    console.error("Error saving receipt:", error);
    res.status(500).json({ message: "Error saving receipt", error: error.message });
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

// @desc    Update a receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedReceipt = await Receipt.findOneAndUpdate(
            { _id: id, vendorId: req.vendor._id }, // Security: ensure receipt belongs to vendor
            req.body, // The updated data from the frontend
            { new: true, runValidators: true } // Options: return the new version
        );

        if (!updatedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized" });
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
        const { id } = req.params;
        const deletedReceipt = await Receipt.findOneAndDelete({ _id: id, vendorId: req.vendor._id });

        if (!deletedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized" });
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
  updateReceipt,
  deleteReceipt,
};