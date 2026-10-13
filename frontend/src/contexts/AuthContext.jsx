import { useState } from 'react';
import { AuthContext } from './AuthContextObject';
import { 
  getCurrentUser, 
  getCurrentRole, 
  isAuthenticated, 
  getVisitorUser,
  isVisitorAuthenticated,
  logout as logoutService 
} from '../services/authService';

const getInitialAuthState = () => {
  if (isAuthenticated()) {
    return {
      user: getCurrentUser(),
      role: getCurrentRole()
    };
  }
  if (isVisitorAuthenticated()) {
    return {
      user: getVisitorUser(),
      role: 'visitor'
    };
  }
  return { user: null, role: null };
};

export const AuthProvider = ({ children }) => {
  const initial = getInitialAuthState();
  const [user, setUser] = useState(initial.user);
  const [role, setRole] = useState(initial.role);

  const login = (userData, userRole) => {
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    logoutService();
    setUser(null);
    setRole(null);
  };

  const value = {
    user,
    role,
    isLoggedIn: !!user,
    isAdmin: role === 'admin',
    isUser: role === 'user',
    isGuest: role === 'visitor',
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
