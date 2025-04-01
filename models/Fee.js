const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  term: { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true },
  status: { type: String, enum: ['Paid', 'Partial', 'Unpaid'], required: true },
});

module.exports = mongoose.model('Fee', feeSchema);