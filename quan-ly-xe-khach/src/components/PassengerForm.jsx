import React, { useState } from 'react';
import { FaSearch, FaTimesCircle } from 'react-icons/fa';

const PassengerForm = () => {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    gender: '',
    nationality: '',
    pickupMethod: 'Dọc đường',
    pickupAddress: '',
    dropoffMethod: 'Tại bến',
    note: '',
    preferredSeat: false,
    sendSMS: false,
    printTicket: false,
    printStamp: false,
    sendEmail: false,
    sendZalo: false,
    autoFill: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <h2 className="text-lg font-bold text-gray-800">THÔNG TIN HÀNH KHÁCH</h2>
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-semibold">04:56</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
              3×
            </button>
            <button className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 flex items-center gap-1">
              <FaTimesCircle /> Bỏ chọn
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điện thoại
          </label>
          <div className="relative">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập số điện thoại"
            />
            <button className="absolute right-2 top-2 text-blue-600 hover:text-blue-800">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Họ tên
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập họ tên"
          />
        </div>

        {/* Giới tính */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giới tính
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>


        {/* Cách đón */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cách đón <span className="text-red-500">*</span>
          </label>
          <select
            name="pickupMethod"
            value={formData.pickupMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Dọc đường">Dọc đường</option>
            <option value="Tại bến">Tại bến</option>
          </select>
        </div>

        {/* Địa chỉ đón */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ đón
          </label>
          <input
            type="text"
            name="pickupAddress"
            value={formData.pickupAddress}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập địa chỉ đón"
          />
        </div>

        {/* Cách trả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cách trả <span className="text-red-500">*</span>
          </label>
          <select
            name="dropoffMethod"
            value={formData.dropoffMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Tại bến">Tại bến</option>
            <option value="Dọc đường">Dọc đường</option>
          </select>
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập ghi chú"
          />
        </div>

        {/* Checkboxes Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="preferredSeat"
              checked={formData.preferredSeat}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Ghế ưu đãi</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="sendSMS"
              checked={formData.sendSMS}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Gửi tin nhận</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="printTicket"
              checked={formData.printTicket}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">In vé</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="printStamp"
              checked={formData.printStamp}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">In tem vé</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-gray-400">
            <input
              type="checkbox"
              disabled
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Gửi email</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-gray-400">
            <input
              type="checkbox"
              disabled
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Gửi ZALO OA</span>
          </label>
        </div>

        {/* Tự động điền cho tất cả */}
        <div className="pt-2 border-t">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="autoFill"
              checked={formData.autoFill}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-blue-600">Tự động điền cho tất cả</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PassengerForm;
