const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// Generate certificate
router.post('/generate', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const progress = await Progress.findOne({ userId: req.user._id, courseId });
    if (!progress || progress.progressPercent < 100) {
      return res.status(400).json({ message: 'Complete the course first' });
    }
    const existing = await Certificate.findOne({ userId: req.user._id, courseId });
    if (existing) return res.json(existing);
    const course = await Course.findById(courseId);
    const cert = await Certificate.create({
      userId: req.user._id, courseId,
      studentName: req.user.name, courseName: course.title, instructorName: course.instructor
    });
    res.status(201).json(cert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my certificates
router.get('/my', protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id }).populate('courseId', 'title instructor thumbnail');
    res.json(certs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id })
      .populate('userId', 'name').populate('courseId', 'title instructor');
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json(cert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
