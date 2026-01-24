import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import PrintBookingList from './PrintBookingList';
import { findStationWithNumber } from '../data/stations';

const SeatMapNew = () => {
  const {
    currentDayBookings,
    deleteBooking,
    selectedTrip,
    setShowPassengerForm,
    showPassengerForm,
    setSelectedSeatNumber,
    selectedRoute,
    selectedDate,
    setEditingBooking,
    // Seat lock functions
    lockSeat,
    releaseSeat,
    isSeatLocked,
    isSeatLockedByMe,
    getSeatLockInfo,
    currentUserName
  } = useBooking();
  const [activeTab, setActiveTab] = useState('seatMap');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [sortedBookings, setSortedBookings] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Lọc bookings theo chuyến đang chọn (đã được lọc theo ngày từ context)
  // ✅ Fix: Match bằng cả timeSlotId VÀ timeSlot để đảm bảo không miss booking
  const currentBookings = selectedTrip
    ? currentDayBookings.filter(booking => {
        // Match bằng timeSlotId (chính xác nhất)
        if (booking.timeSlotId === selectedTrip.id) return true;
        // Fallback: match bằng timeSlot string
        if (booking.timeSlot === selectedTrip.time) return true;
        return false;
      })
    : [];

  // Debug log để kiểm tra matching
  if (selectedTrip && currentDayBookings.length > 0) {
    console.log(`[SeatMap] Trip: ${selectedTrip.time} (ID: ${selectedTrip.id}), Matched: ${currentBookings.length}/${currentDayBookings.length}`);
  }

  // Đồng bộ danh sách với currentBookings (giữ nguyên thứ tự đã sắp)
  useEffect(() => {
    const currentIds = currentBookings.map(b => b.id);
    const sortedIds = sortedBookings.map(b => b.id);

    // Kiểm tra xem có booking mới hoặc bị xóa không
    const hasNewBookings = currentIds.some(id => !sortedIds.includes(id));
    const hasDeletedBookings = sortedIds.some(id => !currentIds.includes(id));

    if (hasNewBookings || hasDeletedBookings) {
      // Giữ lại các booking cũ (theo thứ tự hiện tại)
      const keptBookings = sortedBookings.filter(b => currentIds.includes(b.id));
      // Tìm các booking mới
      const newBookings = currentBookings.filter(b => !sortedIds.includes(b.id));
      // Thêm booking mới vào cuối
      setSortedBookings([...keptBookings, ...newBookings]);
    }
  }, [currentBookings.length]); // Chỉ trigger khi length thay đổi

  // Xử lý kéo thả
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newList = [...sortedBookings];
      const draggedItem = newList[draggedIndex];
      newList.splice(draggedIndex, 1);
      newList.splice(dropIndex, 0, draggedItem);
      setSortedBookings(newList);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Hàm sắp xếp theo địa chỉ trả (dropoff)
  const handleSortByAddress = () => {
    const sorted = [...sortedBookings].sort((a, b) => {
      const addressA = a.dropoffAddress || a.dropoffMethod || '';
      const addressB = b.dropoffAddress || b.dropoffMethod || '';
      return addressA.localeCompare(addressB, 'vi');
    });
    setSortedBookings(sorted);
  };

  // Lấy địa chỉ giao (ưu tiên dropoffAddress, nếu không có thì dùng dropoffMethod)
  const getDeliveryAddress = (booking) => {
    // Nếu có dropoffAddress, tìm và thêm STT
    if (booking.dropoffAddress && booking.dropoffAddress.trim()) {
      const withNumber = findStationWithNumber(booking.dropoffAddress);
      return withNumber || booking.dropoffAddress;
    }
    // Nếu không có địa chỉ cụ thể, hiển thị phương thức
    return booking.dropoffMethod || 'Tại bến';
  };

  const handleEdit = (booking) => {
    // Set booking cần edit vào context TRƯỚC khi hiện form
    setEditingBooking(booking);
    // Hiện form hành khách
    setShowPassengerForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa hành khách này?')) {
      deleteBooking(id);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 p-2">
          <button
            onClick={() => setActiveTab('seatMap')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'seatMap'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sơ đồ ghế
          </button>
          <button
            onClick={() => setActiveTab('ticketList')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'ticketList'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Danh sách vé ({currentBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'transfer'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Phân tài trung chuyển khách
          </button>
          <button
            onClick={() => setActiveTab('cargo')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'cargo'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hàng trên xe
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'seatMap' && (
          <div>
            {/* Seat Numbers - 28 ghế từ 1-28 */}
            <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200 pb-3">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(num => {
                const booking = currentBookings.find(b => b.seatNumber === num);
                const isBooked = !!booking;
                const isLocked = selectedTrip && isSeatLocked(selectedTrip.id, num);
                const isLockedByMe = selectedTrip && isSeatLockedByMe(selectedTrip.id, num);
                const lockInfo = selectedTrip && getSeatLockInfo(selectedTrip.id, num);

                // Xác định màu và trạng thái của ghế
                let buttonClass = 'bg-white border-gray-300 hover:border-sky-400 cursor-pointer';
                let title = `Ghế ${num} - Trống`;

                if (isBooked) {
                  buttonClass = 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 cursor-pointer';
                  title = `Ghế ${num} - ${booking.name}`;
                } else if (isLocked) {
                  // Ghế bị khóa: nền xám, không cho click
                  buttonClass = 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed';
                  title = `Ghế ${num} - Đã bị khóa bởi ${lockInfo?.lockedBy}`;
                } else if (isLockedByMe) {
                  buttonClass = 'bg-sky-400 text-white border-sky-500 hover:bg-sky-500 cursor-pointer';
                  title = `Ghế ${num} - Bạn đang chọn ghế này`;
                }

                return (
                  <button
                    key={num}
                    onClick={() => {
                      if (isBooked) {
                        handleEdit(booking);
                      } else if (!isLocked) {
                        // Ghế trống hoặc do mình khóa - có thể click
                      }
                    }}
                    disabled={isLocked}
                    title={title}
                    className={`w-10 h-10 border-2 rounded-lg text-sm font-semibold transition ${buttonClass}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Chú thích màu ghế */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                <span className="text-gray-600">Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 border-2 border-emerald-600 rounded"></div>
                <span className="text-gray-600">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded relative">
                  <svg className="w-3 h-3 text-red-500 absolute -top-1 -right-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-600">Đang bị khóa (người khác)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-400 border-2 border-sky-500 rounded"></div>
                <span className="text-gray-600">Bạn đang chọn</span>
              </div>
            </div>

            {/* Passenger Cards - Hiển thị 28 ô ghế - Tự động tăng cột khi form ẩn */}
            <div className={`grid grid-cols-1 gap-3 ${
              showPassengerForm
                ? 'lg:grid-cols-2 xl:grid-cols-3'
                : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            }`}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((seatNum) => {
                const passenger = currentBookings.find(b => b.seatNumber === seatNum);
                const hasPassenger = !!passenger;
                const isLocked = selectedTrip && isSeatLocked(selectedTrip.id, seatNum);
                const isLockedByMe = selectedTrip && isSeatLockedByMe(selectedTrip.id, seatNum);
                const lockInfo = selectedTrip && getSeatLockInfo(selectedTrip.id, seatNum);

                // Xử lý click vào ghế trống
                const handleSeatClick = async () => {
                  if (!selectedTrip) {
                    alert('Vui lòng chọn khung giờ trước khi đặt ghế!\n\nNếu chưa có khung giờ, hãy bấm nút "+" bên danh sách khung giờ để tạo mới.');
                    return;
                  }

                  // Nếu ghế đã bị người khác khóa, hiển thị thông báo
                  if (isLocked) {
                    alert(`Ghế ${seatNum} đang được ${lockInfo?.lockedBy} điền thông tin.\nVui lòng chọn ghế khác hoặc đợi 10 phút.`);
                    return;
                  }

                  // Khóa ghế trước khi mở form
                  const result = await lockSeat(selectedTrip.id, seatNum);

                  if (result.success || isLockedByMe) {
                    // Khóa thành công hoặc đã khóa trước đó, mở form
                    setSelectedSeatNumber(seatNum);
                    setShowPassengerForm(true);
                  } else if (result.locked) {
                    // Ghế đã bị khóa bởi người khác (race condition)
                    alert(result.message);
                  }
                };

                // Xác định style cho card
                let cardClass = 'border-gray-200 bg-gray-50';
                if (hasPassenger) {
                  cardClass = 'border-sky-300 bg-sky-50';
                } else if (isLocked) {
                  // Ghế bị khóa: nền xám, viền đỏ nhạt
                  cardClass = 'border-gray-400 bg-gray-200';
                } else if (isLockedByMe) {
                  cardClass = 'border-sky-400 bg-sky-100';
                }

                return (
                  <div
                    key={seatNum}
                    className={`border-2 rounded-lg p-3 hover:shadow-lg transition ${cardClass}`}
                  >
                    {hasPassenger ? (
                      <>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-2xl font-bold text-sky-600">
                            Ghế {seatNum}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{passenger.phone}</div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-1 mb-2">
                          <div className="font-semibold text-gray-800">{passenger.name}</div>
                          <div className="text-xs text-gray-500">Điểm trả</div>
                          <div className="text-sm text-emerald-700 font-semibold">
                            {getDeliveryAddress(passenger)}
                          </div>
                          {passenger.note && (
                            <div className="text-sm text-sky-700 font-semibold mt-1">
                              {passenger.note}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`tel:${passenger.phone}`)}
                            className="flex-1 bg-sky-500 text-white py-1 px-2 rounded-lg text-sm hover:bg-sky-600 transition flex items-center justify-center"
                          >
                            Gọi
                          </button>
                          <button
                            onClick={() => handleEdit(passenger)}
                            className="flex-1 bg-amber-500 text-white py-1 px-2 rounded-lg text-sm hover:bg-amber-600 transition flex items-center justify-center"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(passenger.id)}
                            className="bg-red-500 text-white py-1 px-2 rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </>
                    ) : isLocked ? (
                      // Ô ghế bị người khác khóa - hiển thị ổ khóa và nền xám
                      <div className="text-center py-6 cursor-not-allowed opacity-70">
                        <div className="relative">
                          <div className="text-4xl font-bold text-gray-400 mb-2">
                            Ghế {seatNum}
                          </div>
                          {/* Biểu tượng ổ khóa */}
                          <div className="absolute -top-1 -right-1">
                            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-sm text-red-600 font-semibold flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Đã bị khóa
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          bởi {lockInfo?.lockedBy}
                        </div>
                      </div>
                    ) : isLockedByMe ? (
                      // Ô ghế do mình khóa
                      <div
                        className="text-center py-8 cursor-pointer hover:bg-sky-200 transition rounded"
                        onClick={handleSeatClick}
                      >
                        <div className="text-4xl font-bold text-sky-500 mb-2">
                          Ghế {seatNum}
                        </div>
                        <div className="text-sm text-sky-600 font-semibold">
                          Bạn đang chọn
                        </div>
                        <div className="text-xs text-sky-500 mt-2">Click để tiếp tục</div>
                      </div>
                    ) : (
                      // Ô ghế trống - Click để thêm hành khách
                      <div
                        className="text-center py-8 cursor-pointer hover:bg-gray-100 transition rounded"
                        onClick={handleSeatClick}
                      >
                        <div className="text-4xl font-bold text-gray-300 mb-2">
                          Ghế {seatNum}
                        </div>
                        <div className="text-sm text-gray-400">Trống</div>
                        <div className="text-xs text-sky-500 mt-2">Click để thêm</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ticketList' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-sky-800">Kéo thả để sắp xếp</p>
                  <p className="text-xs text-sky-700">Hoặc nhấn nút sắp xếp bên phải</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSortByAddress}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 font-semibold shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sắp xếp A-Z
                </button>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 font-semibold shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  In danh sách
                </button>
              </div>
            </div>

            {sortedBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">Chưa có vé nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-lg cursor-move transition-all ${
                      draggedIndex === index
                        ? 'border-sky-400 bg-sky-50 shadow-lg'
                        : dragOverIndex === index
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-200 hover:border-sky-300 hover:shadow-md'
                    }`}
                  >
                    {/* Icon kéo */}
                    <div className="text-gray-400 hover:text-sky-500 cursor-grab active:cursor-grabbing flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>

                    {/* Thông tin booking */}
                    <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                      {/* STT */}
                      <div className="col-span-1">
                        <span className="font-bold text-lg text-sky-600">#{index + 1}</span>
                      </div>

                      {/* Tên + SĐT */}
                      <div className="col-span-2">
                        <div className="font-semibold text-gray-800">{booking.name}</div>
                        <div className="text-sm text-gray-600">{booking.phone}</div>
                      </div>

                      {/* TimeSlot + Date */}
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Khung giờ</div>
                        <div className="font-semibold text-purple-600">
                          {booking.timeSlot || '-'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {booking.date || '-'}
                        </div>
                      </div>

                      {/* Điểm trả */}
                      <div className="col-span-4">
                        <div className="text-xs text-gray-500 mb-1">Điểm trả</div>
                        <div className="font-semibold text-emerald-700 truncate" title={getDeliveryAddress(booking)}>
                          {getDeliveryAddress(booking)}
                        </div>
                      </div>

                      {/* Ghi chú */}
                      <div className="col-span-2">
                        {booking.note && (
                          <div className="text-xs text-sky-600 truncate" title={booking.note}>
                            {booking.note}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                          title="Sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="text-center py-8 text-gray-500">
            Chức năng đang được phát triển...
          </div>
        )}

        {activeTab === 'cargo' && (
          <div className="text-center py-8 text-gray-500">
            Chức năng đang được phát triển...
          </div>
        )}
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <PrintBookingList
          onClose={() => setShowPrintModal(false)}
          sortedBookings={sortedBookings}
        />
      )}
    </div>
  );
};

export default SeatMapNew;
