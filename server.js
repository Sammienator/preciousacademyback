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
  'http://localhost:3000',           // Local dev
  'https://preciousacademy.vercel.app' // Production frontend
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

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/students', testResultRoutes); // Routes like /api/students/:id/test-results
app.use('/api/students', feeRoutes);
app.use('/api/students', noteRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/test-results', testResultRoutes); // Root route for test results

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected to Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));