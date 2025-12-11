const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// Get all jobs with analytics summary
router.get('/jobs', authenticateToken, analyticsController.getJobsWithAnalytics);

// Get list of companies for filtering
router.get('/companies', authenticateToken, analyticsController.getCompanies);

// Get detailed analytics for a specific job
router.get('/job/:jobId', authenticateToken, analyticsController.getJobAnalytics);

// Generate AI performance report for a job
router.post('/job/:jobId/report', authenticateToken, analyticsController.generatePerformanceReport);

module.exports = router;

