const express = require('express');
const router = express.Router();
const clientTrackingController = require('../controllers/clientTrackingController');
const { authenticateToken } = require('../middleware/auth');

// Route to generate a client tracking link for a specific job
// This should be a protected route, only accessible by authenticated users (e.g., recruiters)
router.post('/generate-link/:jobId', authenticateToken, clientTrackingController.generateClientTrackingLink);

// Route to get candidate data for a given client tracking token
// This should be an unprotected route, accessible by anyone with the link
router.get('/candidates/:trackingToken', clientTrackingController.getCandidatesForClientTracking);

// Route to update candidate status and feedback from the client tracking page
// This should also be an unprotected route, as clients will not be authenticated
router.put('/candidate-status/:candidateJobLinkId', clientTrackingController.updateClientCandidateStatus);

module.exports = router;

