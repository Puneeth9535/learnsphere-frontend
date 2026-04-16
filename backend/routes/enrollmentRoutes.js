const express = require('express');
const router = express.Router();
const { enrollCourse, getMyEnrollments, checkEnrollment, getAllEnrollments } = require('../controllers/enrollmentController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, enrollCourse);
router.get('/my', protect, getMyEnrollments);
router.get('/check/:courseId', protect, checkEnrollment);
router.get('/admin/all', protect, admin, getAllEnrollments);

module.exports = router;
