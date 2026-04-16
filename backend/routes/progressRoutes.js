const express = require('express');
const router = express.Router();
const { markVideoCompleted, getCourseProgress, getMyProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.post('/complete', protect, markVideoCompleted);
router.get('/my', protect, getMyProgress);
router.get('/:courseId', protect, getCourseProgress);

module.exports = router;
