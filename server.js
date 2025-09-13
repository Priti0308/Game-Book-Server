const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./utils/dbConnection");

// Routes
const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendorRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const receiptRoutes = require("./routes/receiptRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/receipts", receiptRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
