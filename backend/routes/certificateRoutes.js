const express = require('express');
const router = express.Router();
const { generateCertificate, getMyCertificates, verifyCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateCertificate);
router.get('/my', protect, getMyCertificates);
router.get('/verify/:id', verifyCertificate);

module.exports = router;
