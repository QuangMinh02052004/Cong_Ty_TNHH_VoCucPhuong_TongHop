import { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';

const Timeline = () => {
  const { selectedTrip, bookings, updateTimeSlot } = useBooking();

  // Danh sách tài xế
  const [driversList, setDriversList] = useState([
    { id: 1, name: 'TX Thanh Bắc', phone: '0918026316' },
    { id: 2, name: 'TX. Phong M X', phone: '0912345678' },
    { id: 3, name: 'TX. Minh', phone: '0987654321' },
    { id: 4, name: 'TX. Hùng', phone: '0909123456' },
  ]);

  // Danh sách biển số xe
  const [vehiclesList, setVehiclesList] = useState([
    { id: 1, code: '60BO5307', type: 'Xe 28G' },
    { id: 2, code: '51B26542', type: 'Xe 28G' },
    { id: 3, code: '51B12345', type: 'Xe 16G' },
    { id: 4, code: '60BO1234', type: 'Xe 28G' },
  ]);

  const [tripInfo, setTripInfo] = useState({
    vehicleCode: '60BO5307',
    driverName: 'TX Thanh Bắc',
    driverPhone: '0918026316',
    departureTime: '05:30',
    departureDate: '26-11-2025',
    startStation: 'Trạm An Đông',
    endStation: 'Trạm Long Khánh',
    arrivalTime: '08:30',
  });

  const currentBookings = bookings.filter(b => b.timeSlot === selectedTrip.time);
  const totalTickets = currentBookings.length;
  const paidTickets = currentBookings.filter(b => b.paid >= b.amount).length;
  const docDuongCount = currentBookings.filter(b => b.pickupMethod === 'Dọc đường').length;
  const taiBenCount = currentBookings.filter(b => b.pickupMethod === 'Tại bến').length;
  const taiNhaCount = currentBookings.filter(b => b.pickupMethod === 'Tại nhà').length;

  // Tính toán tiền
  const totalAmount = currentBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const paidAmount = currentBookings.reduce((sum, b) => sum + (b.paid || 0), 0);
  const remainingAmount = totalAmount - paidAmount;

  // Format tiền VND
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Đồng bộ thông tin khi chuyển khung giờ
  useEffect(() => {
    if (selectedTrip) {
      setTripInfo(prev => ({
        ...prev,
        vehicleCode: selectedTrip.code || '',
        driverName: selectedTrip.driver || '',
        driverPhone: selectedTrip.phone || '',
        departureTime: selectedTrip.time || '05:30',
      }));
    }
  }, [selectedTrip]);

  return (
    <div className="bg-white shadow-sm p-2">
      {/* Trip Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          {/* Biển số - Input with datalist */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Biển số:</span>
            <input
              type="text"
              list="vehicles-list"
              value={tripInfo.vehicleCode}
              onChange={(e) => {
                const value = e.target.value;
                setTripInfo({ ...tripInfo, vehicleCode: value });
                // Tự động cập nhật vào time slot
                const vehicle = vehiclesList.find(v => v.code === value);
                if (vehicle) {
                  updateTimeSlot(selectedTrip.time, {
                    code: vehicle.code,
                    type: vehicle.type,
                  });
                }
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none w-32"
              placeholder="Nhập biển số"
            />
            <datalist id="vehicles-list">
              {vehiclesList.map(vehicle => (
                <option key={vehicle.id} value={vehicle.code}>
                  {vehicle.type}
                </option>
              ))}
            </datalist>
          </div>

          {/* Tài xế - Input with datalist */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Tài xế:</span>
            <div className="flex items-center gap-1">
              <input
                type="text"
                list="drivers-list"
                value={tripInfo.driverName}
                onChange={(e) => {
                  const value = e.target.value;
                  setTripInfo({ ...tripInfo, driverName: value });
                  // Tự động cập nhật số điện thoại nếu chọn từ danh sách
                  const driver = driversList.find(d => d.name === value);
                  if (driver) {
                    setTripInfo(prev => ({ ...prev, driverPhone: driver.phone }));
                    updateTimeSlot(selectedTrip.time, {
                      driver: driver.name,
                      phone: driver.phone,
                    });
                  }
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none w-32"
                placeholder="Nhập tên tài xế"
              />
              <datalist id="drivers-list">
                {driversList.map(driver => (
                  <option key={driver.id} value={driver.name}>
                    {driver.phone}
                  </option>
                ))}
              </datalist>
              {tripInfo.driverPhone && (
                <span className="text-xs text-gray-600">({tripInfo.driverPhone})</span>
              )}
            </div>
          </div>

          <div>
            <span className="font-semibold">Vé đã TT/Tổng:</span> {paidTickets} / {totalTickets}
          </div>
          <div>
            <span className="font-semibold">Số hàng:</span> 0
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          {/* Giờ khởi hành - Input inline */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Khởi hành:</span>
            <input
              type="time"
              value={tripInfo.departureTime}
              onChange={(e) => setTripInfo({ ...tripInfo, departureTime: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="text"
              value={tripInfo.departureDate}
              onChange={(e) => setTripInfo({ ...tripInfo, departureDate: e.target.value })}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none w-32"
              placeholder="DD-MM-YYYY"
            />
          </div>
          <div>
            <span className="font-semibold">Tiền đã TT/Tổng:</span> {formatMoney(paidAmount)} / {formatMoney(totalAmount)}
          </div>
          <div>
            <span className="font-semibold">Còn lại:</span> <span className="text-red-600 font-bold">{formatMoney(remainingAmount)}</span>
          </div>
        </div>
      </div>

      {/* Timeline Bar */}
      <div className="relative">
        {/* Time Label */}
        <div className="text-center text-sm font-semibold text-gray-600 mb-2">
          03:00 Thứ 4 26-11-2025
        </div>

        {/* Progress Container */}
        <div className="relative flex items-center">
          {/* Start Point */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="text-xs font-semibold mt-1 text-green-700">Trạm An Đông</div>
            <div className="text-xs text-gray-500">05:30</div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 mx-4 relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-400 w-full"></div>
            </div>

            {/* Status Label Above Bar */}
            <div className="absolute -top-6 left-0 right-0 text-center text-xs text-gray-600">
              (Ấm lịch) 7 - 10 - 2025
            </div>
          </div>

          {/* End Point */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="text-xs font-semibold mt-1 text-green-700">Trạm Long Khánh</div>
            <div className="text-xs text-gray-500">08:30</div>
          </div>
        </div>

        {/* Stats Below */}
        <div className="mt-4 flex items-center justify-between text-xs">
          <div className="flex gap-4">
            <span className="font-semibold">Xe hợp đồng: <span className="text-blue-600">0</span></span>
            <span className="font-semibold">Đ.tại nhà: <span className="text-blue-600">{taiNhaCount}</span></span>
            <span className="font-semibold">Đ.dọc đường: <span className="text-blue-600">{docDuongCount}</span></span>
            <span className="font-semibold">Đ.tại Bến: <span className="text-blue-600">{taiBenCount}</span></span>
            <span className="font-semibold">Đ.Trung chuyển: <span className="text-blue-600">0</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
