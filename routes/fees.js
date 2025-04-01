const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');

// Get fees for a student
router.get('/:id/fees', async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.params.id });
    res.json({ message: 'Fees fetched successfully', fees });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fees', error: err.message });
  }
});

// Add or update fee
router.post('/:id/fees', async (req, res) => {
  const { term, status } = req.body;
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
    res.status(400).json({ message: 'Failed to save fee', error: err.message });
  }
});

module.exports = router;