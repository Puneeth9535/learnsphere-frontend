const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, default: () => uuidv4(), unique: true },
  issuedAt: { type: Date, default: Date.now },
  studentName: { type: String, required: true },
  courseName: { type: String, required: true },
  instructorName: { type: String }
});

module.exports = mongoose.model('Certificate', certificateSchema);
