const express = require('express');
const router = express.Router();
const { createModule, updateModule, deleteModule, getModulesByCourse } = require('../controllers/moduleController');
const { protect, admin } = require('../middleware/auth');

router.get('/course/:courseId', protect, getModulesByCourse);
router.post('/', protect, admin, createModule);
router.put('/:id', protect, admin, updateModule);
router.delete('/:id', protect, admin, deleteModule);

module.exports = router;
