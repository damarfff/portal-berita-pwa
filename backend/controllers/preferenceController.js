const prisma = require('../prisma');

const getPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;

    let preferences = await prisma.accessibilityPreference.findUnique({
      where: { userId }
    });

    if (!preferences) {
      preferences = await prisma.accessibilityPreference.create({
        data: { userId }
      });
    }

    res.json({
      message: 'Preferensi berhasil diambil',
      preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      ukuranTeks, 
      modeKontras, 
      modeButaWarna, 
      jarakBaris, 
      kecepatanTts, 
      volumeTts 
    } = req.body;

    const validUkuranTeks = ['small', 'medium', 'large', 'extra-large'];
    const validKontras = ['normal', 'high-contrast', 'dark'];
    const validButaWarna = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
    const validJarakBaris = ['normal', 'relaxed', 'loose'];

    if (ukuranTeks && !validUkuranTeks.includes(ukuranTeks)) {
      return res.status(400).json({ 
        message: 'Ukuran teks tidak valid' 
      });
    }
    if (modeKontras && !validKontras.includes(modeKontras)) {
      return res.status(400).json({ 
        message: 'Mode kontras tidak valid' 
      });
    }
    if (modeButaWarna && !validButaWarna.includes(modeButaWarna)) {
      return res.status(400).json({ 
        message: 'Mode buta warna tidak valid' 
      });
    }
    if (jarakBaris && !validJarakBaris.includes(jarakBaris)) {
      return res.status(400).json({ 
        message: 'Jarak baris tidak valid' 
      });
    }
    if (kecepatanTts !== undefined && (kecepatanTts < 0.5 || kecepatanTts > 2.0)) {
      return res.status(400).json({ 
        message: 'Kecepatan TTS harus antara 0.5 dan 2.0' 
      });
    }
    if (volumeTts !== undefined && (volumeTts < 0 || volumeTts > 1)) {
      return res.status(400).json({ 
        message: 'Volume TTS harus antara 0 dan 1' 
      });
    }

    const updateData = {};
    if (ukuranTeks) updateData.ukuranTeks = ukuranTeks;
    if (modeKontras) updateData.modeKontras = modeKontras;
    if (modeButaWarna) updateData.modeButaWarna = modeButaWarna;
    if (jarakBaris) updateData.jarakBaris = jarakBaris;
    if (kecepatanTts !== undefined) updateData.kecepatanTts = kecepatanTts;
    if (volumeTts !== undefined) updateData.volumeTts = volumeTts;

    const preferences = await prisma.accessibilityPreference.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { isFirstLogin: false }
    });

    res.json({
      message: 'Preferensi berhasil diperbarui',
      preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const getCategoryPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;

    const categoryPrefs = await prisma.userCategoryPreference.findMany({
      where: { userId },
      include: {
        category: {
          select: { id: true, nama: true, slug: true }
        }
      }
    });

    const categories = categoryPrefs.map(pref => pref.category);

    res.json({
      message: 'Kategori favorit berhasil diambil',
      categories
    });

  } catch (error) {
    console.error('Get category preferences error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const updateCategoryPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { categoryIds } = req.body;

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ 
        message: 'categoryIds harus berupa array' 
      });
    }

    const ids = categoryIds.map(id => parseInt(id));

    if (ids.some(id => isNaN(id))) {
      return res.status(400).json({ 
        message: 'Semua ID kategori harus berupa angka' 
      });
    }

    if (ids.length > 0) {
      const existingCategories = await prisma.category.findMany({
        where: { id: { in: ids } }
      });

      if (existingCategories.length !== ids.length) {
        return res.status(400).json({ 
          message: 'Ada kategori yang tidak ditemukan' 
        });
      }
    }

    await prisma.userCategoryPreference.deleteMany({
      where: { userId }
    });

    if (ids.length > 0) {
      await prisma.userCategoryPreference.createMany({
        data: ids.map(categoryId => ({
          userId,
          categoryId
        }))
      });
    }

    const updated = await prisma.userCategoryPreference.findMany({
      where: { userId },
      include: {
        category: {
          select: { id: true, nama: true, slug: true }
        }
      }
    });

    res.json({
      message: 'Kategori favorit berhasil diperbarui',
      categories: updated.map(pref => pref.category)
    });

  } catch (error) {
    console.error('Update category preferences error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  getCategoryPreferences,
  updateCategoryPreferences
};