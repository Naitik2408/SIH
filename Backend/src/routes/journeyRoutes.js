const express = require('express');
const router = express.Router();
const {
    createJourney,
    getUserJourneys,
    getJourneyAnalytics,
    getScientistData,
    deleteJourney
} = require('../controllers/journeyController');
const { protect } = require('../middleware/authMiddleware');

// Create a new journey (requires authentication)
router.post('/', protect, createJourney);

// Get user's journey history (requires authentication)
router.get('/my-journeys', protect, getUserJourneys);

// Get journey analytics for dashboard (requires authentication)
router.get('/analytics', protect, getJourneyAnalytics);

// Get journey data for scientist visualization (public for scientist access)
router.get('/scientist-data', getScientistData);

// Delete a specific journey (requires authentication)
router.delete('/:journeyId', protect, deleteJourney);

module.exports = router;