const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI_PROD || process.env.MONGO_URI;

    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      `✅ MongoDB connected to ${
        dbURI.includes("localhost") ? "Local (Game-Book)" : "Atlas (Game-Book)"
      }`
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;
