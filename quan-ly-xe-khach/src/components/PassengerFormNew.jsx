import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';

// Danh sách các địa điểm đón/trả
const stations = [
  'An Đông',
  'Ngã 4 Trần Phú-Lê Hồng Phong',
  'Ngã 4 Trần Phú-Trần Bình Trọng',
  'Nhà Sách Nguyễn Thị Minh Khai',
  'BV Từ Dũ - Nguyễn Thị Minh Khai',
  'Sở Y Tế - Nguyễn Thị Minh Khai',
  'CV Tao Đàn - Nguyễn Thị Minh Khai',
  'Trương Định - Nguyễn Thị Minh Khai',
  'Cung VH Lao Động - Nguyễn Thị Minh Khai',
  'N4 Nam Ki - Nguyễn Thị Minh Khai',
  'Ngã 4 Pastuer - Nguyễn Thị Minh Khai',
  'Nhà VH Thanh Niên  - Nguyễn Thị Minh Khai',
  'Ngã 3 PK.Khoan - Nguyễn Thị Minh Khai',
  'Ngã 4 M.Đ.Chi - Nguyễn Thị Minh Khai',
  'Sân VD Hoa Lư - Nguyễn Thị Minh Khai',
  'Ngã 4.Đinh Tiên Hoàng - Nguyễn Thị Minh Khai',
  'Cầu Đen',
  'Cầu Trắng',
  'Metro',
  'Cantavil',
  'Ngã 4 MK',
  'Ngã 4 Bình Thái',
  'Ngã 4 Thủ Đức',
  'Khu Công Nghệ Cao',
  'Suối Tiên',
  'Ngã 4 621',
  'Tân Vạn',
  'Ngã 3 Vũng Tàu',
  'Bồn Nước',
  'Tam Hiệp',
  'Amata',
  'BV Nhi Đồng Nai',
  'Cầu Sập',
  'Bến xe Hố Nai',
  'Chợ Sặt',
  'Công Viên 30/4',
  'Bệnh Viện Thánh Tâm',
  'Nhà thờ Thánh Tâm',
  'Cây Xăng Lộ Đức',
  'Nhà thờ Tiên Chu',
  'Chợ Thái Bình',
  'Nhà thờ Ngọc Đồng',
  'Nhà thờ Ngô Xá',
  'Nhà thờ Sài Quất',
  'Ngũ Phúc',
  'Nhà thờ Thái Hoà',
  'Yên Thế',
  'Chợ chiều Thanh Hoá',
  'Nhà thờ Thanh Hoá',
  'Ngã 3 Trị An',
  'Nhà thờ Bùi Chu',
  'Bắc Sơn',
  'Phú Sơn',
  'Nhà thờ Tân Thành',
  'Nhà thờ Tân Bắc',
  'Suối Đĩa',
  'Nhà thờ Tân Bình',
  'Trà Cổ',
  'Bar Romance',
  'Nhà thờ Quảng Biên',
  'Chợ Quảng Biên',
  'Sân Golf Trảng Bom',
  'Bưu điện Trảng Bom',
  'Bờ hồ Trảng Bom',
  'Cây xăng Thành Thái',
  'Trạm cân',
  'KCN Bầu Xéo',
  'Song Thạch',
  'Chợ Lộc Hoà',
  'Thu phí Bầu Cá',
  'Nhà thờ Tâm An',
  'Chợ Bầu Cá',
  'Cây xăng Minh Trí',
  'Ba cây Xoài Bầu Cá',
  'Cổng vàng Hưng Long',
  'Cây xăng Hưng Thịnh',
  'Sông Thao',
  'Chùa Vạn Thọ',
  'Chợ Hưng Nghĩa',
  'Trạm Giữa',
  'Cây xăng Tam Hoàng',
  'Đại Phát Đạt',
  'Chợ Hưng Lộc',
  'Nhà thờ Hưng Lộc',
  'Cây xăng Hưng Lộc',
  'Mì Quảng Thủy Tiên',
  'Ngô Quyền Dầu Giây',
  'Cây xăng Đặng Văn Bích',
  'Bưu điện Dầu Giây',
  'xã Xuân Thạnh Dầu Giây',
  'Trung tâm Hành chính Dầu Giây',
  'Bến xe Dầu Giây',
  'Trạm 97',
  'Cáp Rang',
  'Bệnh viện Long Khánh',
  'Cây Xăng Suối Tre',
  'Dốc Lê Lợi',
  'Cây xăng 222',
  'Bến xe Long Khánh'
];

const PassengerFormNew = () => {
  const { addBooking, updateBooking, selectedTrip, bookings, currentDayBookings, setShowPassengerForm, selectedSeatNumber, setSelectedSeatNumber } = useBooking();

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
          dropoffAddress: found.dropoffAddress || '',
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Chọn hoặc nhập địa chỉ đón"
          />
          <datalist id="pickup-stations-list">
            {stations.map((station, index) => (
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Chọn hoặc nhập địa chỉ trả"
          />
          <datalist id="dropoff-stations-list">
            {stations.map((station, index) => (
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
