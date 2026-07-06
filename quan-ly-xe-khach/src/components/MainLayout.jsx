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
      // Bỏ vé đã hủy và vé chỉ giữ chỗ (chưa thu tiền) khỏi doanh thu.
      if (booking.status === 'cancelled' || booking.status === 'held') return total;
      const amount = Number(booking.amount) || 0;
      return amount > 0 ? total + amount : total;
    }, 0);
  }, [bookings]);

  const tabs = [
    {
      id: 'hanh-khach',
      label: 'Hành khách',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/'
    },
    {
      id: 'hang-hoa',
      label: 'Hàng hóa',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      path: '/hang-hoa',
      requiresManager: true
    }
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
            {/* Left: Tabs + Nhập Hàng link */}
            <div className="flex items-center space-x-1 min-w-0 overflow-x-auto">
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
                      flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-shrink-0
                      ${isActive
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                      }
                    `}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}

              {/* Divider */}
              <div className="w-px h-8 bg-gray-300 mx-1 hidden sm:block"></div>

              {/* Nhập Hàng link */}
              <a
                href="/nhap-hang/index.html"
                className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-orange-600 hover:bg-orange-50 border border-orange-300 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="hidden sm:inline">Nhập Hàng</span>
              </a>
            </div>

            {/* Right: Search + Revenue & User Info */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Global Search */}
              <div className="hidden sm:block">
                <GlobalSearch />
              </div>

              {/* Revenue Display */}
              <div className="hidden md:flex items-center bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div className="text-gray-600 text-xs">Tổng Đài An Đông 01</div>
                  <div className="font-bold text-emerald-700">{formatCurrency(totalRevenue)}</div>
                </div>
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
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-800">{user?.fullName}</div>
                      <div className="text-xs text-gray-500">{user?.email || user?.username}</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Thông tin cá nhân</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/customer-history');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Lịch sử khách hàng</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/call-list');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>Danh sách gọi khách</span>
                      </div>
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin/users');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span>Quản lý users</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin/routes');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <span>Quản lý tuyến</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin/vehicles-drivers');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <span>Quản lý xe &amp; tài xế</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin/station-aliases');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <span>Quản lý viết tắt</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin/audit-log');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Lịch sử thao tác</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/admin/dashboard');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 transition"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span>Dashboard điều hành</span>
                          </div>
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-200 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Đăng xuất</span>
                      </div>
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
