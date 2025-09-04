const User = require('../models/User');
const bcrypt = require('bcryptjs');  // For password hashing
const jwt = require('jsonwebtoken'); // For generating tokens

exports.login = async (req, res) => {
  try {
    const { role, username, mobile, password } = req.body;

    // Find user based on role
    let user;
    if (role === 'admin') {
      user = await User.findOne({ username, role });
    } else {
      user = await User.findOne({ mobile, role });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
