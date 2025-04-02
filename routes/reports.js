const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const TestResult = require('../models/TestResult');
const Fee = require('../models/Fee');

router.get('/grade-summary', async (req, res) => {
  const { type, term } = req.query;
  try {
    const grades = await Student.distinct('grade');
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
        return null;
      })
    );

    const filteredSummary = summary.filter((item) => item !== null);
    res.json({ message: 'Summary fetched successfully', summary: filteredSummary });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
  }
});

module.exports = router;