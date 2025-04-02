const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Add a new student (POST)
router.post('/', async (req, res) => {
  const { name, schoolCode, age, grade, parentName, parentContact, dateOfBirth, address } = req.body;
  try {
    const existingStudent = await Student.findOne({ schoolCode });
    if (existingStudent) {
      return res.status(400).json({ message: 'School code already in use' });
    }

    const student = new Student({
      name,
      schoolCode,
      age,
      grade,
      parentName,
      parentContact,
      dateOfBirth,
      address,
      enrollmentDate: new Date(),
    });
    const savedStudent = await student.save();
    res.status(201).json({ message: 'Student added successfully', student: savedStudent });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ message: 'Failed to add student', error: err.message });
  }
});

// Get all students or by grade (GET)
router.get('/', async (req, res) => {
  const { grade } = req.query;
  try {
    const query = grade ? { grade: parseInt(grade) } : {};
    const students = await Student.find(query);
    res.json({ message: 'Students fetched successfully', students });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Failed to fetch students', error: err.message });
  }
});

// Get student by ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student fetched successfully', student });
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: 'Failed to fetch student', error: err.message });
  }
});

// Delete student (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Failed to delete student', error: err.message });
  }
});

module.exports = router;