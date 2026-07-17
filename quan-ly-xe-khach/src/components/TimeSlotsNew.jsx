import React, { useState, useEffect, useCallback } from 'react';
import { useBooking } from '../context/BookingContext';
import ConfirmModal from './ConfirmModal';
import SearchableSelect from './SearchableSelect';
import ToastNotification from './ToastNotification';

const TimeSlotsNew = () => {
  const {
    selectedTrip, setSelectedTrip, getBookingsByTimeSlot, setIsSlotSelected,
    currentDayTimeSlots, updateTimeSlot, addNewTimeSlot, changeTimeSlotTime,
    deleteTimeSlot, drivers, vehicles, loading, createTimeSlotsForDate,
    selectedDate, selectedRoute
  } = useBooking();
  const [editingSlot, setEditingSlot] = useState(null);
  const [isCreatingSlots, setIsCreatingSlots] = useState(false);
  const [editData, setEditData] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
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
  // - Ngày đã qua: tất cả đều đã xuất bến
  // - Ngày hôm nay: chỉ khung giờ đã qua mới hiện
  // - Ngày tương lai: không hiện
  const isDeparted = (timeSlot) => {
    if (selectedDate) {
      const today = new Date();
      const todayStr = `${String(today.getDate()).padStart(2,'0')}-${String(today.getMonth()+1).padStart(2,'0')}-${today.getFullYear()}`;
      // Parse selectedDate (DD-MM-YYYY)
      const [dd, mm, yyyy] = selectedDate.split('-').map(Number);
      const selectedDateObj = new Date(yyyy, mm - 1, dd);
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (selectedDateObj < todayDate) return true;   // Ngày đã qua → tất cả đã xuất bến
      if (selectedDateObj > todayDate) return false;   // Ngày tương lai → chưa xuất bến
    }
    // Ngày hôm nay → so sánh giờ
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

    changeTimeSlotTime(slotId, newTime);
    updateTimeSlot(slotId, {
      code: editData.code,
      driver: editData.driver,
      phone: editData.phone,
      type: editData.type,
    });

    // Toast thông báo chi tiết
    const parts = [];
    if (editData.type) parts.push(`Xe: ${editData.type}`);
    if (editData.driver) parts.push(`Tài xế: ${editData.driver}`);
    const detail = parts.length > 0 ? ` — ${parts.join(', ')}` : '';
    showToast(`Đã cập nhật khung giờ ${newTime} tuyến ${selectedRoute}${detail}`, 'success');

    setEditingSlot(null);
    setEditData({});
  };

  const handleAddNewSlot = () => {
    addNewTimeSlot(newSlotData);
    showToast(`Đã thêm khung giờ ${newSlotData.time} tuyến ${selectedRoute}${newSlotData.type ? ` — Xe: ${newSlotData.type}` : ''}`, 'success');
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
    setConfirmModal({
      isOpen: true,
      title: 'Xóa khung giờ',
      message: `Bạn có chắc muốn xóa khung giờ ${time}?`,
      type: 'danger',
      danger: true,
      confirmText: 'Xóa',
      onConfirm: () => {
        setConfirmModal(m => ({ ...m, isOpen: false }));
        deleteTimeSlot(slotId);
        showToast(`Đã xóa khung giờ ${time} tuyến ${selectedRoute}`, 'warning');
        if (selectedTrip.id === slotId) {
          setIsSlotSelected(false);
        }
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setEditData({});
  };

  // Handler tạo timeslots cho ngày hiện tại
  const handleCreateTimeslots = async () => {
    setIsCreatingSlots(true);
    try {
      await createTimeSlotsForDate(selectedDate, selectedRoute);
    } catch (error) {
      console.error('Lỗi tạo timeslots:', error);
    } finally {
      setIsCreatingSlots(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-sky-500 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-3">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      {/* Header thông báo */}
      <div className="mb-3 p-2.5 bg-sky-50 border-l-4 border-sky-500 rounded-r">
        <p className="text-xs font-semibold text-sky-800">
          {selectedTrip ? (
            <>
              Chuyến đang chọn: <span className="text-sky-600 text-sm">{selectedTrip.time}</span> - {selectedTrip.date}
              {selectedTrip.code && <span className="ml-2 text-xs">({selectedTrip.code})</span>}
            </>
          ) : (
            "Chọn một khung giờ để xem thông tin chi tiết"
          )}
        </p>
      </div>

      {/* Empty state - Không có timeslots */}
      {currentDayTimeSlots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có khung giờ</h3>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Ngày {selectedDate} - Tuyến {selectedRoute}
          </p>
          <button
            onClick={handleCreateTimeslots}
            disabled={isCreatingSlots}
            className="px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreatingSlots ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tạo...
              </>
            ) : (
              <>
                <span>+</span>
                Tạo khung giờ mặc định
              </>
            )}
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
        {currentDayTimeSlots.map((slot, index) => {
          const bookingsCount = getBookingsByTimeSlot(slot.id).length;
          const isSelected = selectedTrip?.id === slot.id;
          const hasBookings = bookingsCount > 0;
          const isFull = bookingsCount >= 28;
          const departed = isDeparted(slot.time);
          const fillPct = Math.min(100, (bookingsCount / 28) * 100);

          return (
            <div
              key={slot.id}
              onClick={() => handleSlotClick(slot)}
              className={`
                group relative rounded-lg border cursor-pointer transition-all overflow-hidden
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : hasBookings
                    ? 'border-slate-300 bg-white shadow-sm hover:shadow-md hover:border-blue-400'
                    : 'border-slate-200 bg-white hover:shadow-md hover:border-blue-300'
                }
              `}
            >
              {/* Thanh ngang dưới đáy: đầy theo số ghế đã đặt — to, dễ thấy */}
              <div className="absolute left-0 right-0 bottom-0 h-2.5 bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isFull ? 'bg-emerald-500' : hasBookings ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>

              <div className="px-3 pt-2.5 pb-4">
                {/* Dòng 1: Giờ to | "28/x trống" */}
                <div className="flex items-baseline justify-between gap-1.5">
                  <span className={`text-xl font-semibold tracking-tight leading-none ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                    {slot.time}
                  </span>
                  <span className="text-xs font-medium leading-none">
                    <span className="text-slate-600">28</span>
                    <span className="text-slate-300">/</span>
                    <span className={isFull ? 'text-emerald-600' : hasBookings ? 'text-blue-600' : 'text-slate-400'}>
                      {28 - bookingsCount}
                    </span>
                  </span>
                </div>

                {/* Dòng 2: Tài xế */}
                {(() => {
                  const driverArr = slot.driver ? slot.driver.split(',').map(s => s.trim()).filter(Boolean) : [];
                  const firstDriver = driverArr[0];
                  if (!firstDriver) return <div className="text-[11px] text-slate-400 leading-tight mt-1.5">Xe 28G</div>;
                  return (
                    <div className="text-[11px] text-slate-600 leading-tight mt-1.5 truncate">
                      <span className="text-slate-400">T:</span> {firstDriver}
                    </div>
                  );
                })()}

                {/* Dòng 3: Badge ĐãXB + biển số */}
                {(() => {
                  const plates = slot.code ? slot.code.split(',').map(s => s.trim()).filter(Boolean) : [];
                  const firstPlate = plates[0];
                  return (
                    <div className="flex items-center justify-between gap-1 mt-1.5 min-h-[18px]">
                      {departed ? (
                        <span className="text-[10px] bg-slate-500 text-white px-1.5 py-0.5 rounded font-medium tracking-wide">ĐÃ XB</span>
                      ) : <span />}
                      {firstPlate && (
                        <span className="text-[11px] font-medium text-slate-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded truncate">
                          {firstPlate}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Nút edit hover */}
              <button
                onClick={(e) => handleEditClick(e, slot)}
                className="absolute top-1 right-1 bg-white/95 hover:bg-blue-500 hover:text-white text-slate-500 border border-slate-200 rounded w-5 h-5 flex items-center justify-center text-[10px] transition opacity-0 group-hover:opacity-100"
                title="Chỉnh sửa"
              >
                ✎
              </button>
            </div>
          );
        })}

        {/* Add New Slot Button */}
        <div
          onClick={() => setShowAddSlotModal(true)}
          className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 text-slate-400 transition-all min-h-[80px]"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-light">+</span>
            <span className="text-xs font-medium">Thêm giờ</span>
          </div>
        </div>
      </div>
      )}

      {/* Edit Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCancelEdit}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-sky-600">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
              </div>

              {/* Biển số xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biển số xe
                </label>
                <SearchableSelect
                  options={vehiclesList.map(v => ({ ...v, label: v.type || v.code || '', sub: v.code || '' }))}
                  value={editData.code || ''}
                  onChange={(v) => {
                    if (v) {
                      setEditData(prev => ({ ...prev, code: v.type || v.code || '', type: v.type || '' }));
                    } else {
                      setEditData(prev => ({ ...prev, code: '', type: '' }));
                    }
                  }}
                  placeholder="Chọn biển số xe"
                  displayKey="label"
                  subKey="sub"
                />
              </div>

              {/* Tên tài xế */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài xế
                </label>
                <SearchableSelect
                  options={driversList}
                  value={editData.driver || ''}
                  onChange={(d) => {
                    if (d) {
                      setEditData(prev => ({ ...prev, driver: d.name, phone: d.phone }));
                    } else {
                      setEditData(prev => ({ ...prev, driver: '', phone: '' }));
                    }
                  }}
                  placeholder="Chọn tài xế"
                  displayKey="name"
                  subKey="phone"
                />
                {editData.phone && <p className="text-xs text-gray-500 mt-1">SĐT: {editData.phone}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-sky-500 text-white py-2.5 px-4 rounded-lg hover:bg-sky-600 transition font-semibold shadow-sm"
              >
                Lưu
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-400 text-white py-2.5 px-4 rounded-lg hover:bg-gray-500 transition font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleDeleteSlot(editData.id, editData.time);
                  handleCancelEdit();
                }}
                className="bg-red-500 text-white py-2.5 px-4 rounded-lg hover:bg-red-600 transition font-semibold"
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-sky-600">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
                />
              </div>

              {/* Biển số xe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biển số xe
                </label>
                <SearchableSelect
                  options={vehiclesList.map(v => ({ ...v, label: v.type || v.code || '', sub: v.code || '' }))}
                  value={newSlotData.code}
                  onChange={(v) => {
                    if (v) {
                      setNewSlotData(prev => ({ ...prev, code: v.type || v.code || '', type: v.type || '' }));
                    } else {
                      setNewSlotData(prev => ({ ...prev, code: '', type: '' }));
                    }
                  }}
                  placeholder="Chọn biển số xe"
                  displayKey="label"
                  subKey="sub"
                />
              </div>

              {/* Tên tài xế */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài xế
                </label>
                <SearchableSelect
                  options={driversList}
                  value={newSlotData.driver}
                  onChange={(d) => {
                    if (d) {
                      setNewSlotData(prev => ({ ...prev, driver: d.name, phone: d.phone }));
                    } else {
                      setNewSlotData(prev => ({ ...prev, driver: '', phone: '' }));
                    }
                  }}
                  placeholder="Chọn tài xế"
                  displayKey="name"
                  subKey="phone"
                />
                {newSlotData.phone && <p className="text-xs text-gray-500 mt-1">SĐT: {newSlotData.phone}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddNewSlot}
                className="flex-1 bg-emerald-500 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-600 transition font-semibold shadow-sm"
              >
                Thêm
              </button>
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="flex-1 bg-gray-400 text-white py-2.5 px-4 rounded-lg hover:bg-gray-500 transition font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        danger={confirmModal.danger}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(m => ({ ...m, isOpen: false }))}
      />
    </div>
  );
};

export default TimeSlotsNew;
