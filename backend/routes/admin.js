const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const revenue = await Enrollment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    res.json({
      totalUsers, totalCourses, totalEnrollments,
      totalRevenue: revenue[0]?.total || 0
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('enrolledCourses', 'title');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
