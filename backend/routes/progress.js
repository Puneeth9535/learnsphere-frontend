const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');

// Get my progress (all courses) — used by student dashboard
router.get('/my', protect, async (req, res) => {
  try {
    const progressList = await Progress.find({ userId: req.user._id })
      .populate('courseId', 'title thumbnail');
    const mapped = progressList.map(p => ({
      ...p.toObject(),
      course: p.courseId,
      progressPercentage: p.progressPercent,
      isCompleted: p.isCompleted || false,
    }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Mark video as complete — POST /progress/complete
router.post('/complete', protect, async (req, res) => {
  try {
    const { courseId, videoId } = req.body;
    const course = await Course.findById(courseId)
      .populate({ path: 'modules', populate: { path: 'videos' } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let progress = await Progress.findOne({ userId: req.user._id, courseId });
    if (!progress) progress = await Progress.create({ userId: req.user._id, courseId });

    const vidIdStr = videoId.toString();
    if (!progress.completedVideos.map(id => id.toString()).includes(vidIdStr)) {
      progress.completedVideos.push(videoId);
    }
    progress.lastWatched = videoId;

    const totalVideos = course.modules.reduce((acc, m) => acc + m.videos.length, 0);
    progress.progressPercent = totalVideos > 0
      ? Math.round((progress.completedVideos.length / totalVideos) * 100)
      : 0;

    for (const module of course.modules) {
      const allDone = module.videos.every(v =>
        progress.completedVideos.map(id => id.toString()).includes(v._id.toString())
      );
      if (allDone && !progress.completedModules.map(id => id.toString()).includes(module._id.toString())) {
        progress.completedModules.push(module._id);
      }
    }

    if (progress.progressPercent === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }
    progress.updatedAt = Date.now();
    await progress.save();

    res.json({
      ...progress.toObject(),
      progressPercentage: progress.progressPercent,
      isCompleted: progress.isCompleted || false,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get progress for a specific course
router.get('/:courseId', protect, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user._id, courseId: req.params.courseId });
    if (!progress) progress = await Progress.create({ userId: req.user._id, courseId: req.params.courseId });
    res.json({
      ...progress.toObject(),
      progressPercentage: progress.progressPercent,
      isCompleted: progress.isCompleted || false,
      completedVideos: progress.completedVideos || [],
      completedModules: progress.completedModules || [],
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;