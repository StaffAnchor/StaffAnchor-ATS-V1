const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// POST /api/email/preview - Preview email before sending
router.post('/preview', emailController.previewEmail);

// POST /api/email/send - Send confirmed email
router.post('/send', emailController.sendConfirmedEmail);

// POST /api/email/test - Test email configuration
router.post('/test', emailController.testEmailConfig);

module.exports = router;

