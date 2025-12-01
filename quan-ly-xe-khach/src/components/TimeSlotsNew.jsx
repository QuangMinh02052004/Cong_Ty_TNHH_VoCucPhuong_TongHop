import React, { useState } from 'react';
import { FaPlus, FaCheckCircle, FaBus, FaEdit } from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';

const TimeSlotsNew = () => {
  const { selectedTrip, setSelectedTrip, getBookingsByTimeSlot, setIsSlotSelected, timeSlots, updateTimeSlot } = useBooking();
  const [editingSlot, setEditingSlot] = useState(null);
  const [editData, setEditData] = useState({});

  // Lấy giờ hiện tại
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours * 60 + minutes; // Chuyển sang phút để dễ so sánh
  };

  // Kiểm tra xe đã xuất bến chưa
  const isDeparted = (timeSlot) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTimeInMinutes = hours * 60 + minutes;
    return getCurrentTime() > slotTimeInMinutes;
  };

  const handleSlotClick = (slot) => {
    if (editingSlot !== slot.time) {
      setSelectedTrip(slot);
      setIsSlotSelected(true); // Đánh dấu đã chọn khung giờ
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditClick = (e, slot, index) => {
    e.stopPropagation();
    setEditingSlot(slot.time);
    setEditData({
      index,
      time: slot.time,
      code: slot.code,
      driver: slot.driver,
      phone: slot.phone,
      type: slot.type,
    });
  };

  const handleSaveEdit = () => {
    updateTimeSlot(editData.time, {
      code: editData.code,
      driver: editData.driver,
      phone: editData.phone,
      type: editData.type,
    });
    setEditingSlot(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setEditData({});
  };

  return (
    <div className="bg-white shadow-sm p-2">
      {/* Header thông báo */}
      <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-500">
        <p className="text-xs font-semibold text-blue-800">
          📌 Chuyến đang chọn: <span className="text-blue-600 text-sm">{selectedTrip.time}</span> - {selectedTrip.date}
          {selectedTrip.code && <span className="ml-2 text-xs">({selectedTrip.code})</span>}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 gap-1">
        {timeSlots.map((slot, index) => {
          const bookingsCount = getBookingsByTimeSlot(slot.time).length;
          const isSelected = selectedTrip?.time === slot.time;
          const hasBookings = bookingsCount > 0;
          const isEditing = editingSlot === slot.time;

          return (
            <div
              key={index}
              onClick={() => handleSlotClick(slot)}
              className={`
                relative border rounded p-1 cursor-pointer transition-all hover:shadow-md
                min-h-[100px] max-h-[100px] flex flex-col
                ${isSelected
                  ? 'bg-blue-100 border-blue-600 ring-2 ring-blue-500'
                  : hasBookings
                    ? 'bg-green-50 border-green-400'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }
              `}
            >
              {/* Departed Indicator - Smaller */}
              {isDeparted(slot.time) && (
                <div className="absolute top-0.5 right-0.5">
                  <div className="bg-gray-500 text-white text-[9px] px-1 py-0.5 rounded shadow-sm font-semibold">
                    Đã xuất bến
                  </div>
                </div>
              )}

              {/* Selected Indicator */}
              {isSelected && !isDeparted(slot.time) && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              )}



              {/* Time */}
              <div className={`text-lg font-bold mb-1 text-center ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                {slot.time}
              </div>

              {/* Date & Type */}
              <div className="text-[10px] text-gray-500 text-center mb-1">
                {slot.date} • {slot.type}
              </div>

              {/* Vehicle Code */}
              {slot.code && (
                <div className="text-[10px] text-gray-700 font-semibold text-center mb-1 truncate px-1">
                  🚌 {slot.code}
                </div>
              )}

              {/* Driver Info */}
              {slot.driver && (
                <div className="text-[9px] text-gray-600 text-center truncate px-1">
                  👤 {slot.driver}
                </div>
              )}

              {/* Booking Count */}
              {hasBookings && (
                <div className="mt-auto">
                  <div className="text-[10px] text-green-700 font-semibold bg-green-100 px-1 py-0.5 rounded flex items-center justify-center gap-1">
                    <FaCheckCircle className="text-green-500" size={10} />
                    <span>{bookingsCount} vé</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Slot Button */}
        <div className="border border-dashed border-gray-300 rounded p-1 min-h-[100px] flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
          <FaPlus className="text-2xl text-gray-400" />
        </div>
      </div>

      {/* Edit Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCancelEdit}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Chỉnh sửa thông tin chuyến {editData.time}
            </h3>

            <div className="space-y-3">
              {/* Loại xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại xe
                </label>
                <input
                  type="text"
                  value={editData.type || ''}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập loại xe"
                />
              </div>

              {/* Biển số xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biển số xe
                </label>
                <input
                  type="text"
                  value={editData.code || ''}
                  onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập biển số xe"
                />
              </div>

              {/* Tên tài xế */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài xế
                </label>
                <input
                  type="text"
                  value={editData.driver || ''}
                  onChange={(e) => setEditData({ ...editData, driver: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập tên tài xế"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-semibold"
              >
                💾 Lưu
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition font-semibold"
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotsNew;
