const express = require('express');
const router = express.Router();
const { createCategory, deleteCategory } = require('../controllers/categoryController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

router.post('/', authenticateAdmin, createCategory);
router.delete('/:id', authenticateAdmin, deleteCategory);

module.exports = router;