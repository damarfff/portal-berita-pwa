const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username dan password wajib diisi' 
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin) {
      return res.status(401).json({ 
        message: 'Username atau password salah' 
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        message: 'Username atau password salah' 
      });
    }

    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login admin berhasil',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nama: admin.nama
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        username: true,
        nama: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({ 
        message: 'Admin tidak ditemukan' 
      });
    }

    res.json({
      message: 'Profil admin berhasil diambil',
      admin
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

module.exports = { loginAdmin, getAdminProfile };