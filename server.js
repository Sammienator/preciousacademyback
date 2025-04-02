const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

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
  app.use('/api/students', testResultRoutes); // Nested under /api/students
  app.use('/api/test-results', testResultRoutes); // Root level
  console.log('Test result routes mounted');
} catch (err) {
  console.error('Failed to load test result routes:', err);
}

try {
  const feeRoutes = require('./routes/fees');
  app.use('/api/students', feeRoutes);
  console.log('Fee routes mounted');
} catch (err) {
  console.error('Failed to load fee routes:', err);
}

try {
  const noteRoutes = require('./routes/notes');
  app.use('/api/students', noteRoutes);
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