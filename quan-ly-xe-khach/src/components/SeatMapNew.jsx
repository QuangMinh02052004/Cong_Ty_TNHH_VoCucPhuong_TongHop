import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';

const SeatMapNew = () => {
  const { bookings, deleteBooking, selectedTrip, setShowPassengerForm, showPassengerForm } = useBooking();
  const [activeTab, setActiveTab] = useState('seatMap');

  // Lọc bookings theo chuyến đang chọn
  const currentBookings = bookings.filter(
    booking => booking.timeSlot === selectedTrip.time
  );

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
                          <div className="text-sm text-gray-600">
                            📍 {passenger.pickupAddress}
                          </div>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              passenger.pickupMethod === 'Dọc đường'
                                ? 'bg-orange-200 text-orange-800'
                                : 'bg-green-200 text-green-800'
                            }`}>
                              {passenger.pickupMethod}
                            </span>
                          </div>
                          {passenger.note && (
                            <div className="text-sm text-blue-700 font-semibold">
                              * {passenger.note}
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
                        onClick={() => setShowPassengerForm(true)}
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
          <div className="overflow-x-auto">
            <div className="mb-4 flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Làm mới
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Sắp xếp
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                In danh sách
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-center mb-2">DANH SÁCH HÀNH KHÁCH</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">Tuyến:</span> Sài Gòn - Long Khánh</p>
                  <p><span className="font-semibold">Giờ chạy:</span> {selectedTrip.time} 26-11-2025</p>
                  <p><span className="font-semibold">Biển số:</span> {selectedTrip.code}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-semibold">Số vé:</span> {currentBookings.length}</p>
                  <p><span className="font-semibold">Dọc đường:</span> {currentBookings.filter(b => b.pickupMethod === 'Dọc đường').length}</p>
                  <p><span className="font-semibold">Tại bến:</span> {currentBookings.filter(b => b.pickupMethod === 'Tại bến').length}</p>
                </div>
              </div>
            </div>

            {currentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Chưa có vé nào
              </div>
            ) : (
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">STT</th>
                    <th className="border p-2">Ghế</th>
                    <th className="border p-2">Họ tên</th>
                    <th className="border p-2">Điện thoại</th>
                    <th className="border p-2">Điểm lên</th>
                    <th className="border p-2">Cách đón</th>
                    <th className="border p-2">Ghi chú</th>
                    <th className="border p-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((passenger, index) => (
                    <tr key={passenger.id} className="hover:bg-gray-50">
                      <td className="border p-2 text-center">{index + 1}</td>
                      <td className="border p-2 text-center font-bold">{passenger.seatNumber || '-'}</td>
                      <td className="border p-2">{passenger.name}</td>
                      <td className="border p-2">{passenger.phone}</td>
                      <td className="border p-2">{passenger.pickupAddress}</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          passenger.pickupMethod === 'Dọc đường'
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-green-200 text-green-800'
                        }`}>
                          {passenger.pickupMethod}
                        </span>
                      </td>
                      <td className="border p-2 text-blue-600">{passenger.note}</td>
                      <td className="border p-2">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleEdit(passenger)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(passenger.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </div>
  );
};

export default SeatMapNew;
