const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments({});
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Enrollment.countDocuments({});
    const paidEnrollments = await Enrollment.countDocuments({ paymentStatus: 'paid' });
    const recentEnrollments = await Enrollment.find({})
      .populate('student', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 }).limit(10);
    const recentStudents = await User.find({ role: 'student' })
      .select('-password').sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: { totalStudents, totalCourses, publishedCourses, totalEnrollments, paidEnrollments },
      recentEnrollments, recentStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, deleteUser, updateUserRole };
