const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { role, username, mobile, password } = req.body;
    console.log("📥 Login request:", req.body);

    let user;
    if (role === "admin") {
      user = await User.findOne({ username, role });
    } else {
      user = await User.findOne({ mobile, role });
    }

    console.log("👤 Found user:", user);

    // 👇 **ADD THIS CHECK HERE** 👇
    // If no user is found OR if the user exists but has no password,
    // send a clear error message instead of crashing.
    if (!user || !user.password) {
      console.warn("⚠️ User not found or password not set for:", {
        role,
        username,
        mobile,
      });
      return res.status(401).json({ message: "Invalid credentials" }); // Using 401 is better for security
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match result:", isMatch);

    if (!isMatch) {
      console.warn("⚠️ Invalid password for user:", user._id);
      // Use the same generic message for security
      return res.status(401).json({ message: "Invalid credentials" });
    } // ... rest of your code
    // ...
  } catch (err) {
    console.error("❌ Login error stack:", err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
