const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const mod = await Module.create(req.body);
    await Course.findByIdAndUpdate(req.body.courseId, { $push: { modules: mod._id } });
    res.status(201).json(mod);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const mod = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(mod);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const mod = await Module.findByIdAndDelete(req.params.id);
    await Course.findByIdAndUpdate(mod.courseId, { $pull: { modules: mod._id } });
    res.json({ message: 'Module deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
