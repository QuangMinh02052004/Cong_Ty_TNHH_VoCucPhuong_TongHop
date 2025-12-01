import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimesCircle } from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';

const PassengerFormNew = () => {
  const { addBooking, updateBooking, selectedTrip, bookings, setShowPassengerForm } = useBooking();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [foundPassenger, setFoundPassenger] = useState(null);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    gender: '',
    nationality: 'Việt Nam',
    pickupMethod: 'Dọc đường',
    pickupAddress: '',
    dropoffMethod: 'Tại bến',
    note: '',
    seatNumber: null,
    amount: 100000,
    paid: 0,
    preferredSeat: false,
    sendSMS: false,
    printTicket: false,
    printStamp: false,
    sendEmail: false,
    sendZalo: false,
    autoFill: false,
  });

  // Hàm tìm kiếm hành khách theo số điện thoại
  const searchPassengerByPhone = (phone) => {
    if (phone.length >= 10) {
      const found = bookings.find(b => b.phone === phone);
      if (found) {
        setFoundPassenger(found);
        // Tự động điền thông tin (trừ số điện thoại)
        setFormData(prev => ({
          ...prev,
          name: found.name,
          gender: found.gender || '',
          nationality: found.nationality || 'Việt Nam',
          pickupAddress: found.pickupAddress || '',
          pickupMethod: found.pickupMethod || 'Dọc đường',
          dropoffMethod: found.dropoffMethod || 'Tại bến',
          note: found.note || '',
        }));
        return true;
      } else {
        setFoundPassenger(null);
        return false;
      }
    }
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Cập nhật giá trị
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Nếu là số điện thoại, tìm kiếm tự động
    if (name === 'phone') {
      searchPassengerByPhone(value);
    }
  };

  const handleSubmit = () => {
    if (!formData.phone || !formData.name) {
      alert('Vui lòng nhập số điện thoại và họ tên!');
      return;
    }

    if (isEditing) {
      // Cập nhật booking
      updateBooking(editingId, formData);
      alert('Đã cập nhật thông tin hành khách!');
      setIsEditing(false);
      setEditingId(null);
    } else {
      // Thêm booking mới
      addBooking(formData);
      alert('Đã thêm hành khách thành công!');
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      phone: '',
      name: '',
      gender: '',
      nationality: 'Việt Nam',
      pickupMethod: 'Dọc đường',
      pickupAddress: '',
      dropoffMethod: 'Tại bến',
      note: '',
      seatNumber: null,
      amount: 100000,
      paid: 0,
      preferredSeat: false,
      sendSMS: false,
      printTicket: false,
      printStamp: false,
      sendEmail: false,
      sendZalo: false,
      autoFill: false,
    });
  };

  // Hàm để load dữ liệu vào form khi edit (sẽ được gọi từ SeatMap)
  const loadBookingData = (booking) => {
    setFormData(booking);
    setIsEditing(true);
    setEditingId(booking.id);
  };

  // Export hàm này để SeatMap có thể gọi
  useEffect(() => {
    window.loadPassengerForm = loadBookingData;
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <h2 className="text-lg font-bold text-gray-800">
          {isEditing ? 'CHỈNH SỬA HÀNH KHÁCH' : 'THÔNG TIN HÀNH KHÁCH'}
        </h2>
        <button
          onClick={() => setShowPassengerForm(false)}
          className="text-gray-400 hover:text-red-500 transition"
          title="Đóng"
        >
          <FaTimesCircle size={24} />
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Nhập số điện thoại"
              required
            />
            <button className="absolute right-2 top-2 text-blue-600 hover:text-blue-800">
              <FaSearch />
            </button>
          </div>

          {/* Thông báo tìm thấy */}
          {foundPassenger && (
            <div className="mt-2 p-2 bg-green-50 border border-green-300 rounded-md flex items-center gap-2">
              <span className="text-green-600 text-sm">✅ Đã tìm thấy: <strong>{foundPassenger.name}</strong></span>
              <span className="text-xs text-green-500">(Thông tin đã được tự động điền)</span>
            </div>
          )}
        </div>

        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập họ tên"
            required
          />
        </div>

        {/* Cách đón - QUAN TRỌNG */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cách đón <span className="text-red-500">*</span>
          </label>
          <select
            name="pickupMethod"
            value={formData.pickupMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-orange-400 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-orange-50 font-semibold"
          >
            <option value="Dọc đường">Dọc đường</option>
            <option value="Tại bến">Tại bến</option>
            <option value="Tại nhà">Tại nhà</option>
          </select>
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Chọn "Dọc đường" sẽ đồng bộ với hệ thống Nhập Hàng
          </p>
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

        {/* Số ghế */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số ghế
          </label>
          <input
            type="number"
            name="seatNumber"
            value={formData.seatNumber || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Tự động"
          />
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
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Nhập ghi chú"
          />
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="preferredSeat"
              checked={formData.preferredSeat}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Ghế ưu đãi</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="sendSMS"
              checked={formData.sendSMS}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">Gửi tin nhận</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="printTicket"
              checked={formData.printTicket}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">In vé</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="printStamp"
              checked={formData.printStamp}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm">In tem vé</span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t">
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-bold text-lg"
          >
            {isEditing ? '💾 Cập nhật' : '➕ Thêm hành khách'}
          </button>

          {isEditing && (
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingId(null);
                resetForm();
              }}
              className="w-full mt-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
            >
              Hủy chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerFormNew;
