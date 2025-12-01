import React, { useState } from 'react';
import { FaCalendarAlt, FaExchangeAlt, FaMapMarkerAlt } from 'react-icons/fa';

const RouteFilter = () => {
  const [selectedDate, setSelectedDate] = useState('26-11-2025');
  const [routeFrom, setRouteFrom] = useState('Sài Gòn- Long Khánh');
  const [stationFrom, setStationFrom] = useState('Trạm An Đông');
  const [stationTo, setStationTo] = useState('Trạm Long Khánh');

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Button Hôm nay */}
          <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-medium">
            Hôm nay
          </button>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded">◀</button>
            <div className="flex items-center gap-2 px-4 py-2 border rounded-md">
              <FaCalendarAlt className="text-blue-600" />
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none w-32 font-medium"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded">▶</button>
          </div>

          {/* Dropdown Tất cả/Chọn loại xe */}
          <select className="px-4 py-2 border rounded-md outline-none hover:border-blue-500 transition">
            <option>Tất cả</option>
            <option>Chọn loại xe</option>
            <option>Xe 28G</option>
          </select>

          {/* Route Selection with Swap Icon */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50">
              <FaMapMarkerAlt className="text-blue-600" />
              <select
                value={routeFrom}
                onChange={(e) => setRouteFrom(e.target.value)}
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
