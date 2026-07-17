import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import ToastNotification from './ToastNotification';
import GlobalSearch from './GlobalSearch';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { bookings, globalToast, setGlobalToast } = useBooking();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hanh-khach');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Doanh thu TongHop: chỉ tính vé có tiền thực — vé online (DatVe) + vé nhân viên
  // nhập có "Thực thu" (amount). Ghế chỉ giữ chỗ / chưa nhập tiền (amount<=0) và
  // vé đã hủy KHÔNG cộng. Cộng theo đúng số tiền Thực thu tương ứng.
  const totalRevenue = useMemo(() => {
    return bookings.reduce((total, booking) => {
      if (booking.status === 'cancelled') return total;
      const amount = Number(booking.amount) || 0;
      return amount > 0 ? total + amount : total;
    }, 0);
  }, [bookings]);

  const tabs = [
    { id: 'hanh-khach', label: 'Hành khách', path: '/' },
    { id: 'hang-hoa', label: 'Hàng hóa', path: '/hang-hoa', requiresManager: true }
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotification toast={globalToast} onClose={() => setGlobalToast(null)} />
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Left: Logo + Tabs + Nhập Hàng link */}
            <div className="flex items-center space-x-1 min-w-0 overflow-x-auto">
              {/* Logo Võ Cúc Phương */}
              <div className="flex items-center gap-2 pr-2 sm:pr-3 flex-shrink-0">
                <img
                  src={`${process.env.PUBLIC_URL}/logo.png`}
                  alt="Võ Cúc Phương"
                  className="w-9 h-9 object-contain"
                />
                <span className="hidden lg:block text-sm font-bold text-gray-800 leading-tight whitespace-nowrap">VÕ CÚC PHƯƠNG</span>
              </div>
              <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>

              {tabs.map((tab) => {
                if (tab.requiresManager && !user?.role?.match(/admin|manager/)) {
                  return null;
                }

                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`
                      px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-shrink-0
                      ${isActive
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {/* Divider */}
              <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>

              {/* Nhập Hàng link */}
              <a
                href="/nhap-hang/index.html"
                className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-orange-600 hover:bg-orange-50 border border-orange-300 flex-shrink-0 whitespace-nowrap"
              >
                Nhập Hàng
              </a>
            </div>

            {/* Right: Search + Revenue & User Info */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Global Search */}
              <div className="hidden sm:block">
                <GlobalSearch />
              </div>

              {/* Revenue Display */}
              <div className="hidden md:block bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 text-sm">
                <div className="text-gray-600 text-xs">{user?.fullName || 'Doanh thu'}</div>
                <div className="font-bold text-emerald-700">{formatCurrency(totalRevenue)}</div>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-lg transition border border-sky-200"
                >
                  <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-gray-800">{user?.fullName}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-800">{user?.fullName}</div>
                      <div className="text-xs text-gray-500">{user?.email || user?.username}</div>
                    </div>
                    {[
                      { label: 'Thông tin cá nhân', path: '/profile' },
                      { label: 'Lịch sử khách hàng', path: '/customer-history' },
                      { label: 'Danh sách gọi khách', path: '/call-list' },
                      ...(user?.role === 'admin' ? [
                        { label: 'Quản lý users', path: '/admin/users' },
                        { label: 'Quản lý tuyến', path: '/admin/routes' },
                        { label: 'Quản lý xe & tài xế', path: '/admin/vehicles-drivers' },
                        { label: 'Quản lý trạm đón / viết tắt', path: '/admin/station-aliases' },
                        { label: 'Lịch sử thao tác', path: '/admin/audit-log' },
                        { label: 'Dashboard điều hành', path: '/admin/dashboard' },
                      ] : []),
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate(item.path);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-200 mt-2"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 py-4">
        {children}
      </main>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default MainLayout;
