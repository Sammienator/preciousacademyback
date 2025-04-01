const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Get notes for a student
router.get('/:id/notes', async (req, res) => {
  try {
    const notes = await Note.find({ studentId: req.params.id });
    res.json({ message: 'Notes fetched successfully', notes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
});

// Add a note
router.post('/:id/notes', async (req, res) => {
  const { content } = req.body;
  try {
    const note = new Note({ studentId: req.params.id, content });
    const savedNote = await note.save();
    res.status(201).json({ message: 'Note added successfully', note: savedNote });
  } catch (err) {
    res.status(400).json({ message: 'Failed to add note', error: err.message });
  }
});

module.exports = router;