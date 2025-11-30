const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { authenticateToken, requireDeletionPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes (no authentication required)
router.post('/public/apply/:jobId', candidateController.submitPublicJobApplication);
router.post('/:candidateId/resume/public', upload.single('resume'), candidateController.uploadResume);

// All other routes require authentication
router.use(authenticateToken);

// Resume parsing route (must be before generic routes)
router.post('/parse-resume', upload.single('resume'), candidateController.parseResume);

// Get candidates who applied to a specific job
router.get('/job/:jobId/applicants', candidateController.getCandidatesByJobApplication);

router.post('/', candidateController.addCandidate);
router.get('/', candidateController.listCandidates);
router.get('/:id', candidateController.candidateDetails);
router.put('/:id', candidateController.updateCandidate);
router.get('/:candidateId/suitable-jobs', candidateController.findSuitableJobs);
router.delete('/:candidateId', requireDeletionPermission, candidateController.deleteCandidate);

// Resume upload routes
router.post('/:candidateId/resume', upload.single('resume'), candidateController.uploadResume);
router.delete('/:candidateId/resume', candidateController.deleteResumeOnly);

module.exports = router;
