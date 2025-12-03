import React, { useState } from 'react';
import { FaCalendarAlt, FaExchangeAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useBooking } from '../context/BookingContext';
import CalendarPicker from './CalendarPicker';

const RouteFilter = () => {
  const { selectedDate, setSelectedDate, selectedRoute, setSelectedRoute, formatDate } = useBooking();

  // State cho station selection (không còn cần routeFrom vì đã dùng selectedRoute từ context)
  const [stationFrom, setStationFrom] = useState('Trạm An Đông');
  const [stationTo, setStationTo] = useState('Trạm Long Khánh');

  // State cho calendar popup
  const [showCalendar, setShowCalendar] = useState(false);

  // Hàm chuyển sang ngày hôm trước
  const goToPreviousDay = () => {
    const [day, month, year] = selectedDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(formatDate(currentDate));
  };

  // Hàm chuyển sang ngày hôm sau
  const goToNextDay = () => {
    const [day, month, year] = selectedDate.split('-').map(Number);
    const currentDate = new Date(year, month - 1, day);
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(formatDate(currentDate));
  };

  // Hàm set về hôm nay
  const goToToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Button Hôm nay */}
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-medium"
          >
            Hôm nay
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2 relative">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Ngày hôm trước"
            >
              ◀
            </button>
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-4 py-2 border rounded-md bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
              >
                <FaCalendarAlt className="text-blue-600" />
                <span className="font-medium text-gray-800 w-32 text-center">
                  {selectedDate}
                </span>
              </button>

              {/* Calendar Popup */}
              {showCalendar && (
                <>
                  {/* Overlay để đóng calendar khi click bên ngoài */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCalendar(false)}
                  />
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    onClose={() => setShowCalendar(false)}
                  />
                </>
              )}
            </div>
            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-gray-100 rounded transition"
              title="Ngày hôm sau"
            >
              ▶
            </button>
          </div>


          {/* Route Selection with Swap Icon */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50">
              <FaMapMarkerAlt className="text-blue-600" />
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="outline-none bg-transparent font-medium"
              >
                <option>Sài Gòn- Long Khánh</option>
                <option>Long Khánh - Sài Gòn</option>
              </select>
            </div>
          </div>

          {/* Station From and To */}
          <div className="flex items-center gap-3">
            <select
              value={stationFrom}
              onChange={(e) => setStationFrom(e.target.value)}
              className="px-3 py-2 border rounded-md outline-none hover:border-blue-500"
            >
              <option>Trạm An Đông</option>
              <option>Trạm Long Khánh</option>
            </select>

            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <FaExchangeAlt className="text-gray-600" />
            </button>

            <select
              value={stationTo}
              onChange={(e) => setStationTo(e.target.value)}
              className="px-3 py-2 border rounded-md outline-none hover:border-blue-500"
            >
              <option>Trạm Long Khánh</option>
              <option>Trạm An Đông</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteFilter;
