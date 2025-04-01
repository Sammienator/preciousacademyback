const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const Student = require('../models/Student');

// Get test results for a specific student
router.get('/:id/test-results', async (req, res) => {
  try {
    const testResults = await TestResult.find({ studentId: req.params.id });
    res.json({ message: 'Test results fetched successfully', testResults });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test results', error: err.message });
  }
});

// Get all test results with student details (Updated to filter by term)
router.get('/', async (req, res) => {
  const { grade, term } = req.query; // Added term to query params
  try {
    let query = {};

    // Filter by grade if provided
    if (grade) {
      const students = await Student.find({ grade: parseInt(grade) }).select('_id');
      const studentIds = students.map((s) => s._id);
      query.studentId = { $in: studentIds };
    }

    // Filter by term if provided
    if (term) {
      query.term = term; // Matches "Term 1", "Term 2", or "Term 3" from frontend
    }

    const testResults = await TestResult.find(query).populate('studentId', 'name grade');
    res.json({ message: 'All test results fetched successfully', testResults });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all test results', error: err.message });
  }
});

// Add or update test result
router.post('/:id/test-results', async (req, res) => {
  const { term, subjects } = req.body;
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const existingResult = await TestResult.findOne({ studentId: req.params.id, term });
    if (existingResult) {
      existingResult.subjects = subjects;
      await existingResult.save();
      res.json({ message: 'Test result updated successfully', testResult: existingResult });
    } else {
      const testResult = new TestResult({
        studentId: req.params.id,
        term,
        subjects,
      });
      const savedResult = await testResult.save();
      res.status(201).json({ message: 'Test result added successfully', testResult: savedResult });
    }
  } catch (err) {
    res.status(400).json({ message: 'Failed to save test result', error: err.message });
  }
});

module.exports = router;