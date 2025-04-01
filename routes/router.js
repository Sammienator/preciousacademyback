const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TestResult = require('../models/TestResult');
const Student = require('../models/Student');

// Secret key for JWT (store in an environment variable in production)
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register user.', error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'Login successful.', token });
  } catch (err) {
    res.status(500).json({ message: 'Failed to login.', error: err.message });
  }
});

// Protect all existing routes
router.get('/:id/test-results', authenticateToken, async (req, res) => {
  try {
    const testResults = await TestResult.find({ studentId: req.params.id });
    res.json({ message: 'Test results fetched successfully', testResults });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch test results', error: err.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const { grade, term } = req.query;
  try {
    let query = {};

    if (grade) {
      const students = await Student.find({ grade: parseInt(grade) }).select('_id');
      const studentIds = students.map((s) => s._id);
      query.studentId = { $in: studentIds };
    }

    if (term) {
      query.term = term;
    }

    const testResults = await TestResult.find(query).populate('studentId', 'name grade');
    res.json({ message: 'All test results fetched successfully', testResults });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all test results', error: err.message });
  }
});

router.post('/:id/test-results', authenticateToken, async (req, res) => {
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

router.get('/reports/grade-summary', authenticateToken, async (req, res) => {
  const { type, term } = req.query;

  try {
    const grades = await Student.distinct('grade');
    const summary = [];

    for (const grade of grades) {
      const students = await Student.find({ grade }).select('_id');
      const studentIds = students.map((s) => s._id);

      if (type === 'scores') {
        const query = { studentId: { $in: studentIds } };
        if (term) query.term = term;

        const testResults = await TestResult.find(query);
        const totalScores = testResults.reduce((acc, result) => {
          const subjects = result.subjects;
          const avgStudentScore =
            (subjects.maths + subjects.english + subjects.science + subjects.history + subjects.geography) / 5;
          return acc + avgStudentScore;
        }, 0);

        const avgGrade = testResults.length ? (totalScores / testResults.length).toFixed(2) : 'N/A';
        summary.push({ grade, avgGrade });
      } else if (type === 'fees') {
        const feeStatus = { paid: 0, partial: 0, unpaid: 0 };
        for (const student of students) {
          const status = student.feeStatus || 'unpaid';
          feeStatus[status] = (feeStatus[status] || 0) + 1;
        }
        summary.push({ grade, feeStatus });
      }
    }

    res.json({ message: 'Grade summary fetched successfully', summary });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch grade summary', error: err.message });
  }
});

module.exports = router;