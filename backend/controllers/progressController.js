const Progress = require('../models/Progress');
const Module = require('../models/Module');
const Video = require('../models/Video');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { v4: uuidv4 } = require('crypto');

// Mark video as completed
const markVideoCompleted = async (req, res) => {
  try {
    const { courseId, videoId } = req.body;
    let progress = await Progress.findOne({ student: req.user._id, course: courseId });
    if (!progress) {
      progress = await Progress.create({ student: req.user._id, course: courseId });
    }

    if (!progress.completedVideos.includes(videoId)) {
      progress.completedVideos.push(videoId);
    }
    progress.lastWatched = videoId;

    // Calculate progress percentage
    const course = await require('../models/Course').findById(courseId)
      .populate({ path: 'modules', populate: { path: 'videos' } });
    
    const totalVideos = course.modules.reduce((sum, m) => sum + m.videos.length, 0);
    const completedCount = progress.completedVideos.length;
    progress.progressPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

    // Check completed modules
    for (const module of course.modules) {
      const allVideosCompleted = module.videos.every(v => 
        progress.completedVideos.map(id => id.toString()).includes(v._id.toString())
      );
      if (allVideosCompleted && !progress.completedModules.includes(module._id)) {
        progress.completedModules.push(module._id);
      }
    }

    // Check if course complete
    if (progress.progressPercentage === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course progress
const getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
    res.json(progress || { progressPercentage: 0, completedVideos: [], completedModules: [], isCompleted: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all progress for a student
const getMyProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ student: req.user._id })
      .populate('course', 'title thumbnail');
    res.json(progressList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markVideoCompleted, getCourseProgress, getMyProgress };
