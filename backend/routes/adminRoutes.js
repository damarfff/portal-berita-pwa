const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.get('/me', authenticateAdmin, getAdminProfile);

module.exports = router;