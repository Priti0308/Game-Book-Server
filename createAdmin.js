const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, { dbName: "mainDB" })
  .then(() => console.log('MongoDB connected to mainDB'))
  .catch(err => console.log(err));


async function createAdmin() {
  try {
    // Hash password
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Admin user
    const admin = new User({
      role: 'admin',
      username: 'admin',
      password: adminPassword
    });

    await admin.save();

    console.log('Admin created successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
