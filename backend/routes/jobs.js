const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, requireDeletionPermission } = require('../middleware/auth');

// Public routes (no authentication required) - must be before authenticateToken middleware
router.get('/public/:id', jobController.jobDetails);

// All other routes require authentication
router.use(authenticateToken);

router.get('/test', jobController.testEndpoint);
router.post('/', jobController.addJob);
router.get('/', jobController.listJobs);
router.get('/:id', jobController.jobDetails);
router.put('/:id', jobController.updateJob);
router.get('/:jobId/suitable-candidates', jobController.findSuitableCandidates);
router.post('/:jobId/suitable-candidates', jobController.findSuitableCandidates);
router.delete('/:jobId', requireDeletionPermission, jobController.deleteJob);

module.exports = router;
