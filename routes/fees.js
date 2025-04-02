const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');

// Log to confirm file loading
console.log('Fees routes file loaded');

// Get fees for a student
router.get('/:id/fees', async (req, res) => {
  console.log(`Fetching fees for student ID: ${req.params.id}`);
  try {
    const fees = await Fee.find({ studentId: req.params.id });
    res.json({ message: 'Fees fetched successfully', fees });
  } catch (err) {
    console.error('Error fetching fees:', err);
    res.status(500).json({ message: 'Failed to fetch fees', error: err.message });
  }
});

// Add or update fee
router.post('/:id/fees', async (req, res) => {
  const { term, status } = req.body;
  console.log(`Adding/updating fee for student ID: ${req.params.id}, term: ${term}, status: ${status}`);
  try {
    const existingFee = await Fee.findOne({ studentId: req.params.id, term });
    if (existingFee) {
      existingFee.status = status;
      await existingFee.save();
      res.json({ message: 'Fee updated successfully', fee: existingFee });
    } else {
      const fee = new Fee({ studentId: req.params.id, term, status });
      const savedFee = await fee.save();
      res.status(201).json({ message: 'Fee added successfully', fee: savedFee });
    }
  } catch (err) {
    console.error('Error saving fee:', err);
    res.status(400).json({ message: 'Failed to save fee', error: err.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Fees route is working' });
});

module.exports = router;