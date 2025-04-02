const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const TestResult = require('../models/TestResult');
const Fee = require('../models/Fee');

// Log to confirm the route file is loaded
console.log('Reports route loaded');

router.get('/grade-summary', async (req, res) => {
  const { type, term } = req.query;

  // Log incoming request for debugging
  console.log(`Received request for /grade-summary with type=${type}, term=${term}`);

  try {
    const grades = await Student.distinct('grade');
    if (!grades || grades.length === 0) {
      return res.status(404).json({ message: 'No grades found in the database' });
    }

    const summary = await Promise.all(
      grades.map(async (grade) => {
        const students = await Student.find({ grade });
        const studentIds = students.map((s) => s._id);

        if (type === 'scores') {
          const query = { studentId: { $in: studentIds } };
          if (term) query.term = term;
          const testResults = await TestResult.find(query);

          const avgGrade = testResults.length
            ? (
                testResults.reduce((sum, tr) => {
                  const avgSubject =
                    (tr.subjects.maths +
                      tr.subjects.english +
                      tr.subjects.science +
                      tr.subjects.history +
                      tr.subjects.geography) /
                    5;
                  return sum + avgSubject;
                }, 0) / testResults.length
              ).toFixed(2)
            : 0;

          return { grade, avgGrade };
        } else if (type === 'fees') {
          const query = { studentId: { $in: studentIds } };
          if (term) query.term = term;
          const fees = await Fee.find(query);

          const feeStatus = {
            paid: fees.filter((f) => f.status === 'Paid').length,
            partial: fees.filter((f) => f.status === 'Partial').length,
            unpaid: fees.filter((f) => f.status === 'Unpaid').length,
          };

          return { grade, feeStatus };
        }
        // Return null for invalid type to filter out later
        return null;
      })
    );

    const filteredSummary = summary.filter((item) => item !== null);
    if (filteredSummary.length === 0) {
      return res.status(400).json({ message: 'Invalid or unsupported type parameter' });
    }

    res.json({ message: 'Summary fetched successfully', summary: filteredSummary });
  } catch (err) {
    console.error('Error in /grade-summary:', err);
    res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
  }
});

// Add a test route for debugging
router.get('/test', (req, res) => {
  res.json({ message: 'Reports route is working' });
});

module.exports = router;