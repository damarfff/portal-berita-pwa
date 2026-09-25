const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const register = async (req, res) => {
  try {
    const { email, password, nama } = req.body;

    if (!email || !password || !nama) {
      return res.status(400).json({ 
        message: 'Email, password, dan nama wajib diisi' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password minimal 6 karakter' 
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email sudah terdaftar' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nama
      },
      select: {
        id: true,
        email: true,
        nama: true,
        isFirstLogin: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: newUser
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email dan password wajib diisi' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Email atau password salah' 
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        message: 'Email atau password salah' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        isFirstLogin: user.isFirstLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nama: true,
        isFirstLogin: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User tidak ditemukan' 
      });
    }

    res.json({
      message: 'Profil berhasil diambil',
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

module.exports = { register, login, getProfile };