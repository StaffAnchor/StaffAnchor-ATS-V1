const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Public routes - no authentication needed for location data
router.get('/countries', locationController.getCountries);
router.post('/states', locationController.getStates);
router.post('/cities', locationController.getCities);

module.exports = router;


