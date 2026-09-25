const express = require('express');
const router = express.Router();
const { 
  getPreferences, 
  updatePreferences,
  getCategoryPreferences,
  updateCategoryPreferences
} = require('../controllers/preferenceController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', authenticateUser, getPreferences);
router.put('/', authenticateUser, updatePreferences);
router.get('/categories', authenticateUser, getCategoryPreferences);
router.put('/categories', authenticateUser, updateCategoryPreferences);

module.exports = router;