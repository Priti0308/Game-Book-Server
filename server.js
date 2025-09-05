const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const receiptRoutes = require('./routes/receiptRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", receiptRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Server is running with multi-vendor setup 🚀');
});

// Use a production URI if available, otherwise fallback to local
const dbURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(dbURI, { dbName: "mainDB" })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌MongoDB connection error:", err);
    process.exit(1); // stop server if DB fails
  });
