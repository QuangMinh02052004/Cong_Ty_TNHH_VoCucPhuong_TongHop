import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaExchangeAlt, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { useBooking } from '../context/BookingContext';
import CalendarPicker from './CalendarPicker';

const API_URL = '/api/tong-hop';

const RouteFilter = () => {
  const { selectedDate, setSelectedDate, selectedRoute, setSelectedRoute, formatDate } = useBooking();

  // State cho routes từ API
  const [routeOptions, setRouteOptions] = useState([]);

  // State cho station selection
  const [stationFrom, setStationFrom] = useState('Trạm An Đông');
  const [stationTo, setStationTo] = useState('Trạm Long Khánh');

  // Load routes từ API
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await axios.get(`${API_URL}/routes`);
        const activeRoutes = (response.data || []).filter(r => r.isActive);
        setRouteOptions(activeRoutes);
        // Set route đầu tiên nếu chưa có hoặc route hiện tại không có trong danh sách
        if (activeRoutes.length > 0 && (!selectedRoute || !activeRoutes.find(r => r.name === selectedRoute))) {
          setSelectedRoute(activeRoutes[0].name);
        }
      } catch (error) {
        console.error('Lỗi load routes:', error);
        // Fallback hardcoded nếu API lỗi
        setRouteOptions([
          { name: 'Sài Gòn- Long Khánh' },
          { name: 'Long Khánh - Sài Gòn' }
        ]);
      }
    };
    loadRoutes();
  }, []);

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

  // Swap stations
  const swapStations = () => {
    const temp = stationFrom;
    setStationFrom(stationTo);
    setStationTo(temp);
    // Swap route: tìm route tiếp theo trong danh sách
    if (routeOptions.length >= 2) {
      const currentIdx = routeOptions.findIndex(r => r.name === selectedRoute);
      const nextIdx = (currentIdx + 1) % routeOptions.length;
      setSelectedRoute(routeOptions[nextIdx].name);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Button Hôm nay */}
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold shadow-sm"
          >
            Hôm nay
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-1 relative">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-sky-50 rounded-lg transition text-gray-600 hover:text-sky-600"
              title="Ngày hôm trước"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2 px-4 py-2 border border-sky-300 rounded-lg bg-sky-50 hover:bg-sky-100 transition cursor-pointer"
              >
                <FaCalendarAlt className="text-sky-600" />
                <span className="font-semibold text-gray-800 w-28 text-center">
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
              className="p-2 hover:bg-sky-50 rounded-lg transition text-gray-600 hover:text-sky-600"
              title="Ngày hôm sau"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Route Selection */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
              <FaMapMarkerAlt className="text-emerald-600" />
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="outline-none bg-transparent font-semibold text-gray-700 cursor-pointer"
              >
                {routeOptions.map((r) => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Station From and To */}
          <div className="flex items-center gap-2">
            <select
              value={stationFrom}
              onChange={(e) => setStationFrom(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg outline-none hover:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white font-medium transition"
            >
              <option>Trạm An Đông</option>
              <option>Trạm Long Khánh</option>
            </select>

            <button
              onClick={swapStations}
              className="p-2 hover:bg-sky-50 rounded-lg transition text-gray-500 hover:text-sky-600"
              title="Đổi chiều"
            >
              <FaExchangeAlt />
            </button>

            <select
              value={stationTo}
              onChange={(e) => setStationTo(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg outline-none hover:border-sky-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white font-medium transition"
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
