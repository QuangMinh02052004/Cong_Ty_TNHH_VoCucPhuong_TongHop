import React from 'react';
import { FaBus, FaUser, FaBell, FaCog } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <FaBus className="text-3xl" />
            <div>
              <h1 className="text-xl font-bold">VÕ CÚC PHƯƠNG</h1>
              <p className="text-xs text-blue-200">Hệ thống quản lý đơn hang</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex space-x-1">
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition">
              📋 Hành khách
            </button>
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition">
              📦 Hàng hóa
            </button>
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition">
              🚦 Điều hành
            </button>
            <button className="px-4 py-2 hover:bg-blue-600 rounded transition">
              👥 CSKH
            </button>
          </nav>

          {/* Right Section - User Info & Balance */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden lg:block">
              <p className="text-xs text-blue-200">Tổng Đài An Đông 01</p>
              <p className="text-lg font-bold text-green-300">TK 3,122,700 đ</p>
            </div>
            <button className="p-2 hover:bg-blue-600 rounded-full transition">
              <FaBell className="text-xl" />
            </button>
            <button className="p-2 hover:bg-blue-600 rounded-full transition">
              <FaUser className="text-xl" />
            </button>
            <button className="p-2 hover:bg-blue-600 rounded-full transition">
              <FaCog className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
