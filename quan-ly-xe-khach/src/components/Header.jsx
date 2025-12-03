import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-bold">VÕ CÚC PHƯƠNG</h1>
              <p className="text-xs text-blue-200">Hệ thống quản lý đơn hang</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-1">
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition text-sm">
              Hành khách
            </button>
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition text-sm">
              Hàng hóa
            </button>
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition text-sm">
              Điều hành
            </button>
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition text-sm">
              CSKH
            </button>
          </nav>

          {/* Right Section - User Info & Balance */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden lg:block">
              <p className="text-xs text-blue-200">Tổng Đài An Đông 01</p>
              <p className="text-lg font-bold text-green-300">TK 3,122,700 đ</p>
            </div>
            <button className="px-3 py-1 hover:bg-blue-600 rounded transition text-xs">
              Thông báo
            </button>
            <button className="px-3 py-1 hover:bg-blue-600 rounded transition text-xs">
              Tài khoản
            </button>
            <button className="px-3 py-1 hover:bg-blue-600 rounded transition text-xs">
              Cài đặt
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
