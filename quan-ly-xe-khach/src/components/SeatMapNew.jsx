import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import PrintBookingList from './PrintBookingList';
import { findStationWithNumber } from '../data/stations';

const SeatMapNew = () => {
  const { currentDayBookings, deleteBooking, selectedTrip, setShowPassengerForm, showPassengerForm, setSelectedSeatNumber, selectedRoute, selectedDate } = useBooking();
  const [activeTab, setActiveTab] = useState('seatMap');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [sortedBookings, setSortedBookings] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Lọc bookings theo chuyến đang chọn (đã được lọc theo ngày từ context)
  const currentBookings = currentDayBookings.filter(
    booking => booking.timeSlot === selectedTrip.time
  );

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
    // Hiện form hành khách
    setShowPassengerForm(true);
    // Gọi hàm load dữ liệu vào form
    if (window.loadPassengerForm) {
      window.loadPassengerForm(booking);
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa hành khách này?')) {
      deleteBooking(id);
    }
  };

  return (
    <div className="bg-white shadow-sm">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1 p-2">
          <button
            onClick={() => setActiveTab('seatMap')}
            className={`px-4 py-2 rounded-t-md transition ${
              activeTab === 'seatMap'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sơ đồ ghế
          </button>
          <button
            onClick={() => setActiveTab('ticketList')}
            className={`px-4 py-2 rounded-t-md transition ${
              activeTab === 'ticketList'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Danh sách vé ({currentBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-t-md transition ${
              activeTab === 'transfer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Phân tài trung chuyển khách
          </button>
          <button
            onClick={() => setActiveTab('cargo')}
            className={`px-4 py-2 rounded-t-md transition ${
              activeTab === 'cargo'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            <div className="flex flex-wrap gap-1 mb-4 border-b pb-3">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(num => {
                const booking = currentBookings.find(b => b.seatNumber === num);
                const isBooked = !!booking;
                return (
                  <button
                    key={num}
                    onClick={() => isBooked && handleEdit(booking)}
                    className={`w-10 h-10 border-2 rounded text-sm font-semibold transition ${
                      isBooked
                        ? 'bg-green-500 text-white border-green-600 hover:bg-green-600 cursor-pointer'
                        : 'bg-white border-gray-300 hover:border-blue-400 cursor-default'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
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

                return (
                  <div
                    key={seatNum}
                    className={`border-2 rounded-lg p-3 hover:shadow-lg transition ${
                      hasPassenger
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {hasPassenger ? (
                      <>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-2xl font-bold text-blue-600">
                            Ghế {seatNum}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{passenger.phone}</div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-1 mb-2">
                          <div className="font-semibold text-gray-800">{passenger.name}</div>
                          <div className="text-xs text-gray-500">📍 Điểm trả</div>
                          <div className="text-sm text-green-700 font-semibold">
                            {getDeliveryAddress(passenger)}
                          </div>
                          {passenger.note && (
                            <div className="text-sm text-blue-700 font-semibold mt-1">
                              📝 {passenger.note}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`tel:${passenger.phone}`)}
                            className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700 transition flex items-center justify-center"
                          >
                            Gọi
                          </button>
                          <button
                            onClick={() => handleEdit(passenger)}
                            className="flex-1 bg-yellow-500 text-white py-1 px-2 rounded text-sm hover:bg-yellow-600 transition flex items-center justify-center"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(passenger.id)}
                            className="bg-red-500 text-white py-1 px-2 rounded text-sm hover:bg-red-600 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </>
                    ) : (
                      // Ô ghế trống - Click để thêm hành khách
                      <div
                        className="text-center py-8 cursor-pointer hover:bg-gray-100 transition rounded"
                        onClick={() => {
                          setSelectedSeatNumber(seatNum);
                          setShowPassengerForm(true);
                        }}
                      >
                        <div className="text-4xl font-bold text-gray-300 mb-2">
                          Ghế {seatNum}
                        </div>
                        <div className="text-sm text-gray-400">Trống</div>
                        <div className="text-xs text-blue-500 mt-2">Click để thêm</div>
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Kéo thả để sắp xếp</p>
                  <p className="text-xs text-blue-700">Hoặc nhấn nút sắp xếp bên phải</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSortByAddress}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sắp xếp A-Z
                </button>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-semibold shadow-lg"
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
                        ? 'border-blue-400 bg-blue-50 shadow-lg'
                        : dragOverIndex === index
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    {/* Icon kéo */}
                    <div className="text-gray-400 hover:text-blue-500 cursor-grab active:cursor-grabbing flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>

                    {/* Thông tin booking */}
                    <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                      {/* STT */}
                      <div className="col-span-1">
                        <span className="font-bold text-lg text-blue-600">#{index + 1}</span>
                      </div>

                      {/* Tên + SĐT */}
                      <div className="col-span-2">
                        <div className="font-semibold text-gray-800">{booking.name}</div>
                        <div className="text-sm text-gray-600">{booking.phone}</div>
                      </div>

                      {/* Điểm trả */}
                      <div className="col-span-6">
                        <div className="text-xs text-gray-500 mb-1">📍 Điểm trả</div>
                        <div className="font-semibold text-green-700 truncate" title={getDeliveryAddress(booking)}>
                          {getDeliveryAddress(booking)}
                        </div>
                      </div>

                      {/* Ghi chú */}
                      <div className="col-span-2">
                        {booking.note && (
                          <div className="text-xs text-blue-600 truncate" title={booking.note}>
                            📝 {booking.note}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                          title="Sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
