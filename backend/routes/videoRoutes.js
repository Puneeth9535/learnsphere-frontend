const express = require('express');
const router = express.Router();
const { createVideo, updateVideo, deleteVideo } = require('../controllers/videoController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, admin, createVideo);
router.put('/:id', protect, admin, updateVideo);
router.delete('/:id', protect, admin, deleteVideo);

module.exports = router;
