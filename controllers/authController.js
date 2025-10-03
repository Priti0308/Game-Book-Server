// Filename: controllers/authController.js

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    console.log("➡️ [LOGIN] API endpoint hit.");
    const { role, username, mobile, password } = req.body;

    let user;
    console.log("➡️ [LOGIN] Searching for user in database...");

    if (role === "admin") {
      user = await User.findOne({ username, role });
    } else if (role === "vendor") {
      user = await User.findOne({ mobile, role });
    }

    // THIS IS THE CRITICAL LOG. If you don't see this, the await User.findOne() is hanging.
    console.log("➡️ [LOGIN] Database search complete.");

    if (!user) {
      console.log("❌ [LOGIN] User not found.");
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    console.log("✅ [LOGIN] User found. Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ [LOGIN] Password does not match.");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ [LOGIN] Password match! Creating JWT...");
    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        console.log("✅ [LOGIN] Token created. Sending success response.");
        res.status(200).json({
          message: "Login successful!",
          token,
          user: { id: user.id, username: user.username, role: user.role }
        });
      }
    );
  } catch (err) {
    console.error("🔥 [LOGIN] A critical error occurred:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};