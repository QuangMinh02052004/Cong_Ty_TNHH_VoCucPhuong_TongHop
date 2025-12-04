import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Load current user from token
  const loadCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Lỗi load user:', error);
      // Token không hợp lệ, xóa đi
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
      });

      const { token: newToken, user: userData } = response.data;

      // Lưu token vào localStorage và state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Đăng nhập thất bại'
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Check if user has role
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is manager or admin
  const isManager = () => hasRole('admin', 'manager');

  const value = {
    user,
    setUser,
    token,
    loading,
    login,
    logout,
    hasRole,
    isAdmin,
    isManager,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
