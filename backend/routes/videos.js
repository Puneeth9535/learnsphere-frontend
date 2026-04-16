const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Module = require('../models/Module');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const video = await Video.create(req.body);
    await Module.findByIdAndUpdate(req.body.moduleId, { $push: { videos: video._id } });
    res.status(201).json(video);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(video);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    await Module.findByIdAndUpdate(video.moduleId, { $pull: { videos: video._id } });
    res.json({ message: 'Video deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
