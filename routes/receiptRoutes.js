// file: routes/receipts.js

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    createReceipt,
    getAllReceipts,
    updateReceipt,
    deleteReceipt
} = require("../controllers/receiptController"); // Import the controller functions

// Define the API routes
// A GET request to /api/receipts will get all receipts
router.get("/", protect, getAllReceipts);

// A POST request to /api/receipts will create a new receipt
router.post("/", protect, createReceipt);

// **THE FIX: Add the missing PUT route for updates**
// A PUT request to /api/receipts/:id will update a specific receipt
router.put("/:id", protect, updateReceipt);

// A DELETE request to /api/receipts/:id will delete a specific receipt
router.delete("/:id", protect, deleteReceipt);

module.exports = router;