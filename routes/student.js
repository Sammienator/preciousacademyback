const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

console.log('Student routes file loaded');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.post('/', async (req, res) => {
  const { name, schoolCode, age, grade, parentName, parentContact, dateOfBirth, address } = req.body;
  console.log(`Adding student: ${name}, schoolCode: ${schoolCode}`);
  try {
    const existingStudent = await Student.findOne({ schoolCode });
    if (existingStudent) {
      console.log(`School code ${schoolCode} already in use`);
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

router.get('/', async (req, res) => {
  const { grade } = req.query;
  console.log(`Fetching students with grade filter: ${grade || 'none'}`);
  try {
    const query = grade ? { grade: parseInt(grade) } : {};
    const students = await Student.find(query);
    res.json({ message: 'Students fetched successfully', students });
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ message: 'Failed to fetch students', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  console.log(`Fetching student with ID: ${req.params.id}`);
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      console.log(`Student with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student fetched successfully', student });
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ message: 'Failed to fetch student', error: err.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  console.log(`Deleting student with ID: ${req.params.id}`);
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      console.log(`Student with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ message: 'Failed to delete student', error: err.message });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Student route is working' });
});

module.exports = router;