const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User"); // <-- adjust path if needed

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    const username = "admin"; // change if you want custom username
    const password = "admin123"; 
    const role = "admin";

    // Check if admin already exists
    let admin = await User.findOne({ username, role });
    if (admin) {
      console.log("⚠️ Admin already exists:", admin.username);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    admin = new User({
      username,
      password: hashedPassword,
      role,
    });

    await admin.save();
    console.log("🎉 Admin created successfully!");
    console.log(`➡️ Username: ${username}`);
    console.log(`➡️ Password: ${password}`);
    console.log(`➡️ Role: ${role}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
};

createAdmin();
