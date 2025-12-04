import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import axios from 'axios';
import { stationNames } from '../data/stations';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PassengerFormNew = () => {
  const { addBooking, updateBooking, selectedTrip, bookings, currentDayBookings, setShowPassengerForm, selectedSeatNumber, setSelectedSeatNumber } = useBooking();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [foundPassenger, setFoundPassenger] = useState(null);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    gender: '',
    nationality: 'Việt Nam',
    pickupMethod: 'Dọc đường',
    pickupAddress: '',
    dropoffMethod: 'Tại bến',
    dropoffAddress: '',
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

  // Hàm tìm kiếm hành khách theo số điện thoại (gọi API)
  const searchPassengerByPhone = async (phone) => {
    if (phone.length >= 10) {
      setSearching(true);
      try {
        const response = await axios.get(`${API_URL}/customers/search/${phone}`);

        if (response.data.found) {
          const customer = response.data.customer;
          setFoundPassenger(customer);

          // Tự động điền thông tin
          setFormData(prev => ({
            ...prev,
            name: customer.fullName || '',
            pickupMethod: customer.pickupType || 'Dọc đường',
            pickupAddress: customer.pickupLocation || '',
            dropoffMethod: customer.dropoffType || 'Tại bến',
            dropoffAddress: customer.dropoffLocation || '',
            note: customer.notes || '',
          }));

          return true;
        } else {
          setFoundPassenger(null);
          return false;
        }
      } catch (error) {
        console.error('Lỗi tìm khách hàng:', error);
        setFoundPassenger(null);
        return false;
      } finally {
        setSearching(false);
      }
    }
    return false;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Cập nhật giá trị
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Xóa địa chỉ đón khi chọn "Tại bến"
      if (name === 'pickupMethod' && value === 'Tại bến') {
        newData.pickupAddress = '';
      }

      // Xóa địa chỉ trả khi chọn "Tại bến"
      if (name === 'dropoffMethod' && value === 'Tại bến') {
        newData.dropoffAddress = '';
      }

      return newData;
    });

    // Nếu là số điện thoại, tìm kiếm tự động
    if (name === 'phone') {
      searchPassengerByPhone(value);
    }
  };

  const handleSubmit = async () => {
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
      // Kiểm tra ghế đã được đặt chưa (chỉ cho booking mới)
      if (formData.seatNumber) {
        const seatTaken = currentDayBookings.find(
          booking => booking.timeSlot === selectedTrip.time && booking.seatNumber === formData.seatNumber
        );

        if (seatTaken) {
          alert(`⚠️ Ghế ${formData.seatNumber} đã được đặt bởi ${seatTaken.name} (${seatTaken.phone}).\nVui lòng chọn ghế khác!`);
          return;
        }
      }

      // Thêm booking mới
      addBooking(formData);

      // Lưu thông tin khách hàng vào database
      try {
        await axios.post(`${API_URL}/customers`, {
          phone: formData.phone,
          fullName: formData.name,
          pickupType: formData.pickupMethod,
          pickupLocation: formData.pickupAddress,
          dropoffType: formData.dropoffMethod,
          dropoffLocation: formData.dropoffAddress,
          notes: formData.note
        });
        console.log('✅ Đã lưu thông tin khách hàng');
      } catch (error) {
        console.error('Lỗi lưu khách hàng:', error);
      }

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
      dropoffAddress: '',
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
    setSelectedSeatNumber(null);
  };

  // Hàm để load dữ liệu vào form khi edit (sẽ được gọi từ SeatMap)
  const loadBookingData = (booking) => {
    setFormData(booking);
    setIsEditing(true);
    setEditingId(booking.id);
  };

  // Tự động điền số ghế khi có ghế được chọn
  useEffect(() => {
    if (selectedSeatNumber !== null && !isEditing) {
      setFormData(prev => ({
        ...prev,
        seatNumber: selectedSeatNumber
      }));
    }
  }, [selectedSeatNumber, isEditing]);

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
          onClick={() => {
            setShowPassengerForm(false);
            setSelectedSeatNumber(null);
          }}
          className="text-gray-400 hover:text-red-500 transition text-2xl font-bold"
          title="Đóng"
        >
          ×
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
            <button className="absolute right-2 top-2 text-blue-600 hover:text-blue-800 text-xs font-semibold">
              Tìm
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
            list="pickup-stations-list"
            disabled={formData.pickupMethod === 'Tại bến'}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              formData.pickupMethod === 'Tại bến' ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Chọn hoặc nhập địa chỉ đón"
          />
          <datalist id="pickup-stations-list">
            {stationNames.map((station, index) => (
              <option key={index} value={station} />
            ))}
          </datalist>
          <p className="text-xs text-gray-500 mt-1">
            💡 Bạn có thể chọn từ danh sách hoặc tự nhập địa chỉ
          </p>
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

        {/* Địa chỉ trả */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Địa chỉ trả
          </label>
          <input
            type="text"
            name="dropoffAddress"
            value={formData.dropoffAddress}
            onChange={handleInputChange}
            list="dropoff-stations-list"
            disabled={formData.dropoffMethod === 'Tại bến'}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
              formData.dropoffMethod === 'Tại bến' ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Chọn hoặc nhập địa chỉ trả"
          />
          <datalist id="dropoff-stations-list">
            {stationNames.map((station, index) => (
              <option key={index} value={station} />
            ))}
          </datalist>
          <p className="text-xs text-gray-500 mt-1">
            💡 Bạn có thể chọn từ danh sách hoặc tự nhập địa chỉ
          </p>
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

        {/* Thông tin thanh toán */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
          <h3 className="text-sm font-bold text-blue-800 mb-2">💰 Thanh toán</h3>

          {/* Giá vé */}
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Giá vé:
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-32 px-3 py-1 border border-gray-300 rounded-md text-right font-semibold"
            />
          </div>

          {/* Đã thanh toán */}
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              Đã thanh toán: <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="paid"
              value={formData.paid}
              onChange={handleInputChange}
              className="w-32 px-3 py-1 border border-green-400 rounded-md text-right font-bold bg-green-50 focus:ring-2 focus:ring-green-500"
              placeholder="0"
            />
          </div>

          {/* Còn nợ */}
          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
            <label className="text-sm font-bold text-gray-700">
              Còn nợ:
            </label>
            <span className={`text-lg font-bold ${
              (formData.amount - formData.paid) > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {new Intl.NumberFormat('vi-VN').format(formData.amount - formData.paid)} đ
            </span>
          </div>

          {/* Nút thanh toán nhanh */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, paid: prev.amount }))}
              className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
            >
              ✓ Thanh toán đủ
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, paid: Math.floor(prev.amount / 2) }))}
              className="flex-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, paid: 0 }))}
              className="flex-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition"
            >
              Chưa trả
            </button>
          </div>
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
