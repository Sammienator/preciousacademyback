const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Normalize URLs
app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, '/');
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://preciousacademy.vercel.app',
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Support cookies or Authorization headers
  })
);

// Parse JSON bodies
app.use(express.json());

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Authentication routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes mounted');
} catch (err) {
  console.error('Failed to load auth routes:', err);
}

// Protect student routes
try {
  const studentRoutes = require('./routes/student');
  app.use('/api/students', authenticate, studentRoutes);
  console.log('Student routes mounted');
} catch (err) {
  console.error('Failed to load student routes:', err);
}

// Protect test result routes
try {
  const testResultRoutes = require('./routes/testResults');
  app.use('/api/students/test-results', authenticate, testResultRoutes);
  app.use('/api/test-results', authenticate, testResultRoutes);
  console.log('Test result routes mounted');
} catch (err) {
  console.error('Failed to load test result routes:', err);
}

// Protect fee routes (admin only)
try {
  const feeRoutes = require('./routes/fees');
  app.use('/api/students/fees', authenticate, isAdmin, feeRoutes);
  console.log('Fee routes mounted');
} catch (err) {
  console.error('Failed to load fee routes:', err);
}

// Protect note routes
try {
  const noteRoutes = require('./routes/notes');
  app.use('/api/students/notes', authenticate, noteRoutes);
  console.log('Note routes mounted');
} catch (err) {
  console.error('Failed to load note routes:', err);
}

// Protect report routes (admin only)
try {
  const reportsRoutes = require('./routes/reports');
  app.use('/api/reports', authenticate, isAdmin, reportsRoutes);
  console.log('Report routes mounted');
} catch (err) {
  console.error('Failed to load report routes:', err);
}

try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes mounted successfully');
  // Add this to list all registered routes
  console.log('Registered routes:', app._router.stack
    .filter(r => r.route)
    .map(r => `${r.route.path} (${r.route.stack[0].method})`));
} catch (err) {
  console.error('Failed to load auth routes:', err);
}

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Log unmatched routes for debugging
app.use((req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected to Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));