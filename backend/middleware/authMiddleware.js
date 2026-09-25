const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token tidak ditemukan, silakan login' 
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'user') {
      return res.status(403).json({ 
        message: 'Akses ditolak, endpoint ini hanya untuk user' 
      });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token sudah kadaluarsa, silakan login ulang' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token tidak valid' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Token tidak ditemukan, silakan login' 
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Akses ditolak, endpoint ini hanya untuk admin' 
      });
    }

    req.admin = {
      adminId: decoded.adminId,
      username: decoded.username,
      role: decoded.role
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token sudah kadaluarsa, silakan login ulang' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token tidak valid' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan pada server' 
    });
  }
};

module.exports = { authenticateUser, authenticateAdmin };