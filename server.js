const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const studentRoutes = require('./routes/student');
const testResultRoutes = require('./routes/testResults');
const feeRoutes = require('./routes/fees');
const noteRoutes = require('./routes/notes');
const reportsRoutes = require('./routes/reports');

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

// Log route loading
console.log('Loading routes...');
app.use('/api/students', studentRoutes);
console.log('Student routes loaded');
app.use('/api/students', testResultRoutes);
console.log('Test result routes loaded');
app.use('/api/students', feeRoutes);
console.log('Fee routes loaded');
app.use('/api/students', noteRoutes);
console.log('Note routes loaded');
app.use('/api/reports', reportsRoutes);
console.log('Report routes loaded');
app.use('/api/test-results', testResultRoutes);
console.log('Test result root routes loaded');

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