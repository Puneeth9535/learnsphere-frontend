const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  instructor: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  thumbnail: { type: String, default: '' },
  price: { type: Number, required: true, default: 0 },
  isFree: { type: Boolean, default: false },
  category: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: '0h 0m' },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  totalStudents: { type: Number, default: 0 },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  tags: [String],
  language: { type: String, default: 'English' },
  isPublished: { type: Boolean, default: true },
  requirements: [String],
  whatYouLearn: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
