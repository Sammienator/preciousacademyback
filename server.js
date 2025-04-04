const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Normalize URLs to handle double slashes
app.use((req, res, next) => {
  const originalUrl = req.url;
  req.url = req.url.replace(/\/+/g, '/'); // Collapse multiple slashes into one
  if (originalUrl !== req.url) {
    console.log(`Normalized URL: ${originalUrl} -> ${req.url}`);
  }
  next();
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://preciousacademy.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Test root route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Load and log routes
console.log('Loading routes...');
try {
  const studentRoutes = require('./routes/student');
  app.use('/api/students', studentRoutes);
  console.log('Student routes mounted');
} catch (err) {
  console.error('Failed to load student routes:', err);
}

try {
  const testResultRoutes = require('./routes/testResults');
  app.use('/api/students/test-results', testResultRoutes); // Nested under /api/students/test-results
  app.use('/api/test-results', testResultRoutes); // Root level for backwards compatibility
  console.log('Test result routes mounted');
} catch (err) {
  console.error('Failed to load test result routes:', err);
}

try {
  const feeRoutes = require('./routes/fees');
  app.use('/api/students/fees', feeRoutes); // Nested under /api/students/fees
  console.log('Fee routes mounted');
} catch (err) {
  console.error('Failed to load fee routes:', err);
}

try {
  const noteRoutes = require('./routes/notes');
  app.use('/api/students/notes', noteRoutes); // Nested under /api/students/notes
  console.log('Note routes mounted');
} catch (err) {
  console.error('Failed to load note routes:', err);
}

try {
  const reportsRoutes = require('./routes/reports');
  app.use('/api/reports', reportsRoutes);
  console.log('Report routes mounted');
} catch (err) {
  console.error('Failed to load report routes:', err);
}

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Fallback for unmatched routes
app.use((req, res) => {
  console.log(`Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected to Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));