const express = require('express');
const router = express.Router();
const talentPoolController = require('../controllers/talentPoolController');
const { authenticateToken, requireDeletionPermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Talent pool CRUD operations
router.post('/', talentPoolController.createTalentPool);
router.get('/', talentPoolController.getTalentPools);
router.get('/:id', talentPoolController.getTalentPool);
router.put('/:id', talentPoolController.updateTalentPool);
router.delete('/:id', requireDeletionPermission, talentPoolController.deleteTalentPool);

// Candidate management in talent pools
router.post('/:id/candidates', talentPoolController.addCandidateToPool);
router.delete('/:id/candidates', talentPoolController.removeCandidateFromPool);

module.exports = router;
