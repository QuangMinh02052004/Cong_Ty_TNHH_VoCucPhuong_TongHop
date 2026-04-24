import React, { useState, useEffect, useRef } from 'react';
import { FaCalendarAlt, FaExchangeAlt, FaMapMarkerAlt, FaRoute, FaCog, FaEye, FaEyeSlash, FaSyncAlt } from 'react-icons/fa';
import axios from 'axios';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import CalendarPicker from './CalendarPicker';

const API_URL = '/api/tong-hop';

const RouteFilter = () => {
  const { selectedDate, setSelectedDate, selectedRoute, setSelectedRoute, formatDate, refreshData } = useBooking();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State cho routes từ API
  const [routeOptions, setRouteOptions] = useState([]);

  // State cho custom route dropdown
  const [routeDropdownOpen, setRouteDropdownOpen] = useState(false);
  const [routeSearch, setRouteSearch] = useState('');
  const [showRouteSettings, setShowRouteSettings] = useState(false);
  const [hiddenRoutes, setHiddenRoutes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hiddenRoutes') || '[]');
    } catch { return []; }
  });
  const routeDropdownRef = useRef(null);
  const routeInputRef = useRef(null);
  const routeSettingsRef = useRef(null);

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

  // Click outside để đóng route dropdown + settings
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (routeDropdownRef.current && !routeDropdownRef.current.contains(e.target)) {
        setRouteDropdownOpen(false);
        setRouteSearch('');
      }
      if (routeSettingsRef.current && !routeSettingsRef.current.contains(e.target)) {
        setShowRouteSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle ẩn/hiện tuyến
  const toggleRouteVisibility = (routeName) => {
    setHiddenRoutes(prev => {
      const updated = prev.includes(routeName)
        ? prev.filter(r => r !== routeName)
        : [...prev, routeName];
      localStorage.setItem('hiddenRoutes', JSON.stringify(updated));
      return updated;
    });
  };

  // Visible routes (loại bỏ tuyến bị ẩn)
  const visibleRoutes = routeOptions.filter(r => !hiddenRoutes.includes(r.name));

  // Filter routes theo search (chỉ trong visible)
  const filteredRoutes = visibleRoutes.filter(r =>
    !routeSearch || r.name.toLowerCase().includes(routeSearch.toLowerCase())
  );

  // Nếu route đang chọn bị ẩn → chuyển sang route visible đầu tiên
  useEffect(() => {
    if (selectedRoute && hiddenRoutes.includes(selectedRoute) && visibleRoutes.length > 0) {
      setSelectedRoute(visibleRoutes[0].name);
    }
  }, [hiddenRoutes, visibleRoutes, selectedRoute]);

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
    // Swap route: chỉ cycle trong visible routes
    if (visibleRoutes.length >= 2) {
      const currentIdx = visibleRoutes.findIndex(r => r.name === selectedRoute);
      const nextIdx = (currentIdx + 1) % visibleRoutes.length;
      setSelectedRoute(visibleRoutes[nextIdx].name);
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

          {/* Route Selection - Custom Dropdown + Settings */}
          <div className="flex items-center gap-1">
            <div className="relative" ref={routeDropdownRef}>
              <div
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:border-sky-400 transition cursor-pointer min-w-[260px]"
                onClick={() => {
                  setRouteDropdownOpen(!routeDropdownOpen);
                  setShowRouteSettings(false);
                  if (!routeDropdownOpen) {
                    setRouteSearch('');
                    setTimeout(() => routeInputRef.current?.focus(), 50);
                  }
                }}
              >
                <FaRoute className="text-emerald-600 flex-shrink-0" />
                {routeDropdownOpen ? (
                  <input
                    ref={routeInputRef}
                    type="text"
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { setRouteDropdownOpen(false); setRouteSearch(''); }
                      if (e.key === 'Enter' && filteredRoutes.length > 0) {
                        setSelectedRoute(filteredRoutes[0].name);
                        setRouteDropdownOpen(false);
                        setRouteSearch('');
                      }
                    }}
                    className="flex-1 outline-none text-sm bg-transparent font-semibold text-gray-700"
                    placeholder="Tìm tuyến..."
                    autoComplete="off"
                  />
                ) : (
                  <span className="flex-1 font-semibold text-gray-700 text-sm truncate">
                    {selectedRoute || 'Chọn tuyến...'}
                  </span>
                )}
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={routeDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </div>

              {routeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {filteredRoutes.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">Không tìm thấy</div>
                  ) : (
                    filteredRoutes.map((r) => {
                      const isSelected = selectedRoute === r.name;
                      return (
                        <div
                          key={r.name}
                          onClick={() => {
                            setSelectedRoute(r.name);
                            setRouteDropdownOpen(false);
                            setRouteSearch('');
                          }}
                          className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-sky-50 transition ${isSelected ? 'text-sky-600 font-semibold bg-sky-50' : 'text-gray-700'}`}
                        >
                          <span>{r.name}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-sky-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Nút cài đặt ẩn/hiện tuyến - chỉ admin */}
            {isAdmin && (
              <div className="relative" ref={routeSettingsRef}>
                <button
                  onClick={() => { setShowRouteSettings(!showRouteSettings); setRouteDropdownOpen(false); }}
                  className={`p-2 rounded-lg transition ${showRouteSettings ? 'bg-sky-100 text-sky-600' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                  title="Ẩn/hiện tuyến"
                >
                  <FaCog className="w-4 h-4" />
                </button>

                {showRouteSettings && (
                  <div className="absolute z-50 right-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Ẩn/hiện tuyến</span>
                      <span className="text-xs text-gray-400">{visibleRoutes.length}/{routeOptions.length} tuyến</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {routeOptions.map((r) => {
                        const isHidden = hiddenRoutes.includes(r.name);
                        return (
                          <div
                            key={r.name}
                            onClick={() => toggleRouteVisibility(r.name)}
                            className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 transition ${isHidden ? 'opacity-50' : ''}`}
                          >
                            <span className={isHidden ? 'line-through text-gray-400' : 'text-gray-700'}>{r.name}</span>
                            {isHidden ? (
                              <FaEyeSlash className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            ) : (
                              <FaEye className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
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

            {/* Nút Refresh */}
            <button
              onClick={async () => {
                setIsRefreshing(true);
                await refreshData();
                setIsRefreshing(false);
              }}
              title="Làm mới dữ liệu"
              className="p-2 hover:bg-sky-50 rounded-lg transition text-gray-500 hover:text-sky-600"
            >
              <FaSyncAlt className={isRefreshing ? 'animate-spin text-sky-500' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteFilter;
