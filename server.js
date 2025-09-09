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
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/receipts", receiptRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running with Game-Book DB setup");
});

// Connect DB first, then start server
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  );
});
