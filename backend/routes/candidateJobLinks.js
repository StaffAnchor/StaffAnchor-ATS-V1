const express = require('express');
const router = express.Router();
const candidateJobLinkController = require('../controllers/candidateJobLinkController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Link candidates to a job
router.post('/link', candidateJobLinkController.linkCandidatesToJob);

// Get all candidates linked to a job
router.get('/job/:jobId/candidates', candidateJobLinkController.getLinkedCandidates);

// Get all jobs linked to a candidate
router.get('/candidate/:candidateId/jobs', candidateJobLinkController.getLinkedJobs);

// Update link status
router.patch('/link/:linkId', candidateJobLinkController.updateLinkStatus);

// Unlink candidate from job
router.delete('/link/:linkId', candidateJobLinkController.unlinkCandidateFromJob);

module.exports = router;

