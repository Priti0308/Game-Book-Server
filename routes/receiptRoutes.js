const express = require("express");
const router = express.Router();
const { protectVendor } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit'); // For PDF generation
const { receiptSchema } = require("../models/Receipt");
const CustomerSchema = require('../models/Customer');

// Helper to get models for the specific vendor's database
const getModels = (req) => {
  if (!req.vendorDB) throw new Error("Vendor DB not available");
  const Receipt = req.vendorDB.model("Receipt", receiptSchema);
  const Customer = req.vendorDB.model("Customer", CustomerSchema);
  return { Receipt, Customer };
};

// --- GET all receipts for the logged-in vendor ---
router.get("/", protectVendor, async (req, res) => {
  try {
    const { Receipt } = getModels(req);
    const receipts = await Receipt.find().sort({ createdAt: -1 });
    res.json({ receipts });
  } catch (err) {
    console.error("Error fetching receipts:", err);
    res.status(500).json({ message: "Failed to fetch receipts" });
  }
});

// --- POST a new receipt ---
router.post("/", protectVendor, async (req, res) => {
  try {
    const { Receipt } = getModels(req);
    
    // Create a new receipt instance with data from the request body
    const receipt = new Receipt({
        ...req.body,
        date: new Date(req.body.date), // Ensure date is a proper Date object
        vendorId: req.vendor._id      // Inject the logged-in vendor's ID
    });
    
    await receipt.save();
    res.status(201).json({ message: "Receipt saved successfully", data: receipt });
  } catch (error) {
    console.error("Error saving receipt:", error);
    res.status(500).json({ message: "Error saving receipt", error: error.message });
  }
});

// --- DELETE a specific receipt by its ID ---
router.delete("/:receiptId", protectVendor, async (req, res) => {
  try {
    const { Receipt } = getModels(req);
    const { receiptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(receiptId)) {
      return res.status(400).json({ message: "Invalid receipt ID format." });
    }

    const deletedReceipt = await Receipt.findByIdAndDelete(receiptId);

    if (!deletedReceipt) {
      return res.status(404).json({ message: "Receipt not found." });
    }

    res.json({ message: "Receipt deleted successfully." });
  } catch (err) {
    console.error("Error deleting receipt:", err);
    res.status(500).json({ message: "Failed to delete receipt" });
  }
});

// --- POST to generate a PDF from receipt data ---
router.post("/generate-pdf", protectVendor, (req, res) => {
    try {
      const { formData } = req.body;
      // Using a standard A5 paper size in landscape for a wide receipt format
      const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 20 });

      res.setHeader('Content-Disposition', 'attachment; filename="Receipt.pdf"');
      res.setHeader('Content-Type', 'application/pdf');

      doc.pipe(res);

      // IMPORTANT: Ensure this font file exists in a 'fonts' folder in your project root
      doc.font('fonts/NotoSerifDevanagari-Regular.ttf');
      
      // Header
      doc.fontSize(16).text(formData.businessName, { align: 'center' });
      doc.moveDown(1.5);

      // Customer and Date Info
      const infoY = doc.y;
      doc.fontSize(11).text(`नांव:- ${formData.customerName}`, { continued: false });
      doc.text(`वार:- ${formData.day}`, { align: 'right' });
      doc.y = infoY; // Reset Y to align date below day
      doc.text(`दि:- ${formData.date}`, { align: 'right' });
      doc.moveDown(1.5);

      // --- Table Content ---
      // This section simulates a table using text positioning for precise layout
      const tableTop = doc.y;
      const col1 = 40, col2 = 120, col3 = 300, col4 = 380;
      const rowHeight = 18;

      const drawRow = (y, items) => {
          doc.fontSize(10).text(items[0], col1, y);
          doc.text(items[1], col2, y, { width: 60, align: 'right' });
          doc.text(items[2], col3, y);
          doc.text(items[3], col4, y, { width: 60, align: 'right' });
      };

      drawRow(tableTop + rowHeight * 0, ['आ.', formData.morningIncome, 'पें.', formData.payment]);
      drawRow(tableTop + rowHeight * 1, ['कु.', formData.eveningIncome, 'टो.', formData.remainingBalance]);
      drawRow(tableTop + rowHeight * 2, ['टो.', formData.totalIncome, 'मा.', formData.pendingAmount]);
      drawRow(tableTop + rowHeight * 3, ['क.', formData.deduction, 'टो.', formData.finalTotal]);
      drawRow(tableTop + rowHeight * 4, ['टो.', formData.afterDeduction, '', '']);
      
      // Bottom section with signature and totals
      const bottomY = tableTop + rowHeight * 6;
      const boxWidth = (doc.page.width / 2) - doc.page.margins.left - 5;
      
      doc.rect(doc.page.margins.left, bottomY, boxWidth, 70).stroke(); // Left box for notes/signature
      
      const rightBoxX = (doc.page.width / 2) + 5;
      doc.rect(rightBoxX, bottomY, boxWidth, 70).stroke(); // Right box for final totals
      
      doc.fontSize(11).text(`आड:-`, rightBoxX + 10, bottomY + 10);
      doc.text(formData.advanceAmount, rightBoxX, bottomY + 10, { width: boxWidth - 20, align: 'right' });
      doc.text(`टो:-`, rightBoxX + 10, bottomY + 40);
      doc.text(formData.totalWithAdvance, rightBoxX, bottomY + 40, { width: boxWidth - 20, align: 'right' });

      doc.end();

    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Error generating PDF", error: error.message });
    }
});

module.exports = router;

