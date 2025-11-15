const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all comments for a candidate
router.get('/candidate/:candidateId', commentController.getCandidateComments);

// Add a comment to a candidate
router.post('/candidate/:candidateId', commentController.addComment);

// Update a comment
router.put('/:commentId', commentController.updateComment);

// Delete a comment
router.delete('/:commentId', commentController.deleteComment);

module.exports = router;

