const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  term: { type: String, enum: ['Term 1', 'Term 2', 'Term 3'], required: true },
  subjects: {
    maths: { type: Number, min: 0, max: 100, required: true },
    english: { type: Number, min: 0, max: 100, required: true },
    science: { type: Number, min: 0, max: 100, required: true },
    history: { type: Number, min: 0, max: 100, required: true },
    geography: { type: Number, min: 0, max: 100, required: true },
  },
});

module.exports = mongoose.model('TestResult', testResultSchema);