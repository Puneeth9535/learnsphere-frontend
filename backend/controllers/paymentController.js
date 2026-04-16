const crypto = require('crypto');
const { Enrollment, Progress } = require('../models/index');
const Course = require('../models/Course');
const User   = require('../models/User');

// Check if real Razorpay keys are configured
const IS_LIVE = process.env.RAZORPAY_KEY_ID &&
                !process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY');

if (!IS_LIVE) {
  console.log('⚡ Payments running in DEMO MODE — auto-enroll, no real charges');
} else {
  console.log('✅ Razorpay LIVE mode — real payments active');
}

/* ──────────────────────────────────────────────────────────────
   POST /api/payments/create-order
   DEMO : returns fake order instantly
   LIVE : creates real Razorpay order
────────────────────────────────────────────────────────────── */
const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.isFree || course.price === 0)
      return res.status(400).json({ message: 'This course is free — use direct enroll' });

    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

    // ── DEMO MODE ──────────────────────────────────────────
    if (!IS_LIVE) {
      return res.json({
        demo:     true,
        orderId:  `demo_order_${Date.now()}`,
        amount:   Math.round(course.price * 100),
        currency: 'INR',
        keyId:    'demo',
        course:   { title: course.title, thumbnail: course.thumbnail || '', price: course.price },
      });
    }

    // ── LIVE MODE ──────────────────────────────────────────
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount:   Math.round(course.price * 100),
      currency: 'INR',
      receipt:  `ls_${courseId}_${Date.now()}`,
      notes: {
        courseId: courseId.toString(),
        userId:   req.user._id.toString(),
        course:   course.title,
      },
    });

    res.json({
      demo:     false,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
      course:   { title: course.title, thumbnail: course.thumbnail || '', price: course.price },
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ──────────────────────────────────────────────────────────────
   POST /api/payments/verify
   DEMO : skips signature, enrolls directly
   LIVE : verifies HMAC-SHA256 signature, then enrolls
────────────────────────────────────────────────────────────── */
const verifyPayment = async (req, res) => {
  try {
    const {
      courseId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      demo,
    } = req.body;

    // ── LIVE: verify signature (tamper-proof) ──────────────
    if (IS_LIVE && !demo) {
      const body     = razorpay_order_id + '|' + razorpay_payment_id;
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
      if (expected !== razorpay_signature)
        return res.status(400).json({ message: 'Invalid payment signature — verification failed' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Guard duplicate enrollment
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });

    // Create enrollment (matches schema: userId / courseId)
    const enrollment = await Enrollment.create({
      userId:         req.user._id,
      courseId:       courseId,
      enrollmentType: 'paid',
      paymentId:      razorpay_payment_id || `demo_pay_${Date.now()}`,
      amountPaid:     course.price,
      status:         'active',
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: courseId, purchasedCourses: courseId },
    });
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: req.user._id },
    });
    await Progress.create({
      userId:           req.user._id,
      courseId:         courseId,
      completedVideos:  [],
      completedModules: [],
      progressPercent:  0,
    });

    res.json({ success: true, message: 'Enrolled successfully!', enrollment });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* POST /api/payments/checkout — free course / direct enroll */
const checkout = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = await Enrollment.create({
      userId: req.user._id, courseId,
      enrollmentType: 'free', status: 'active',
    });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: courseId } });
    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
    await Progress.create({
      userId: req.user._id, courseId,
      completedVideos: [], completedModules: [], progressPercent: 0,
    });

    res.json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, checkout };