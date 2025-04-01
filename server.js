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

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/students', testResultRoutes); // Routes like /api/students/:id/test-results
app.use('/api/students', feeRoutes);        // Routes like /api/students/:id/fees
app.use('/api/students', noteRoutes);       // Routes like /api/students/:id/notes
app.use('/api/reports', reportsRoutes);

app.use('/api/test-results', testResultRoutes); // Add this for the new root route
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected to Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));