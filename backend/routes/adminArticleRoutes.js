const express = require('express');
const router = express.Router();
const { 
  getAllArticlesAdmin, 
  createArticle, 
  updateArticle, 
  publishArticle, 
  deleteArticle 
} = require('../controllers/articleController');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', authenticateAdmin, getAllArticlesAdmin);
router.post('/', authenticateAdmin, upload.single('thumbnailFile'), createArticle);
router.put('/:id', authenticateAdmin, upload.single('thumbnailFile'), updateArticle);
router.patch('/:id/publish', authenticateAdmin, publishArticle);
router.delete('/:id', authenticateAdmin, deleteArticle);

module.exports = router;