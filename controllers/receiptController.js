// const Receipt = require("../models/Receipt");
// // The Activity model is optional but good for logging changes.
// // const Activity = require('../models/Activity'); 

// // @desc    Create a new receipt
// // @route   POST /api/receipts
// // @access  Private
// const createReceipt = async (req, res) => {
//   try {
//     const receiptData = {
//         ...req.body,
//         date: new Date(req.body.date), // Ensure date is stored as a valid Date object
//         vendorId: req.vendor.id        // Inject the logged-in vendor's ID from middleware
//     };

//     const receipt = new Receipt(receiptData);
//     await receipt.save();

//     // Optional: Log this action
//     // await Activity.create({
//     //   vendorId: req.vendor.id,
//     //   type: 'NEW_RECEIPT',
//     //   description: `Receipt created for customer '${receipt.customerName}'`,
//     // });

//     res.status(201).json({ message: "Receipt saved successfully", receipt });
//   } catch (error) {
//     console.error("Error saving receipt:", error);
//     res.status(500).json({ message: "Error saving receipt", error: error.message });
//   }
// };

// // @desc    Get all receipts for the logged-in vendor
// // @route   GET /api/receipts
// // @access  Private
// const getAllReceipts = async (req, res) => {
//   try {
//     // Find all receipts that belong to the currently logged-in vendor
//     const receipts = await Receipt.find({ vendorId: req.vendor.id }).sort({ date: -1 });
//     res.status(200).json({ receipts });
//   } catch (err) {
//     console.error("Error fetching receipts:", err);
//     res.status(500).json({ message: "Failed to fetch receipts" });
//   }
// };

// // @desc    Update a specific receipt
// // @route   PUT /api/receipts/:id
// // @access  Private
// const updateReceipt = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         // Find the receipt by its ID and ensure it belongs to the logged-in vendor for security
//         const updatedReceipt = await Receipt.findOneAndUpdate(
//             { _id: id, vendorId: req.vendor.id }, 
//             req.body, // The updated data from the frontend
//             { new: true, runValidators: true } // Options: return the new version and run schema validators
//         );

//         if (!updatedReceipt) {
//             return res.status(404).json({ message: "Receipt not found or you are not authorized" });
//         }
//         res.status(200).json({ message: "Receipt updated successfully", receipt: updatedReceipt });
//     } catch (err) {
//         console.error("Error updating receipt:", err);
//         res.status(500).json({ message: "Failed to update receipt" });
//     }
// };

// // @desc    Delete a receipt
// // @route   DELETE /api/receipts/:id
// // @access  Private
// const deleteReceipt = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find the receipt by its ID and ensure it belongs to the logged-in vendor
//         const deletedReceipt = await Receipt.findOneAndDelete({ _id: id, vendorId: req.vendor.id });

//         if (!deletedReceipt) {
//             return res.status(404).json({ message: "Receipt not found or you are not authorized" });
//         }
//         res.status(200).json({ message: "Receipt deleted successfully" });
//     } catch (err) {
//         console.error("Error deleting receipt:", err);
//         res.status(500).json({ message: "Failed to delete receipt" });
//     }
// };

// module.exports = {
//   createReceipt,
//   getAllReceipts,
//   updateReceipt,
//   deleteReceipt,
// };

const Receipt = require("../models/Receipt");
// The Activity model is optional but good for logging changes.
// const Activity = require('../models/Activity'); 

// @desc    Create a new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
    try {
        const receiptData = {
            ...req.body,
            // Ensure date is stored as a valid Date object
            date: new Date(req.body.date), 
            // Inject the logged-in vendor's ID from middleware
            vendorId: req.vendor.id 
        };

        const receipt = new Receipt(receiptData);
        await receipt.save();

        // Optional: Log this action
        // await Activity.create({
        //   vendorId: req.vendor.id,
        //   type: 'NEW_RECEIPT',
        //   description: `Receipt created for customer '${receipt.customerName}'`,
        // });

        res.status(201).json({ message: "Receipt saved successfully", receipt });
    } catch (error) {
        console.error("Error saving receipt:", error);
        // Handle validation errors specifically if needed
        const message = error.name === 'ValidationError' ? error.message : "Error saving receipt";
        res.status(500).json({ message, error: error.message });
    }
};

// @desc    Get all receipts for the logged-in vendor
// @route   GET /api/receipts
// @access  Private
const getAllReceipts = async (req, res) => {
    try {
        // Find all receipts that belong to the currently logged-in vendor
        const receipts = await Receipt.find({ vendorId: req.vendor.id }).sort({ date: -1 });
        res.status(200).json({ receipts });
    } catch (err) {
        console.error("Error fetching receipts:", err);
        res.status(500).json({ message: "Failed to fetch receipts" });
    }
};

// @desc    Update a specific receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prepare update data, ensuring the date field is converted back to a Date object
        const updateData = {
            ...req.body,
            date: new Date(req.body.date), 
        };

        // Find the receipt by its ID and ensure it belongs to the logged-in vendor for security
        const updatedReceipt = await Receipt.findOneAndUpdate(
            { _id: id, vendorId: req.vendor.id }, 
            updateData, 
            { new: true, runValidators: true } // Options: return the new version and run schema validators
        );

        if (!updatedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized" });
        }
        res.status(200).json({ message: "Receipt updated successfully", receipt: updatedReceipt });
    } catch (err) {
        console.error("Error updating receipt:", err);
        // Handle validation errors specifically if needed
        const message = err.name === 'ValidationError' ? err.message : "Failed to update receipt";
        res.status(500).json({ message, error: err.message });
    }
};

// @desc    Delete a receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the receipt by its ID and ensure it belongs to the logged-in vendor
        const deletedReceipt = await Receipt.findOneAndDelete({ _id: id, vendorId: req.vendor.id });

        if (!deletedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized" });
        }
        res.status(200).json({ message: "Receipt deleted successfully" });
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