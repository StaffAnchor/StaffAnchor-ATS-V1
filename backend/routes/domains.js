const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/public', domainController.getPublicDomains);
router.get('/public/:domainId/talent-pools', domainController.getPublicTalentPoolsByDomain);
router.get('/public/skills/by-talent-pools', domainController.getPublicSkillsByTalentPools);

// All other routes require authentication
router.use(authenticateToken);

// Get all domains
router.get('/', domainController.getAllDomains);

// Get domain by ID with talent pools and skills
router.get('/:id', domainController.getDomainById);

// Get talent pools by domain ID
router.get('/:domainId/talent-pools', domainController.getTalentPoolsByDomain);

// Get skills by talent pool IDs
router.get('/skills/by-talent-pools', domainController.getSkillsByTalentPools);

// Create new domain
router.post('/', domainController.createDomain);

// Update domain
router.put('/:id', domainController.updateDomain);

// Delete domain
router.delete('/:id', domainController.deleteDomain);

module.exports = router;

