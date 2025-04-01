const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Note', noteSchema);