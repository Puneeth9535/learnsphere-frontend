const Module = require('../models/Module');
const Course = require('../models/Course');
const Video = require('../models/Video');

const createModule = async (req, res) => {
  try {
    const module = await Module.create(req.body);
    await Course.findByIdAndUpdate(req.body.course, { $push: { modules: module._id } });
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    await Video.deleteMany({ module: req.params.id });
    await Course.findByIdAndUpdate(module.course, { $pull: { modules: req.params.id } });
    await module.deleteOne();
    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId })
      .populate('videos').sort({ order: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createModule, updateModule, deleteModule, getModulesByCourse };
