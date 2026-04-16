const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');

// Enroll in free course
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existingEnrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existingEnrollment) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = await Enrollment.create({
      student: req.user._id, course: courseId,
      paymentStatus: course.isFree || course.price === 0 ? 'free' : 'pending'
    });

    // Add to user enrolled courses
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: courseId } });
    // Add to course enrolled students
    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
    // Create progress record
    await Progress.create({ student: req.user._id, course: courseId });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student enrollments
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({ path: 'course', populate: { path: 'modules' } });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if enrolled
const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    res.json({ isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all enrollments
const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('student', 'name email')
      .populate('course', 'title price')
      .sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { enrollCourse, getMyEnrollments, checkEnrollment, getAllEnrollments };
