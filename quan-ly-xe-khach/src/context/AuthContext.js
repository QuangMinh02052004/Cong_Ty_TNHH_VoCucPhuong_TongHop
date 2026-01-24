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

// API URL - sử dụng full URL cho cross-domain requests
const API_URL = 'https://vocucphuongmanage.vercel.app/api/tong-hop';

export const AuthProvider = ({ children }) => {
  // ✅ Khôi phục user từ localStorage khi load trang (tránh redirect khi refresh)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
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

  // Load current user from token (refresh user data từ server)
  const loadCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      const userData = response.data;
      setUser(userData);
      // ✅ Cache user vào localStorage
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Lỗi load user:', error);
      // ✅ Nếu có user cached trong localStorage, vẫn giữ đăng nhập (tránh mất session khi mạng chập chờn)
      const savedUser = localStorage.getItem('user');
      if (savedUser && localStorage.getItem('token')) {
        console.log('Sử dụng cached user data');
        setUser(JSON.parse(savedUser));
      } else {
        // Không có cache hoặc không có token, logout
        logout();
      }
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

      // Lưu token VÀ user vào localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
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
    localStorage.removeItem('user');  // ✅ Xóa cả user cache
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
