import { useState, useEffect, useRef } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import VehicleDriverManagement from './VehicleDriverManagement';

const Timeline = () => {
  const { selectedTrip, selectedDate, selectedRoute, bookings, updateTimeSlot, changeTimeSlotTime, drivers, vehicles, showToast } = useBooking();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showVehicleDriverModal, setShowVehicleDriverModal] = useState(false);

  // Sử dụng danh sách tài xế và xe từ database
  const driversList = drivers;
  const vehiclesList = vehicles;

  const [tripInfo, setTripInfo] = useState({
    departureTime: '05:30',
  });

  // State cho nhiều biển số và nhiều tài xế
  const [vehicleCodes, setVehicleCodes] = useState([]);
  const [driverNames, setDriverNames] = useState([]);
  const [newVehicle, setNewVehicle] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const vehicleRef = useRef(null);
  const driverRef = useRef(null);

  const currentBookings = selectedTrip ? bookings.filter(b => b.timeSlotId === selectedTrip.id) : [];
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

  // Parse ngày
  const getDateInfo = () => {
    if (!selectedDate) return { dayName: '', formattedDate: '', lunarDate: '' };
    const [day, month, year] = selectedDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    // Tính âm lịch
    const lunarDate = convertSolarToLunar(day, month, year);

    return {
      dayName: dayNames[date.getDay()],
      formattedDate: `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`,
      lunarDate: `${lunarDate.day} - ${lunarDate.month} - ${lunarDate.year}`
    };
  };

  // Chuyển đổi dương lịch sang âm lịch (thuật toán đơn giản)
  const convertSolarToLunar = (dd, mm, yy) => {
    const PI = Math.PI;
    const INT = Math.floor;

    const jdFromDate = (dd, mm, yy) => {
      let a = INT((14 - mm) / 12);
      let y = yy + 4800 - a;
      let m = mm + 12 * a - 3;
      let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
      if (jd < 2299161) {
        jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
      }
      return jd;
    };

    const getNewMoonDay = (k, timeZone) => {
      let T = k / 1236.85;
      let T2 = T * T;
      let T3 = T2 * T;
      let dr = PI / 180;
      let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
      Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
      let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
      let Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
      let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
      let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
      C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
      C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
      C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
      C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
      C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
      C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
      let deltat = (timeZone < 0) ? -timeZone : timeZone;
      deltat = deltat * 24;
      return INT(Jd1 + C1 - deltat / 24);
    };

    const getSunLongitude = (jdn, timeZone) => {
      let T = (jdn - 2451545.5 - timeZone / 24) / 36525;
      let T2 = T * T;
      let dr = PI / 180;
      let M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
      let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
      let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
      DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
      let L = L0 + DL;
      L = L * dr;
      L = L - PI * 2 * (INT(L / (PI * 2)));
      return INT(L / PI * 6);
    };

    const getLunarMonth11 = (yy, timeZone) => {
      let off = jdFromDate(31, 12, yy) - 2415021;
      let k = INT(off / 29.530588853);
      let nm = getNewMoonDay(k, timeZone);
      let sunLong = getSunLongitude(nm, timeZone);
      if (sunLong >= 9) {
        nm = getNewMoonDay(k - 1, timeZone);
      }
      return nm;
    };

    const getLeapMonthOffset = (a11, timeZone) => {
      let k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
      let last = 0;
      let i = 1;
      let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
      do {
        last = arc;
        i++;
        arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
      } while (arc !== last && i < 14);
      return i - 1;
    };

    const timeZone = 7;
    let dayNumber = jdFromDate(dd, mm, yy);
    let k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    let monthStart = getNewMoonDay(k + 1, timeZone);
    if (monthStart > dayNumber) {
      monthStart = getNewMoonDay(k, timeZone);
    }
    let a11 = getLunarMonth11(yy, timeZone);
    let b11 = a11;
    let lunarYear;
    if (a11 >= monthStart) {
      lunarYear = yy;
      a11 = getLunarMonth11(yy - 1, timeZone);
    } else {
      lunarYear = yy + 1;
      b11 = getLunarMonth11(yy + 1, timeZone);
    }
    let lunarDay = dayNumber - monthStart + 1;
    let diff = INT((monthStart - a11) / 29);
    let lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      let leapMonthDiff = getLeapMonthOffset(a11, timeZone);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
      }
    }
    if (lunarMonth > 12) {
      lunarMonth = lunarMonth - 12;
    }
    if (lunarMonth >= 11 && diff < 4) {
      lunarYear -= 1;
    }
    return { day: lunarDay, month: lunarMonth, year: lunarYear };
  };

  // Lấy trạm
  const getStations = () => {
    if (selectedRoute === 'Long Khánh - Sài Gòn') {
      return { from: 'Trạm Long Khánh', to: 'Trạm An Đông', toTime: '06:30' };
    }
    return { from: 'Trạm An Đông', to: 'Trạm Long Khánh', toTime: '08:30' };
  };

  // Đồng bộ thông tin khi chuyển khung giờ
  useEffect(() => {
    if (selectedTrip) {
      // Parse nhiều biển số và tài xế từ database (lưu dạng comma-separated)
      const codes = selectedTrip.code ? selectedTrip.code.split(',').map(c => c.trim()).filter(c => c) : [];
      const names = selectedTrip.driver ? selectedTrip.driver.split(',').map(d => d.trim()).filter(d => d) : [];
      setVehicleCodes(codes);
      setDriverNames(names);
      setTripInfo(prev => ({
        ...prev,
        departureTime: selectedTrip.time || '05:30',
      }));
    }
  }, [selectedTrip]);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (vehicleRef.current && !vehicleRef.current.contains(e.target)) {
        setShowVehicleDropdown(false); setVehicleSearch('');
      }
      if (driverRef.current && !driverRef.current.contains(e.target)) {
        setShowDriverDropdown(false); setDriverSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Thêm biển số từ dropdown (ưu tiên dùng type = biển số thực)
  const addVehicleFromList = (vehicle) => {
    const vPlate = vehicle.type || vehicle.code || vehicle.plate || '';
    if (vPlate && !vehicleCodes.includes(vPlate)) {
      const updated = [...vehicleCodes, vPlate];
      setVehicleCodes(updated);
      updateTimeSlot(selectedTrip.id, { code: updated.join(', ') });
      showToast(`Đã thêm xe ${vPlate} vào chuyến ${selectedTrip?.time} tuyến ${selectedRoute}`, 'success');
    }
    setShowVehicleDropdown(false);
    setVehicleSearch('');
  };

  // Xóa biển số
  const removeVehicle = (code) => {
    const updated = vehicleCodes.filter(c => c !== code);
    setVehicleCodes(updated);
    updateTimeSlot(selectedTrip.id, { code: updated.join(', ') });
    showToast(`Đã xóa xe ${code} khỏi chuyến ${selectedTrip?.time} tuyến ${selectedRoute}`, 'warning');
  };

  // Thêm tài xế từ dropdown
  const addDriverFromList = (driver) => {
    if (!driverNames.includes(driver.name)) {
      const updated = [...driverNames, driver.name];
      setDriverNames(updated);
      updateTimeSlot(selectedTrip.id, { driver: updated.join(', ') });
      showToast(`Đã thêm tài xế ${driver.name} vào chuyến ${selectedTrip?.time} tuyến ${selectedRoute}`, 'success');
    }
    setShowDriverDropdown(false);
    setDriverSearch('');
  };

  // Xóa tài xế
  const removeDriver = (name) => {
    const updated = driverNames.filter(n => n !== name);
    setDriverNames(updated);
    updateTimeSlot(selectedTrip.id, { driver: updated.join(', ') });
    showToast(`Đã xóa tài xế ${name} khỏi chuyến ${selectedTrip?.time} tuyến ${selectedRoute}`, 'warning');
  };

  // Lọc danh sách
  const filteredVehicles = vehiclesList.filter(v =>
    (v.code || '').toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    (v.type || '').toLowerCase().includes(vehicleSearch.toLowerCase())
  );
  const filteredDrivers = driversList.filter(d =>
    (d.name || '').toLowerCase().includes(driverSearch.toLowerCase()) ||
    (d.phone || '').toLowerCase().includes(driverSearch.toLowerCase())
  );

  const dateInfo = getDateInfo();
  const stations = getStations();

  return (
    <>
    <div className="bg-white shadow-sm p-2">
      {/* Trip Info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between text-base mb-2">
          {/* Biển số - Cho phép nhiều, chỉ chọn từ DB */}
          <div className="flex items-center gap-2 relative" ref={vehicleRef}>
            <span className="font-semibold">Biển số:</span>
            {isAdmin && (
              <button
                onClick={() => setShowVehicleDriverModal(true)}
                className="text-xs px-2 py-0.5 text-amber-600 border border-amber-300 rounded hover:bg-amber-50 transition"
                title="Quản lý xe & tài xế"
              >⚙ Quản lý</button>
            )}
            {vehicleCodes.map((code, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-400 rounded text-sm font-bold">
                {code}
                <button onClick={() => removeVehicle(code)} className="text-amber-600 hover:text-red-500 font-bold text-xs">×</button>
              </span>
            ))}
            <div className="relative">
              <input
                type="text"
                value={vehicleSearch}
                onChange={(e) => { setVehicleSearch(e.target.value); setShowVehicleDropdown(true); }}
                onFocus={() => setShowVehicleDropdown(true)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none w-36"
                placeholder="Thêm biển số"
                autoComplete="off"
              />
              {showVehicleDropdown && (
                <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {filteredVehicles.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Không tìm thấy</div>
                  ) : filteredVehicles.map(v => {
                    const vCode = v.code || v.plate || '';
                    const vPlate = v.type || vCode;
                    const selected = vehicleCodes.includes(vPlate) || vehicleCodes.includes(vCode);
                    return (
                      <div key={v.id} onClick={() => addVehicleFromList(v)}
                        className={`px-4 py-2.5 text-base cursor-pointer flex items-center justify-between hover:bg-amber-50 ${selected ? 'text-amber-600 font-semibold bg-amber-50' : 'text-gray-700'}`}>
                        <div>
                          <span className="font-bold text-base">{v.type || vCode}</span>
                          {v.code && <span className="text-xs text-gray-400 ml-2">({v.code})</span>}
                        </div>
                        {selected && <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Tài xế - Cho phép nhiều, chỉ chọn từ DB */}
          <div className="flex items-center gap-2 relative" ref={driverRef}>
            <span className="font-semibold">Tài xế:</span>
            {driverNames.map((name, idx) => {
              const driver = driversList.find(d => d.name === name);
              return (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-100 border border-sky-300 rounded text-sm font-medium">
                  {name}
                  {driver && <span className="text-xs text-sky-600">({driver.phone})</span>}
                  <button onClick={() => removeDriver(name)} className="text-sky-600 hover:text-red-500 font-bold text-xs">×</button>
                </span>
              );
            })}
            <div className="relative">
              <input
                type="text"
                value={driverSearch}
                onChange={(e) => { setDriverSearch(e.target.value); setShowDriverDropdown(true); }}
                onFocus={() => setShowDriverDropdown(true)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 outline-none w-36"
                placeholder="Thêm tài xế"
                autoComplete="off"
              />
              {showDriverDropdown && (
                <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {filteredDrivers.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400">Không tìm thấy</div>
                  ) : filteredDrivers.map(d => {
                    const selected = driverNames.includes(d.name);
                    return (
                      <div key={d.id} onClick={() => addDriverFromList(d)}
                        className={`px-4 py-2.5 text-base cursor-pointer flex items-center justify-between hover:bg-sky-50 ${selected ? 'text-sky-600 font-semibold bg-sky-50' : 'text-gray-700'}`}>
                        <div><span className="font-semibold">{d.name}</span><span className="text-sm text-gray-400 ml-3">{d.phone}</span></div>
                        {selected && <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    );
                  })}
                </div>
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
        <div className="flex items-center justify-between text-base">
          {/* Giờ khởi hành - Input inline */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Khởi hành:</span>
            <input
              type="time"
              value={tripInfo.departureTime}
              onChange={(e) => {
                const newTime = e.target.value;
                setTripInfo({ ...tripInfo, departureTime: newTime });
                if (selectedTrip && selectedTrip.time !== newTime) {
                  changeTimeSlotTime(selectedTrip.id, newTime);
                }
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-gray-600">{dateInfo.formattedDate}</span>
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
        <div className="text-center text-base font-semibold text-gray-600 mb-2">
          {tripInfo.departureTime} {dateInfo.dayName} {dateInfo.formattedDate}
        </div>

        {/* Progress Container */}
        <div className="relative flex items-center">
          {/* Start Point */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="text-sm font-semibold mt-1 text-green-700">{stations.from}</div>
            <div className="text-sm text-gray-500">{tripInfo.departureTime}</div>
          </div>

          {/* Progress Bar - Hiển thị số ghế đã booking */}
          <div className="flex-1 mx-4 relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${(totalTickets / 28) * 100}%` }}
              ></div>
            </div>

            {/* Số ghế đã booking */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow">
              {totalTickets > 0 && `${totalTickets}/28`}
            </div>

            {/* Âm lịch - Above Bar */}
            <div className="absolute -top-6 left-0 right-0 text-center text-xs text-gray-600">
              (Âm lịch) {dateInfo.lunarDate}
            </div>
          </div>

          {/* End Point */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="text-sm font-semibold mt-1 text-green-700">{stations.to}</div>
            <div className="text-sm text-gray-500">{stations.toTime}</div>
          </div>
        </div>

        {/* Stats Below */}
        <div className="mt-4 flex items-center justify-between text-sm">
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

    {showVehicleDriverModal && (
      <VehicleDriverManagement onClose={() => setShowVehicleDriverModal(false)} />
    )}
    </>
  );
};

export default Timeline;
