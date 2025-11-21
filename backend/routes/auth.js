const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/validate', authenticateToken, authController.validateToken);
router.get('/subordinates', authController.listSubordinates);
router.delete('/subordinates/:id', authenticateToken, authController.deleteSubordinate);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
