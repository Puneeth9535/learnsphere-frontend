const Certificate = require('../models/Certificate');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Course = require('../models/Course');
const crypto = require('crypto');

// Generate certificate
const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const progress = await Progress.findOne({ student: req.user._id, course: courseId });
    
    if (!progress || !progress.isCompleted) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }

    const existingCert = await Certificate.findOne({ student: req.user._id, course: courseId });
    if (existingCert) return res.json(existingCert);

    const course = await Course.findById(courseId);
    const user = await User.findById(req.user._id);

    const cert = await Certificate.create({
      student: req.user._id,
      course: courseId,
      studentName: user.name,
      courseName: course.title,
      certificateId: crypto.randomBytes(8).toString('hex').toUpperCase(),
      completionDate: progress.completedAt || new Date()
    });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { certificates: cert._id } });
    res.status(201).json(cert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student certificates
const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user._id })
      .populate('course', 'title thumbnail instructor');
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify certificate
const verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id })
      .populate('student', 'name')
      .populate('course', 'title');
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    res.json(cert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateCertificate, getMyCertificates, verifyCertificate };
