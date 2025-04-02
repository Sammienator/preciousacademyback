const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const Student = require('../models/Student');

// Log to confirm file loading
console.log('TestResults routes file loaded');

// Get test results for a specific student
router.get('/:id/test-results', async (req, res) => {
  console.log(`Fetching test results for student ID: ${req.params.id}`);
  try {
    const testResults = await TestResult.find({ studentId: req.params.id });
    res.json({ message: 'Test results fetched successfully', testResults });
  } catch (err) {
    console.error('Error fetching test results:', err);
    res.status(500).json({ message: 'Failed to fetch test results', error: err.message });
  }
});

// Get all test results with student details
router.get('/', async (req, res) => {
  const { grade, term } = req.query;
  console.log(`Fetching all test results with grade: ${grade || 'none'}, term: ${term || 'none'}`);
  try {
    let query = {};
    if (grade) {
      const students = await Student.find({ grade: parseInt(grade) }).select('_id');
      const studentIds = students.map((s) => s._id);
      query.studentId = { $in: studentIds };
    }
    if (term) query.term = term;

    const testResults = await TestResult.find(query).populate('studentId', 'name grade');
    res.json({ message: 'All test results fetched successfully', testResults });
  } catch (err) {
    console.error('Error fetching all test results:', err);
    res.status(500).json({ message: 'Failed to fetch all test results', error: err.message });
  }
});

// Add or update test result
router.post('/:id/test-results', async (req, res) => {
  const { term, subjects } = req.body;
  console.log(`Adding/updating test result for student ID: ${req.params.id}, term: ${term}`);
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      console.log(`Student with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Student not found' });
    }

    const existingResult = await TestResult.findOne({ studentId: req.params.id, term });
    if (existingResult) {
      existingResult.subjects = subjects;
      await existingResult.save();
      res.json({ message: 'Test result updated successfully', testResult: existingResult });
    } else {
      const testResult = new TestResult({ studentId: req.params.id, term, subjects });
      const savedResult = await testResult.save();
      res.status(201).json({ message: 'Test result added successfully', testResult: savedResult });
    }
  } catch (err) {
    console.error('Error saving test result:', err);
    res.status(400).json({ message: 'Failed to save test result', error: err.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'TestResults route is working' });
});

module.exports = router;