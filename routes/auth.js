const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user data (replace with MongoDB User model in production)
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'teacher', password: 'teacher123', role: 'teacher' },
];

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;