const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Log to confirm file loading
console.log('Notes routes file loaded');

// Get notes for a student
router.get('/:id/notes', async (req, res) => {
  console.log(`Fetching notes for student ID: ${req.params.id}`);
  try {
    const notes = await Note.find({ studentId: req.params.id });
    res.json({ message: 'Notes fetched successfully', notes });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
});

// Add a note
router.post('/:id/notes', async (req, res) => {
  const { content } = req.body;
  console.log(`Adding note for student ID: ${req.params.id}, content: ${content}`);
  try {
    const note = new Note({ studentId: req.params.id, content });
    const savedNote = await note.save();
    res.status(201).json({ message: 'Note added successfully', note: savedNote });
  } catch (err) {
    console.error('Error adding note:', err);
    res.status(400).json({ message: 'Failed to add note', error: err.message });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Notes route is working' });
});

module.exports = router;