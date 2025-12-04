import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { bookings } = useBooking();

  // Tính tổng doanh thu từ tất cả các booking (số tiền đã thanh toán)
  const totalRevenue = useMemo(() => {
    return bookings.reduce((total, booking) => {
      return total + (Number(booking.paid) || 0);
    }, 0);
  }, [bookings]);

  // Format tiền VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Kiểm tra xem route hiện tại có active không
  const isActive = (path) => location.pathname === path;

  // Hàm logout
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-bold">VÕ CÚC PHƯƠNG</h1>
              <p className="text-xs text-blue-200">Hệ thống quản lý vận tải</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded transition text-sm ${
                isActive('/') ? 'bg-blue-600' : 'hover:bg-blue-600'
              }`}
            >
              Hành khách
            </button>
            <button
              onClick={() => navigate('/hang-hoa')}
              className={`px-4 py-2 rounded transition text-sm ${
                isActive('/hang-hoa') ? 'bg-blue-600' : 'hover:bg-blue-600'
              }`}
            >
              Hàng hóa
            </button>
            <button
              onClick={() => navigate('/dieu-hanh')}
              className={`px-4 py-2 rounded transition text-sm ${
                isActive('/dieu-hanh') ? 'bg-blue-600' : 'hover:bg-blue-600'
              }`}
            >
              Điều hành
            </button>
            <button
              onClick={() => navigate('/cskh')}
              className={`px-4 py-2 rounded transition text-sm ${
                isActive('/cskh') ? 'bg-blue-600' : 'hover:bg-blue-600'
              }`}
            >
              CSKH
            </button>
          </nav>

          {/* Right Section - User Info & Balance */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden lg:block">
              <p className="text-xs text-blue-200">
                {user?.fullName || 'Tổng Đài An Đông 01'}
                {user?.role && ` - ${user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Quản lý' : 'Nhân viên'}`}
              </p>
              <p className="text-lg font-bold text-green-300">
                TK {formatCurrency(totalRevenue)} đ
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition text-xs"
              title="Đăng xuất"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
