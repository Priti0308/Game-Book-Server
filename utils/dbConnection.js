const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected:");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
