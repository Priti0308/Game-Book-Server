const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createReceipt,
    getAllReceipts,
    updateReceipt,
    deleteReceipt
} = require("../controllers/receiptController");

// Matches GET request to /api/receipts to get all receipts
router.get("/", protect, getAllReceipts);

// Matches POST request to /api/receipts to create a new receipt
router.post("/", protect, createReceipt);

// Matches PUT request to /api/receipts/:id to update a specific receipt
router.put("/:id", protect, updateReceipt);

// Matches DELETE request to /api/receipts/:id to delete a specific receipt
router.delete("/:id", protect, deleteReceipt);

module.exports = router;