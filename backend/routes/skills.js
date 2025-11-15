const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { authenticateToken, requireDeletionPermission } = require('../middleware/auth');

// Public route for getting all skills (no authentication required)
router.get('/public', skillController.getPublicSkills);

// All other routes require authentication
router.use(authenticateToken);

// GET routes (accessible to all authenticated users)
router.get('/', skillController.getSkills);
router.get('/categories', skillController.getSkillCategories);
router.get('/popular', skillController.getPopularSkills);

// POST, PUT routes accessible to all authenticated users
router.post('/', skillController.createSkill);
router.put('/:id', skillController.updateSkill);

// DELETE route requires admin access
router.delete('/:id', requireDeletionPermission, skillController.deleteSkill);

module.exports = router;
