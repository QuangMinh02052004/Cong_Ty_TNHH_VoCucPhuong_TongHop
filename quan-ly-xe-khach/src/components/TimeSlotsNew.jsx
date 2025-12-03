import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';

const TimeSlotsNew = () => {
  const { selectedTrip, setSelectedTrip, getBookingsByTimeSlot, setIsSlotSelected, currentDayTimeSlots, updateTimeSlot, addNewTimeSlot, changeTimeSlotTime, deleteTimeSlot, drivers, vehicles } = useBooking();
  const [editingSlot, setEditingSlot] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    time: '06:00',
    type: 'Xe 28G',
    code: '',
    driver: '',
    phone: '',
  });

  // Sử dụng danh sách tài xế và xe từ database
  const driversList = drivers;
  const vehiclesList = vehicles;

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
    if (editingSlot !== slot.id) {
      setSelectedTrip(slot);
      setIsSlotSelected(true); // Đánh dấu đã chọn khung giờ
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditClick = (e, slot) => {
    e.stopPropagation();
    setEditingSlot(slot.id);
    setEditData({
      id: slot.id,
      time: slot.time,
      code: slot.code,
      driver: slot.driver,
      phone: slot.phone,
      type: slot.type,
    });
  };

  const handleSaveEdit = () => {
    const slotId = editData.id;
    const newTime = editData.time;

    // Cập nhật giờ
    changeTimeSlotTime(slotId, newTime);

    // Cập nhật thông tin khác
    updateTimeSlot(slotId, {
      code: editData.code,
      driver: editData.driver,
      phone: editData.phone,
      type: editData.type,
    });

    setEditingSlot(null);
    setEditData({});
  };

  const handleAddNewSlot = () => {
    addNewTimeSlot(newSlotData);
    setShowAddSlotModal(false);
    setNewSlotData({
      time: '06:00',
      type: 'Xe 28G',
      code: '',
      driver: '',
      phone: '',
    });
  };

  const handleDeleteSlot = (slotId, time) => {
    if (window.confirm(`Bạn có chắc muốn xóa khung giờ ${time}?`)) {
      deleteTimeSlot(slotId);
      if (selectedTrip.id === slotId) {
        setIsSlotSelected(false);
      }
    }
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
          {selectedTrip ? (
            <>
              Chuyến đang chọn: <span className="text-blue-600 text-sm">{selectedTrip.time}</span> - {selectedTrip.date}
              {selectedTrip.code && <span className="ml-2 text-xs">({selectedTrip.code})</span>}
            </>
          ) : (
            "Chọn một khung giờ để xem thông tin chi tiết"
          )}
        </p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10 gap-1">
        {currentDayTimeSlots.map((slot, index) => {
          const bookingsCount = getBookingsByTimeSlot(slot.id).length;
          const isSelected = selectedTrip?.id === slot.id;
          const hasBookings = bookingsCount > 0;
          const isEditing = editingSlot === slot.id;

          return (
            <div
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              className={`
                relative border rounded p-2 cursor-pointer transition-all hover:shadow-md
                min-h-[130px] flex flex-col
                ${isSelected
                  ? 'bg-blue-100 border-blue-600 ring-2 ring-blue-500'
                  : hasBookings
                    ? 'bg-green-50 border-green-400'
                    : 'bg-white border-gray-300 hover:border-blue-400'
                }
              `}
            >
              {/* Edit/Delete Button - Top Right Corner */}
              <button
                onClick={(e) => handleEditClick(e, slot)}
                className="absolute top-1 right-1 bg-gray-600 hover:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition z-10"
                title="Chỉnh sửa/Xóa"
              >
                ✎
              </button>

              {/* Time - Large Display */}
              <div className={`text-2xl font-bold text-center ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                {slot.time}
              </div>

              {/* Seat Count & Vehicle Type */}
              <div className="text-xs text-gray-600 text-center mt-1.5">
                <span className="font-semibold">{bookingsCount}/28</span>
                {slot.type && <span className="ml-1">• {slot.type}</span>}
              </div>

              {/* Vehicle License Plate */}
              {slot.code && (
                <div className="text-base font-extrabold text-gray-900 text-center mt-2 bg-yellow-100 border-2 border-yellow-500 rounded-md px-3 py-1.5 mx-1 shadow-sm">
                  {slot.code}
                </div>
              )}

              {/* Driver Info */}
              {slot.driver && (
                <div className="text-sm font-semibold text-gray-800 text-center mt-2 px-1">
                  {slot.driver}
                  {hasBookings && bookingsCount === 28 && <span className="text-green-600 ml-1">✓</span>}
                </div>
              )}

              {/* Departed Indicator */}
              {isDeparted(slot.time) && (
                <div className="text-[9px] text-white bg-gray-500 text-center mt-1 py-0.5 rounded mx-1 font-semibold">
                  Đã xuất bến
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Slot Button */}
        <div
          onClick={() => setShowAddSlotModal(true)}
          className="border border-dashed border-gray-300 rounded p-2 min-h-[130px] flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <div className="text-center text-gray-400">
            <div className="text-4xl font-light">+</div>
            <div className="text-xs mt-1">Thêm giờ</div>
          </div>
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
              {/* Giờ khởi hành */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ khởi hành
                </label>
                <input
                  type="time"
                  value={editData.time || ''}
                  onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Biển số xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biển số xe
                </label>
                <input
                  type="text"
                  list="edit-vehicles-list"
                  value={editData.code || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditData({ ...editData, code: value });
                    // Tự động cập nhật loại xe nếu chọn từ danh sách
                    const vehicle = vehiclesList.find(v => v.code === value);
                    if (vehicle) {
                      setEditData(prev => ({ ...prev, type: vehicle.type }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập biển số xe"
                />
                <datalist id="edit-vehicles-list">
                  {vehiclesList.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.code}>
                      {vehicle.type}
                    </option>
                  ))}
                </datalist>
              </div>

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

              {/* Tên tài xế */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài xế
                </label>
                <input
                  type="text"
                  list="edit-drivers-list"
                  value={editData.driver || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEditData({ ...editData, driver: value });
                    // Tự động cập nhật số điện thoại nếu chọn từ danh sách
                    const driver = driversList.find(d => d.name === value);
                    if (driver) {
                      setEditData(prev => ({ ...prev, phone: driver.phone }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập tên tài xế"
                />
                <datalist id="edit-drivers-list">
                  {driversList.map(driver => (
                    <option key={driver.id} value={driver.name}>
                      {driver.phone}
                    </option>
                  ))}
                </datalist>
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
                Lưu
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleDeleteSlot(editData.id, editData.time);
                  handleCancelEdit();
                }}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition font-semibold"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Slot Modal */}
      {showAddSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddSlotModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              Thêm khung giờ mới
            </h3>

            <div className="space-y-3">
              {/* Giờ khởi hành */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ khởi hành <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={newSlotData.time}
                  onChange={(e) => setNewSlotData({ ...newSlotData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Biển số xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biển số xe
                </label>
                <input
                  type="text"
                  list="add-vehicles-list"
                  value={newSlotData.code}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewSlotData({ ...newSlotData, code: value });
                    // Tự động cập nhật loại xe nếu chọn từ danh sách
                    const vehicle = vehiclesList.find(v => v.code === value);
                    if (vehicle) {
                      setNewSlotData(prev => ({ ...prev, type: vehicle.type }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập biển số xe"
                />
                <datalist id="add-vehicles-list">
                  {vehiclesList.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.code}>
                      {vehicle.type}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Loại xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại xe
                </label>
                <input
                  type="text"
                  value={newSlotData.type}
                  onChange={(e) => setNewSlotData({ ...newSlotData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập loại xe"
                />
              </div>

              {/* Tên tài xế */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài xế
                </label>
                <input
                  type="text"
                  list="add-drivers-list"
                  value={newSlotData.driver}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewSlotData({ ...newSlotData, driver: value });
                    // Tự động cập nhật số điện thoại nếu chọn từ danh sách
                    const driver = driversList.find(d => d.name === value);
                    if (driver) {
                      setNewSlotData(prev => ({ ...prev, phone: driver.phone }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập tên tài xế"
                />
                <datalist id="add-drivers-list">
                  {driversList.map(driver => (
                    <option key={driver.id} value={driver.name}>
                      {driver.phone}
                    </option>
                  ))}
                </datalist>
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={newSlotData.phone}
                  onChange={(e) => setNewSlotData({ ...newSlotData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddNewSlot}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-semibold"
              >
                Thêm
              </button>
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotsNew;