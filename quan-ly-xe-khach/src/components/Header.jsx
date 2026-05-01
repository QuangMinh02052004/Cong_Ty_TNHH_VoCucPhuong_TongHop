import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import ConfirmModal from './ConfirmModal';
import GlobalSearch from './GlobalSearch';

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

  const [modal, setModal] = useState({ isOpen: false });

  // Hàm logout
  const handleLogout = () => {
    setModal({
      isOpen: true,
      title: 'Đăng xuất',
      message: 'Bạn có chắc muốn đăng xuất?',
      type: 'warning',
      onConfirm: () => {
        setModal(m => ({ ...m, isOpen: false }));
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="px-2 sm:px-4">
        <div className="flex items-center justify-between h-12 gap-2">
          {/* Logo */}
          <div className="flex items-center sm:mr-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold">VC</div>
              <div className="hidden xl:block">
                <h1 className="text-sm font-semibold leading-tight tracking-wide">VÕ CÚC PHƯƠNG</h1>
                <p className="text-[10px] text-slate-400 leading-tight">Hệ thống quản lý</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center space-x-0 flex-1 min-w-0">
            <button
              onClick={() => navigate('/')}
              className={`relative px-2 sm:px-4 h-12 transition text-sm font-normal flex items-center gap-1.5 sm:gap-2 ${
                isActive('/')
                  ? 'text-white bg-slate-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Hành khách</span>
            </button>
            <button
              onClick={() => navigate('/hang-hoa')}
              className={`relative px-2 sm:px-4 h-12 transition text-sm font-normal flex items-center gap-1.5 sm:gap-2 ${
                isActive('/hang-hoa')
                  ? 'text-white bg-slate-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="hidden sm:inline">Hàng hóa</span>
            </button>
            <button
              onClick={() => navigate('/dieu-hanh')}
              className={`relative px-2 sm:px-4 h-12 transition text-sm font-normal flex items-center gap-1.5 sm:gap-2 ${
                isActive('/dieu-hanh')
                  ? 'text-white bg-slate-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="hidden sm:inline">Điều hành</span>
            </button>
          </nav>

          {/* Right Section - User Info & Balance */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <div className="text-right hidden xl:block leading-tight">
              <p className="text-[11px] text-slate-300">
                {user?.fullName || 'Tổng Đài An Đông 01'}
                {user?.role && ` - ${user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Quản lý' : 'Nhân viên'}`}
              </p>
              <p className="text-sm font-semibold text-emerald-400">
                TK {formatCurrency(totalRevenue)} đ
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition text-xs font-medium whitespace-nowrap"
              title="Đăng xuất"
            >
              <span className="hidden sm:inline">Đăng xuất</span>
              <span className="sm:hidden">Out</span>
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal(m => ({ ...m, isOpen: false }))}
      />
    </header>
  );
};

export default Header;
