import api from './api';

export const registerUser = async (email, password, nama) => {
  const response = await api.post('/auth/register', {
    email,
    password,
    nama
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('role', 'user');
  }
  
  return response.data;
};

export const loginAdmin = async (username, password) => {
  const response = await api.post('/admin/login', {
    username,
    password
  });
  
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.admin));
    localStorage.setItem('role', 'admin');
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

// Dipanggil setelah user menyimpan preferensi awal. Data user di
// localStorage ditulis sekali saat login dan tidak pernah disegarkan, jadi
// tanpa ini halaman preferensi akan terus mengira user masih setup awal.
export const setFirstLoginDone = () => {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    const user = { ...JSON.parse(raw), isFirstLogin: false };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getCurrentRole = () => {
  return localStorage.getItem('role');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};