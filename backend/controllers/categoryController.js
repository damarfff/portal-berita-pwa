const prisma = require('../prisma');

const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { nama: 'asc' }
    });

    res.json({
      message: 'Kategori berhasil diambil',
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { nama } = req.body;

    if (!nama || nama.trim() === '') {
      return res.status(400).json({ 
        message: 'Nama kategori wajib diisi' 
      });
    }

    const slug = nama
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const existing = await prisma.category.findUnique({
      where: { slug }
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'Kategori sudah ada' 
      });
    }

    const category = await prisma.category.create({
      data: { nama: nama.trim(), slug }
    });

    res.status(201).json({
      message: 'Kategori berhasil dibuat',
      category
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return res.status(400).json({ 
        message: 'ID kategori tidak valid' 
      });
    }

    const articleCount = await prisma.article.count({
      where: { categoryId }
    });

    if (articleCount > 0) {
      return res.status(400).json({
        message: `Kategori tidak bisa dihapus karena masih ada ${articleCount} artikel di dalamnya`
      });
    }

    // Kategori yang sudah dijadikan favorit oleh user (lewat setup
    // preferensi/panel aksesibilitas) juga direferensikan lewat foreign key
    // RESTRICT di user_category_preferences, jadi harus dicek juga di sini
    // supaya tidak jatuh ke error 500 mentah dari database.
    const preferenceCount = await prisma.userCategoryPreference.count({
      where: { categoryId }
    });

    if (preferenceCount > 0) {
      return res.status(400).json({
        message: `Kategori tidak bisa dihapus karena masih dijadikan favorit oleh ${preferenceCount} pengguna`
      });
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.json({
      message: 'Kategori berhasil dihapus'
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        message: 'Kategori tidak ditemukan' 
      });
    }
    console.error('Delete category error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

module.exports = { getAllCategories, createCategory, deleteCategory };