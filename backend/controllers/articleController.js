const prisma = require('../prisma');
const fs = require('fs');
const path = require('path');

const generateSlug = (judul) => {
  return judul
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 200);
};

const deleteOldThumbnail = (thumbnailUrl) => {
  if (!thumbnailUrl) return;
  if (!thumbnailUrl.startsWith('/uploads/')) return;
  
  const filePath = path.join(__dirname, '..', thumbnailUrl);
  fs.unlink(filePath, (err) => {
    if (err) console.error('Error deleting thumbnail:', err);
  });
};

const getPublishedArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        judul: true,
        slug: true,
        isi: true,
        thumbnailUrl: true,
        publisherName: true,
        publishedAt: true,
        category: {
          select: { id: true, nama: true, slug: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    });

    res.json({
      message: 'Artikel berhasil diambil',
      articles
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, nama: true, slug: true }
        },
        admin: {
          select: { id: true, nama: true }
        }
      }
    });

    if (!article || article.status !== 'published') {
      return res.status(404).json({ 
        message: 'Artikel tidak ditemukan' 
      });
    }

    res.json({
      message: 'Artikel berhasil diambil',
      article
    });

  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const getAllArticlesAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status === 'draft' || status === 'published') {
      where.status = status;
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: {
          select: { id: true, nama: true }
        },
        admin: {
          select: { id: true, nama: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      message: 'Artikel berhasil diambil',
      articles
    });

  } catch (error) {
    console.error('Get admin articles error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const createArticle = async (req, res) => {
  try {
    const { judul, isi, categoryId, thumbnailUrl, status, publisherName } = req.body;
    const adminId = req.admin.adminId;

    if (!judul || !isi || !categoryId) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: 'Judul, isi, dan kategori wajib diisi' 
      });
    }

    if (status && status !== 'draft' && status !== 'published') {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: 'Status harus draft atau published' 
      });
    }

    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: 'Kategori tidak ditemukan' 
      });
    }

    let slug = generateSlug(judul);
    const existingSlug = await prisma.article.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    let finalThumbnailUrl = null;
    if (req.file) {
      finalThumbnailUrl = `/uploads/${req.file.filename}`;
    } else if (thumbnailUrl && thumbnailUrl.trim() !== '') {
      finalThumbnailUrl = thumbnailUrl.trim();
    }

    const articleStatus = status || 'draft';
    const publishedAt = articleStatus === 'published' ? new Date() : null;
    
    const finalPublisherName = (publisherName && publisherName.trim() !== '') 
      ? publisherName.trim() 
      : null;

    const article = await prisma.article.create({
      data: {
        judul,
        slug,
        isi,
        thumbnailUrl: finalThumbnailUrl,
        publisherName: finalPublisherName,
        status: articleStatus,
        publishedAt,
        adminId,
        categoryId: parseInt(categoryId)
      },
      include: {
        category: { select: { id: true, nama: true } }
      }
    });

    res.status(201).json({
      message: articleStatus === 'published' 
        ? 'Artikel berhasil dipublikasikan' 
        : 'Artikel berhasil disimpan sebagai draft',
      article
    });

  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create article error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, isi, categoryId, thumbnailUrl, publisherName } = req.body;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: 'ID artikel tidak valid' 
      });
    }

    const existing = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ 
        message: 'Artikel tidak ditemukan' 
      });
    }

    const updateData = {};
    if (judul) {
      updateData.judul = judul;
      updateData.slug = generateSlug(judul);
    }
    if (isi) updateData.isi = isi;
    if (categoryId) updateData.categoryId = parseInt(categoryId);
    
    if (req.file) {
      deleteOldThumbnail(existing.thumbnailUrl);
      updateData.thumbnailUrl = `/uploads/${req.file.filename}`;
    } else if (thumbnailUrl !== undefined) {
      if (thumbnailUrl === '' || thumbnailUrl === null) {
        deleteOldThumbnail(existing.thumbnailUrl);
        updateData.thumbnailUrl = null;
      } else {
        updateData.thumbnailUrl = thumbnailUrl.trim();
      }
    }
    
    if (publisherName !== undefined) {
      updateData.publisherName = (publisherName && publisherName.trim() !== '') 
        ? publisherName.trim() 
        : null;
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
      include: {
        category: { select: { id: true, nama: true } }
      }
    });

    res.json({
      message: 'Artikel berhasil diperbarui',
      article
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Update article error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const publishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return res.status(400).json({ 
        message: 'ID artikel tidak valid' 
      });
    }

    const existing = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (!existing) {
      return res.status(404).json({ 
        message: 'Artikel tidak ditemukan' 
      });
    }

    if (existing.status === 'published') {
      return res.status(400).json({ 
        message: 'Artikel sudah dipublikasikan' 
      });
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'published',
        publishedAt: new Date()
      }
    });

    res.json({
      message: 'Artikel berhasil dipublikasikan',
      article
    });

  } catch (error) {
    console.error('Publish article error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return res.status(400).json({ 
        message: 'ID artikel tidak valid' 
      });
    }

    const existing = await prisma.article.findUnique({
      where: { id: articleId }
    });

    if (existing && existing.thumbnailUrl) {
      deleteOldThumbnail(existing.thumbnailUrl);
    }

    await prisma.article.delete({
      where: { id: articleId }
    });

    res.json({
      message: 'Artikel berhasil dihapus'
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        message: 'Artikel tidak ditemukan' 
      });
    }
    console.error('Delete article error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

module.exports = {
  getPublishedArticles,
  getArticleBySlug,
  getAllArticlesAdmin,
  createArticle,
  updateArticle,
  publishArticle,
  deleteArticle
};