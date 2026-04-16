const Video = require('../models/Video');
const Module = require('../models/Module');

const createVideo = async (req, res) => {
  try {
    const video = await Video.create(req.body);
    await Module.findByIdAndUpdate(req.body.module, { $push: { videos: video._id } });
    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    await Module.findByIdAndUpdate(video.module, { $pull: { videos: req.params.id } });
    await video.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createVideo, updateVideo, deleteVideo };
