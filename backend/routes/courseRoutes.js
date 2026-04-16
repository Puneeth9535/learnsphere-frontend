const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, getAllCourses } = require('../controllers/courseController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getCourses);
router.get('/admin/all', protect, admin, getAllCourses);
router.get('/:id', getCourseById);
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

module.exports = router;
