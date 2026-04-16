const express = require('express');
const router  = express.Router();
const { createOrder, verifyPayment, checkout } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);   // Step 1: create Razorpay order
router.post('/verify',       protect, verifyPayment); // Step 2: verify & enroll
router.post('/checkout',     protect, checkout);      // Free course enroll

module.exports = router;