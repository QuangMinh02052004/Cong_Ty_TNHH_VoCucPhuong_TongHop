import React, { useState } from 'react';
import { FaPhoneAlt } from 'react-icons/fa';

const SeatMap = () => {
  const [activeTab, setActiveTab] = useState('seatMap');
  const [selectedSeats, setSelectedSeats] = useState([1, 2]);

  // Dữ liệu ghế (1-28)
  const seats = Array.from({ length: 28 }, (_, i) => ({
    number: i + 1,
    status: [1, 2].includes(i + 1) ? 'booked' : 'available',
    passenger: [1, 2].includes(i + 1) ? passengerData[Math.floor(i / 2)] : null,
  }));

  // Dữ liệu hành khách mẫu
  const passengerList = [
    {
      stt: 1,
      name: '51. Nhà thọ Tân Bắc',
      phone: '0376 670 275',
      address: 'Trạm Long Khánh',
      subAddress: '(I) 251125-7832440',
      note: 'giao loan 1 thùng bông',
    },
    {
      stt: 2,
      name: '22. Ngã 4 Bình Thái',
      phone: '0989 347 425',
      address: 'Trạm Long Khánh',
      note: '1 ghế',
    },
    {
      stt: 3,
      name: '67. Chợ Bầu Cá',
      phone: '0877606606',
      address: 'Trạm Long Khánh',
      subAddress: '(I) 251130-4084118',
      note: 'giao cưỡng 1 thùng',
    },
  ];

  const handleSeatClick = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
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
            Danh sách vé
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
            {/* Seat Numbers */}
            <div className="flex flex-wrap gap-1 mb-4 border-b pb-3">
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map(num => (
                <button
                  key={num}
                  onClick={() => handleSeatClick(num)}
                  className={`w-10 h-10 border-2 rounded text-sm font-semibold transition ${
                    selectedSeats.includes(num)
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Passenger Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
              {passengerList.map((passenger, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-300 rounded-lg p-3 hover:shadow-md transition"
                >
                  {/* Header với số ghế */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl font-bold text-blue-600">
                      {passenger.stt}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{passenger.phone}</div>
                    </div>
                  </div>

                  {/* Địa chỉ */}
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600">📍</span>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-800">{passenger.name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">🚌</span>
                      <div className="text-sm text-gray-600">{passenger.address}</div>
                    </div>
                    {passenger.subAddress && (
                      <div className="text-xs text-gray-500 ml-6">{passenger.subAddress}</div>
                    )}
                  </div>

                  {/* Ghi chú */}
                  <div className="mt-2 pt-2 border-t text-sm">
                    <span className="text-blue-600 font-semibold">*{passenger.note}</span>
                  </div>

                  {/* Action Button */}
                  <button className="mt-2 w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2">
                    <FaPhoneAlt /> Gọi
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ticketList' && (
          <div className="overflow-x-auto">
            <div className="mb-4 flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Làm mới danh sách
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Sắp xếp danh sách
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                Xem danh sách vé
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                In
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Liên hệ: 1900 7034</p>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-center mb-2">DANH SÁCH HÀNH KHÁCH</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">Tuyến:</span> Sài Gòn- Long Khánh</p>
                  <p><span className="font-semibold">Giờ chạy:</span> 05:30 26-11-2025</p>
                  <p><span className="font-semibold">Biển số:</span> 60BO5307</p>
                </div>
                <div className="text-right">
                  <p><span className="font-semibold">Tài xế:</span> TX Thanh Bắc.</p>
                  <p><span className="font-semibold">Phụ xe:</span> Đang cập nhật</p>
                  <p><span className="font-semibold">Số vé:</span> 2</p>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2 text-left">STT</th>
                  <th className="border p-2 text-left">Điểm lên</th>
                  <th className="border p-2 text-left">Số Điện Thoại</th>
                  <th className="border p-2 text-left">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {passengerList.map((passenger, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2">{passenger.stt}</td>
                    <td className="border p-2">{passenger.name}</td>
                    <td className="border p-2">{passenger.phone}</td>
                    <td className="border p-2 text-blue-600 font-semibold">{passenger.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

// Dữ liệu hành khách cho ghế
const passengerData = [
  {
    name: '51. Nhà thọ Tân Bắc',
    phone: '0376 670 275',
  },
  {
    name: '22. Ngã 4 Bình Thái',
    phone: '0989 347 425',
  },
];

export default SeatMap;
