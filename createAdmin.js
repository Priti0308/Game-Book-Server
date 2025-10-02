const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Adjust the path to your User model if it's in a different directory
const User = require("./models/User"); 

const createAdmin = async () => {
  try {
    // Connect to MongoDB without deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // --- Admin User Configuration ---
    const username = "admin"; 
    const password = "admin123"; // Use a strong password in production
    const role = "admin";
    // --------------------------------

    // Check if an admin user already exists.
    // Since an admin might exist with a different username, we check by role.
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log("⚠️  Admin user already exists.");
      console.log(`-> Found existing admin with username: ${admin.username}`);
      console.log("-> No action taken.");
    } else {
      // If admin does not exist, proceed to create one
      console.log("-> Admin user not found. Creating a new one...");

      // Hash the password for security
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the new admin user instance.
      // Based on your schema, 'mobile' is not required for the 'admin' role,
      // so we only provide the required fields.
      admin = new User({
        username,
        password: hashedPassword,
        role,
      });

      await admin.save();
      
      console.log("🎉 Admin user created successfully!");
      console.log("   Login with the following credentials:");
      console.log(`   ➡️  Username: ${username}`);
      console.log(`   ➡️  Password: ${password}`);
    }

  } catch (err) {
    console.error("❌ Error during admin creation process:", err.message);
    process.exit(1); // Exit with an error code
  } finally {
    // Ensure the database connection is closed
    await mongoose.connection.close();
    process.exit(0); // Exit gracefully
  }
};

createAdmin();

