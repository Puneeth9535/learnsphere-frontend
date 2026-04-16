const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// Enroll in course — POST /enrollments (frontend sends { courseId })
router.post('/', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });
    const enrollment = await Enrollment.create({ userId: req.user._id, courseId, paymentStatus: 'free' });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: courseId } });
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });
    // Create initial progress record
    const existing_progress = await Progress.findOne({ userId: req.user._id, courseId });
    if (!existing_progress) {
      await Progress.create({ userId: req.user._id, courseId, completedVideos: [], completedModules: [], progressPercent: 0 });
    }
    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Keep legacy /enroll endpoint too
router.post('/enroll', protect, async (req, res) => {
  req.url = '/';
  router.handle(req, res);
});

// Get my enrollments — frontend expects { course: { _id, title, thumbnail, ... } }
router.get('/my', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate({ path: 'courseId', populate: { path: 'modules', populate: { path: 'videos' } } });
    // Map courseId → course so frontend can use enrollment.course
    const mapped = enrollments.map(e => ({
      ...e.toObject(),
      course: e.courseId,
      enrolledAt: e.enrolledAt,
    }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Check enrollment
router.get('/check/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: req.params.courseId });
    res.json({ isEnrolled: !!enrollment, enrollment });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: all enrollments
router.get('/admin/all', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email').populate('courseId', 'title');
    res.json(enrollments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Legacy /all endpoint
router.get('/all', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('userId', 'name email').populate('courseId', 'title');
    res.json(enrollments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
