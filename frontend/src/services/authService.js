import api from './api';

const VISITOR_SESSION_KEY = 'visitorSession';

const simpanSesiPengunjung = (visitor) => {
  try {
    sessionStorage.setItem(VISITOR_SESSION_KEY, JSON.stringify(visitor));
  } catch {
    // abaikan (mis. mode private/storage penuh)
  }
};

export const loginAsVisitor = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');

  const visitor = {
    id: 'visitor',
    nama: 'Pengunjung',
    isFirstLogin: true
  };
  simpanSesiPengunjung(visitor);
  return visitor;
};

export const getVisitorUser = () => {
  try {
    const raw = sessionStorage.getItem(VISITOR_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const isVisitorAuthenticated = () => !!getVisitorUser();

export const setVisitorSetupDone = () => {
  const visitor = getVisitorUser();
  if (!visitor) return null;
  const updated = { ...visitor, isFirstLogin: false };
  simpanSesiPengunjung(updated);
  return updated;
};

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

export const resetPassword = async (email, newPassword) => {
  const response = await api.post('/auth/reset-password', {
    email,
    newPassword
  });
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
  try {
    sessionStorage.removeItem(VISITOR_SESSION_KEY);
    sessionStorage.removeItem('visitorAccessibilityPreferences');
  } catch {
    // abaikan (mis. mode private/storage penuh)
  }
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
