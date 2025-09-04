// //controllers/receiptControllre.js
// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// // const Receipt = require('../models/Receipt'); // Verify this path
// const ReceiptSchema = require('../models/Receipt').schema;

// class ReceiptController {
//   static async getReceipt(req, res) {
//     try {
//       const receipt = await Receipt.findOne().sort({ updatedAt: -1 }); // Get the latest receipt
//       res.json(receipt || new Receipt());
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching receipt", error });
//     }
//   }

//   static async saveReceipt(req, res) {
//     try {
//       const data = req.body;
//       const receipt = new Receipt(data);
//       await receipt.save();
//       res.json({ message: "Data saved successfully", data: receipt });
//     } catch (error) {
//       res.status(500).json({ message: "Error saving receipt", error });
//     }
//   }

//   static async generatePDF(req, res) {
//     try {
//       const { formData } = req.body;
//       const doc = new PDFDocument({ size: [420, 297], margin: 8 });
//       res.setHeader('Content-Disposition', 'attachment; filename="Receipt.pdf"');
//       res.setHeader('Content-Type', 'application/pdf');

//       doc.font('fonts/NotoSerifDevanagari-Regular.ttf')
//         .fontSize(18)
//         .text(formData.businessName, 210, 10, { align: 'center' })
//         .fontSize(14)
//         .text(`नांव:- ${formData.customerName}`, 20, 40)
//         .text(`वार:- ${formData.day}`, 300, 40)
//         .text(`दि:- ${formData.date}`, 300, 60)
//         .moveDown()
//         .text('ओ.  रक्कम  ओ.  जोड  को.  पान', { continued: true })
//         .moveTo(20, 100)
//         .lineTo(400, 100)
//         .stroke()
//         .text(`आ.  ${formData.morningIncome}  आ.  ${formData.deduction}  को.`, 20, 110)
//         .text(`कु.  ${formData.eveningIncome}`, 20, 140)
//         .text(`टो.  ${formData.totalIncome}`, 20, 170)
//         .text(`क.  ${formData.deduction}`, 20, 200)
//         .text(`टो.  ${formData.afterDeduction}`, 20, 230)
//         .text(`पें.  ${formData.payment}`, 20, 260)
//         .text(`टो.  ${formData.remainingBalance}`, 20, 290)
//         .text(`मा.  ${formData.pendingAmount}`, 20, 320)
//         .text(`टो.  ${formData.finalTotal}`, 20, 350)
//         .moveTo(20, 380)
//         .lineTo(400, 380)
//         .stroke()
//         .text(`आड:- ${formData.advanceAmount}`, 20, 390)
//         .text(`टो:- ${formData.totalWithAdvance}`, 300, 390)
//         .end();

//       doc.pipe(res);
//     } catch (error) {
//       res.status(500).json({ message: "Error generating PDF", error });
//     }
//   }
// }

// module.exports = ReceiptController;
const PDFDocument = require('pdfkit');
const { receiptSchema } = require('../models/Receipt');
const CustomerSchema = require('../models/Customer');

class ReceiptController {
  static async getReceipt(req, res) {
    try {
const Receipt = req.vendorDB.model('Receipt', receiptSchema);
      const Customer = req.vendorDB.model('Customer', CustomerSchema);

      const { customerId } = req.query;
      const query = customerId ? { customerId } : {};
      const receipt = await Receipt.findOne(query).sort({ updatedAt: -1 });

      let customerName = "";
      if (receipt?.customerId) {
        const customer = await Customer.findById(receipt.customerId);
        customerName = customer?.name || "";
      }

      const businessName = req.vendor?.businessName || "";

      res.json({
        receipt: receipt || new Receipt(),
        businessName,
        customerName
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching receipt", error });
    }
  }

  static async saveReceipt(req, res) {
    console.log("Incoming receipt body:", req.body);
console.log("🧾 Receipt POST hit. Body:", req.body);
    console.log("🔐 Vendor ID:", req.vendor?._id);
    console.log("📦 Vendor DB available:", !!req.vendorDB);
    try {
      
const Receipt = req.vendorDB.model('Receipt', receiptSchema);
      req.body.date = new Date(req.body.date);

const receipt = new Receipt({
  ...req.body,
  vendorId: req.vendor._id // ← inject manually
});
      await receipt.save();
      res.json({ message: "Data saved successfully", data: receipt });
    } catch (error) {
      console.error("💥 Receipt save failed:", error.stack);

      res.status(500).json({ message: "Error saving receipt", error });
    }
  }

  static async generatePDF(req, res) {
    try {
      const { formData } = req.body;
      const doc = new PDFDocument({ size: [420, 297], margin: 8 });
      res.setHeader('Content-Disposition', 'attachment; filename="Receipt.pdf"');
      res.setHeader('Content-Type', 'application/pdf');

      doc.font('fonts/NotoSerifDevanagari-Regular.ttf')
        .fontSize(18)
        .text(formData.businessName, 210, 10, { align: 'center' })
        .fontSize(14)
        .text(`नांव:- ${formData.customerName}`, 20, 40)
        .text(`वार:- ${formData.day}`, 300, 40)
        .text(`दि:- ${formData.date}`, 300, 60)
        .moveDown()
        .text('ओ.  रक्कम  ओ.  जोड  को.  पान', { continued: true })
        .moveTo(20, 100)
        .lineTo(400, 100)
        .stroke()
        .text(`आ.  ${formData.morningIncome}  आ.  ${formData.deduction}  को.`, 20, 110)
        .text(`कु.  ${formData.eveningIncome}`, 20, 140)
        .text(`टो.  ${formData.totalIncome}`, 20, 170)
        .text(`क.  ${formData.deduction}`, 20, 200)
        .text(`टो.  ${formData.afterDeduction}`, 20, 230)
        .text(`पें.  ${formData.payment}`, 20, 260)
        .text(`टो.  ${formData.remainingBalance}`, 20, 290)
        .text(`मा.  ${formData.pendingAmount}`, 20, 320)
        .text(`टो.  ${formData.finalTotal}`, 20, 350)
        .moveTo(20, 380)
        .lineTo(400, 380)
        .stroke()
        .text(`आड:- ${formData.advanceAmount}`, 20, 390)
        .text(`टो:- ${formData.totalWithAdvance}`, 300, 390)
        .end();

      doc.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Error generating PDF", error });
    }
  }
}

module.exports = ReceiptController;

