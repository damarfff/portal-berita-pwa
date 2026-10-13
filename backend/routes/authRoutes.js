const express = require('express');
const router = express.Router();
const { register, login, resetPassword, getProfile } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateUser, getProfile);

module.exports = router;
