const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get active banners (all authenticated users)
router.get('/active', authenticateToken, bannerController.getActiveBanners);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, bannerController.createBanner);
router.get('/', authenticateToken, requireAdmin, bannerController.getAllBanners);
router.put('/:id', authenticateToken, requireAdmin, bannerController.updateBanner);
router.delete('/:id', authenticateToken, requireAdmin, bannerController.deleteBanner);

module.exports = router;





