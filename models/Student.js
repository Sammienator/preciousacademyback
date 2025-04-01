const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolCode: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  grade: { type: Number, required: true },
  parentName: { type: String, required: true },
  parentContact: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);