const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function createAdmin() {
  try {
    // Hash password
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      process.exit();
    }

    // Create admin user
    const admin = new User({
      role: 'admin',
      username: 'admin',
      password: adminPassword,
    });

    await admin.save();

    console.log('✅ Admin created successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
