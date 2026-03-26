import { createContext, useContext, useState, useEffect } from 'react';
import { timeSlotAPI, bookingAPI, driverAPI, vehicleAPI, seatLockAPI } from '../services/api';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

// Helper function để format ngày thành DD-MM-YYYY
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const BookingProvider = ({ children }) => {
  // Lấy thông tin user đăng nhập từ AuthContext
  const { user } = useAuth();

  // State cho ngày đang chọn (mặc định là hôm nay)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // State cho tuyến đường đang chọn (sẽ được RouteFilter set từ API)
  const [selectedRoute, setSelectedRoute] = useState('');

  // State cho danh sách đặt vé
  const [bookings, setBookings] = useState([]);

  // State cho chuyến xe đang chọn
  const [selectedTrip, setSelectedTrip] = useState(null);

  // State để theo dõi xem đã chọn khung giờ chưa
  const [isSlotSelected, setIsSlotSelected] = useState(false);

  // State để theo dõi việc hiển thị form hành khách
  const [showPassengerForm, setShowPassengerForm] = useState(false);

  // State cho số ghế đang chọn
  const [selectedSeatNumber, setSelectedSeatNumber] = useState(null);

  // State cho booking đang được edit (để form có thể load ngay)
  const [editingBooking, setEditingBooking] = useState(null);

  // State cho các khung giờ
  const [timeSlots, setTimeSlots] = useState([]);

  // State cho danh sách tài xế và xe
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // State loading
  const [loading, setLoading] = useState(true);

  // State cho seat locks (khóa ghế tạm thời)
  const [seatLocks, setSeatLocks] = useState([]);

  // State cho chuyển booking (hàng đợi - mảng nhiều booking)
  const [transferQueue, setTransferQueue] = useState([]);

  // Tên người dùng hiện tại (dùng để identify ai đang khóa ghế)
  // Sử dụng fullName hoặc username từ user đăng nhập
  const currentUserName = user?.fullName || user?.username || 'Unknown';

  // Lọc timeslots theo ngày VÀ tuyến đường đang chọn
  const currentDayTimeSlots = timeSlots.filter(slot => {
    const matchDate = slot.date === selectedDate;
    const matchRoute = slot.route === selectedRoute;
    return matchDate && matchRoute;
  });

  // Lọc bookings theo ngày VÀ tuyến đường đang chọn
  const currentDayBookings = bookings.filter(booking => {
    const matchDate = booking.date === selectedDate;
    const matchRoute = booking.route === selectedRoute;
    return matchDate && matchRoute;
  });

  // Load dữ liệu ban đầu từ database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load tất cả dữ liệu song song
        const [slotsData, bookingsData, driversData, vehiclesData] = await Promise.all([
          timeSlotAPI.getAll(),
          bookingAPI.getAll(),
          driverAPI.getAll(),
          vehicleAPI.getAll(),
        ]);

        setTimeSlots(slotsData);
        setBookings(bookingsData);
        setDrivers(driversData);
        setVehicles(vehiclesData);

        // Lấy danh sách các ngày có trong database
        const uniqueDates = [...new Set(slotsData.map(slot => slot.date))];

        console.log('✅ Đã load dữ liệu từ database:', {
          timeSlots: slotsData.length,
          bookings: bookingsData.length,
          drivers: driversData.length,
          vehicles: vehiclesData.length,
        });
        console.log('📅 Các ngày có timeslots trong database:', uniqueDates);
        console.log('📅 Ngày hiện tại đang chọn:', formatDate(new Date()));

      } catch (error) {
        console.error('❌ Lỗi load dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-refresh bookings VÀ timeslots - 30 giây để giảm tải cho Vercel
  useEffect(() => {
    const refreshData = async () => {
      try {
        // Refresh cả bookings VÀ timeslots để đảm bảo sync
        const [bookingsData, slotsData] = await Promise.all([
          bookingAPI.getAll(),
          timeSlotAPI.getAll()
        ]);
        setBookings(bookingsData);
        setTimeSlots(slotsData);
        console.log(`🔄 Auto-refresh: ${bookingsData.length} bookings, ${slotsData.length} timeslots`);
      } catch (error) {
        console.error('❌ Lỗi refresh data:', error);
      }
    };

    // Refresh mỗi 30 giây (Vercel có cold start nên cần giảm tần suất)
    const intervalId = setInterval(refreshData, 30000);

    // Cleanup khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Auto-refresh seat locks - tăng lên 15 giây
  useEffect(() => {
    const refreshSeatLocks = async () => {
      try {
        if (selectedDate && selectedRoute) {
          const locksData = await seatLockAPI.getByDateRoute(selectedDate, selectedRoute);
          setSeatLocks(locksData);
        }
      } catch (error) {
        console.error('❌ Lỗi refresh seat locks:', error);
      }
    };

    // Load ngay lần đầu
    refreshSeatLocks();

    // Refresh mỗi 15 giây
    const intervalId = setInterval(refreshSeatLocks, 15000);

    // Cleanup khi component unmount
    return () => clearInterval(intervalId);
  }, [selectedDate, selectedRoute]);

  // Release tất cả locks của user khi đóng tab/browser
  useEffect(() => {
    if (!currentUserName || currentUserName === 'Unknown') return;

    const handleBeforeUnload = () => {
      // Gọi API để release tất cả locks của user này
      navigator.sendBeacon(
        'https://vocucphuongmanage.vercel.app/api/tong-hop/seat-locks/release-all',
        JSON.stringify({ lockedBy: currentUserName })
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUserName, user]);

  // Tạo timeslots cho ngày mới và tuyến mới (template khác nhau cho từng tuyến)
  const createTimeSlotsForDate = async (date, route) => {
    try {
      console.log(`🔄 Đang tạo timeslots cho ngày ${date}, tuyến ${route}...`);

      // Lấy thông tin tuyến từ API để dùng giờ chạy đúng
      let startTime = '05:30', endTime = '20:00', interval = 30;
      try {
        const res = await fetch('https://vocucphuongmanage.vercel.app/api/tong-hop/routes');
        if (res.ok) {
          const allRoutes = await res.json();
          const matched = allRoutes.find(r => r.name === route);
          if (matched) {
            startTime = matched.operatingStart || startTime;
            endTime = matched.operatingEnd || endTime;
            interval = matched.intervalMinutes || interval;
            console.log(`📋 Route API: ${route} → ${startTime}-${endTime}, ${interval}p/chuyến`);
          }
        }
      } catch (e) {
        console.warn('⚠️ Không lấy được route info từ API, dùng mặc định');
      }

      // Fallback: detect hướng tuyến nếu không match API
      const routeLower = route.toLowerCase();
      const isFromLK = routeLower.startsWith('long khánh') || routeLower.startsWith('xuân lộc');
      if (startTime === '05:30' && endTime === '20:00' && isFromLK) {
        startTime = '03:30';
        endTime = '18:00';
      }

      // Generate time template từ startTime → endTime, mỗi interval phút
      const timeTemplate = [];
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let currentMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      while (currentMinutes <= endMinutes) {
        const h = String(Math.floor(currentMinutes / 60)).padStart(2, '0');
        const m = String(currentMinutes % 60).padStart(2, '0');
        timeTemplate.push(`${h}:${m}`);
        currentMinutes += interval;
      }
      console.log(`📋 Generated ${timeTemplate.length} timeslots: ${startTime}-${endTime} (${interval}p) cho tuyến: ${route}`);

      const newSlots = [];
      for (const time of timeTemplate) {
        const slotData = {
          time: time,
          date: date,
          route: route,  // Thêm tuyến đường
          type: 'Xe 28G',
          code: null,  // Biển số trống
          driver: null,  // Tên tài xế trống
          phone: null,  // Số điện thoại trống
        };

        const createdSlot = await timeSlotAPI.create(slotData);
        newSlots.push(createdSlot);
      }

      // Dùng functional update để tránh stale closure
      setTimeSlots(prev => sortTimeSlots([...prev, ...newSlots]));
      console.log(`✅ Đã tạo ${newSlots.length} timeslots cho ngày ${date}, tuyến ${route}`);
      return newSlots;
    } catch (error) {
      console.error('❌ Lỗi tạo timeslots:', error);
      throw error;
    }
  };

  // Reset tất cả state khi chuyển ngày hoặc tuyến (để tránh hiển thị dữ liệu cũ)
  useEffect(() => {
    const handleDateOrRouteChange = async () => {
      // Bỏ qua nếu route chưa được set (đợi RouteFilter load từ API)
      if (!selectedRoute) return;

      console.log(`🔄 Đang chuyển sang ngày ${selectedDate}, tuyến ${selectedRoute}...`);

      // Reset các state liên quan đến việc đặt vé
      setSelectedSeatNumber(null);
      setShowPassengerForm(false);
      setIsSlotSelected(false);
      setSelectedTrip(null);

      // Sau khi reset, kiểm tra xem ngày và tuyến này có timeslots chưa
      if (!loading) {
        // Lọc timeslots của ngày và tuyến hiện tại
        const slotsForDateAndRoute = timeSlots.filter(slot =>
          slot.date === selectedDate && slot.route === selectedRoute
        );

        if (slotsForDateAndRoute.length > 0) {
          // Đã có timeslots, chọn khung giờ đầu tiên (sorted by time)
          const sortedSlots = sortTimeSlots(slotsForDateAndRoute);
          setSelectedTrip(sortedSlots[0]);
          setIsSlotSelected(true);
          console.log(`✅ Đã chuyển sang ngày ${selectedDate}, tuyến ${selectedRoute}, có ${slotsForDateAndRoute.length} timeslots`);
        } else {
          // Chưa có timeslots cho ngày/tuyến này -> TỰ ĐỘNG TẠO
          console.log(`📅 Ngày ${selectedDate}, tuyến ${selectedRoute} chưa có timeslots. Đang tạo tự động...`);
          try {
            const newSlots = await createTimeSlotsForDate(selectedDate, selectedRoute);
            if (newSlots && newSlots.length > 0) {
              const sortedNewSlots = sortTimeSlots(newSlots);
              setSelectedTrip(sortedNewSlots[0]);
              setIsSlotSelected(true);
            }
          } catch (error) {
            console.error('❌ Lỗi tạo timeslots tự động:', error);
          }
        }
      }
    };

    handleDateOrRouteChange();
  }, [selectedDate, selectedRoute, loading]); // Bỏ timeSlots khỏi dependencies để tránh vòng lặp

  // Thêm booking mới
  const addBooking = async (bookingData) => {
    try {
      const newBookingData = {
        ...bookingData,
        timeSlotId: selectedTrip.id,
        timeSlot: selectedTrip.time,
        date: selectedTrip.date,
        route: selectedTrip.route,  // Thêm tuyến đường
      };

      const newBooking = await bookingAPI.create(newBookingData);
      setBookings([...bookings, newBooking]);
      console.log('✅ Đã thêm booking:', newBooking);
      return newBooking;
    } catch (error) {
      console.error('❌ Lỗi thêm booking:', error);
      throw error;
    }
  };

  // Cập nhật booking
  const updateBooking = async (id, updatedData) => {
    try {
      const updatedBooking = await bookingAPI.patch(id, updatedData);
      setBookings(bookings.map(booking =>
        booking.id === id ? updatedBooking : booking
      ));
      console.log('✅ Đã cập nhật booking:', updatedBooking);
    } catch (error) {
      console.error('❌ Lỗi cập nhật booking:', error);
      throw error;
    }
  };

  // Xóa booking
  const deleteBooking = async (id) => {
    try {
      await bookingAPI.delete(id);
      setBookings(bookings.filter(booking => booking.id !== id));
      console.log('✅ Đã xóa booking ID:', id);
    } catch (error) {
      console.error('❌ Lỗi xóa booking:', error);
      throw error;
    }
  };

  // Lấy bookings theo timeSlotId
  const getBookingsByTimeSlot = (slotId) => {
    return bookings.filter(booking => booking.timeSlotId === slotId);
  };

  // Hàm sắp xếp các khung giờ theo thời gian
  const sortTimeSlots = (slots) => {
    return [...slots].sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      const aTotal = aHours * 60 + aMinutes;
      const bTotal = bHours * 60 + bMinutes;
      return aTotal - bTotal;
    });
  };

  // Cập nhật thông tin khung giờ (biển số xe, tài xế, v.v.)
  const updateTimeSlot = async (slotId, updatedData) => {
    try {
      const updatedSlot = await timeSlotAPI.patch(slotId, updatedData);
      const updated = timeSlots.map(slot =>
        slot.id === slotId ? updatedSlot : slot
      );
      setTimeSlots(sortTimeSlots(updated));

      // Cập nhật selectedTrip nếu đang chọn slot này
      if (selectedTrip && selectedTrip.id === slotId) {
        setSelectedTrip(updatedSlot);
      }

      console.log('✅ Đã cập nhật time slot:', updatedSlot);
    } catch (error) {
      console.error('❌ Lỗi cập nhật time slot:', error);
      throw error;
    }
  };

  // Thêm khung giờ mới
  const addNewTimeSlot = async (newSlot) => {
    try {
      const slotData = {
        time: newSlot.time || '06:00',
        date: newSlot.date || selectedDate,  // Sử dụng ngày đang chọn
        route: newSlot.route || selectedRoute,  // ✅ Thêm trường route
        type: newSlot.type || 'Xe 28G',
        code: newSlot.code || '',
        driver: newSlot.driver || '',
        phone: newSlot.phone || '',
      };

      const createdSlot = await timeSlotAPI.create(slotData);
      const updated = [...timeSlots, createdSlot];
      setTimeSlots(sortTimeSlots(updated));
      console.log('✅ Đã thêm time slot:', createdSlot);
      return createdSlot;
    } catch (error) {
      console.error('❌ Lỗi thêm time slot:', error);
      throw error;
    }
  };

  // Thay đổi giờ của một khung giờ
  const changeTimeSlotTime = async (slotId, newTime) => {
    try {
      // Cập nhật time slot
      const updatedSlot = await timeSlotAPI.patch(slotId, { time: newTime });

      // Cập nhật trong state và sắp xếp lại
      const updated = timeSlots.map(slot =>
        slot.id === slotId ? updatedSlot : slot
      );
      setTimeSlots(sortTimeSlots(updated));

      // Cập nhật tất cả bookings của khung giờ này
      const slotBookings = bookings.filter(b => b.timeSlotId === slotId);
      for (const booking of slotBookings) {
        await bookingAPI.patch(booking.id, { timeSlot: newTime });
      }

      // Reload bookings để đảm bảo đồng bộ
      const allBookings = await bookingAPI.getAll();
      setBookings(allBookings);

      // Cập nhật selectedTrip nếu đang chọn khung giờ này
      if (selectedTrip && selectedTrip.id === slotId) {
        setSelectedTrip(updatedSlot);
      }

      console.log('✅ Đã thay đổi giờ time slot:', updatedSlot);
    } catch (error) {
      console.error('❌ Lỗi thay đổi giờ time slot:', error);
      throw error;
    }
  };

  // Xóa khung giờ
  const deleteTimeSlot = async (slotId) => {
    try {
      await timeSlotAPI.delete(slotId);
      setTimeSlots(timeSlots.filter(slot => slot.id !== slotId));

      // Bookings sẽ tự động bị xóa do CASCADE trong database
      // Nhưng ta cần cập nhật state
      setBookings(bookings.filter(booking => booking.timeSlotId !== slotId));

      console.log('✅ Đã xóa time slot ID:', slotId);
    } catch (error) {
      console.error('❌ Lỗi xóa time slot:', error);
      throw error;
    }
  };

  // ============ SEAT LOCK FUNCTIONS ============

  // Khóa ghế khi user bắt đầu điền form
  const lockSeat = async (timeSlotId, seatNumber) => {
    try {
      const result = await seatLockAPI.create({
        timeSlotId,
        seatNumber,
        lockedBy: currentUserName,
        date: selectedDate,
        route: selectedRoute
      });

      if (result.success) {
        console.log(`🔒 Đã khóa ghế ${seatNumber}:`, result.message);
        // Refresh locks ngay
        const locksData = await seatLockAPI.getByDateRoute(selectedDate, selectedRoute);
        setSeatLocks(locksData);
        return { success: true, lock: result.lock };
      }
      return result;
    } catch (error) {
      // Nếu lỗi 409 = ghế đã bị khóa bởi người khác
      if (error.response && error.response.status === 409) {
        const data = error.response.data;
        console.warn(`⚠️ Ghế ${seatNumber} đã bị khóa bởi ${data.lockedBy}`);
        return {
          success: false,
          locked: true,
          lockedBy: data.lockedBy,
          message: data.message
        };
      }
      console.error('❌ Lỗi khóa ghế:', error);
      throw error;
    }
  };

  // Mở khóa ghế khi user hủy hoặc hoàn tất booking
  const releaseSeat = async (timeSlotId, seatNumber) => {
    try {
      const requestData = {
        timeSlotId,
        seatNumber,
        date: selectedDate,
        route: selectedRoute,
        lockedBy: currentUserName
      };
      console.log(`🔓 Đang mở khóa ghế ${seatNumber}...`, requestData);

      const result = await seatLockAPI.deleteBySeat(requestData);
      console.log(`✅ Kết quả mở khóa ghế ${seatNumber}:`, result);

      // Refresh locks ngay
      const locksData = await seatLockAPI.getByDateRoute(selectedDate, selectedRoute);
      setSeatLocks(locksData);
    } catch (error) {
      console.error('❌ Lỗi mở khóa ghế:', error);
      console.error('❌ Error response:', error.response?.data);
    }
  };

  // Kiểm tra ghế có bị khóa không (bởi người khác)
  const isSeatLocked = (timeSlotId, seatNumber) => {
    const lock = seatLocks.find(
      l => l.timeSlotId === timeSlotId && l.seatNumber === seatNumber
    );
    // Ghế bị khóa nếu có lock VÀ không phải do chính mình khóa
    return lock && lock.lockedBy !== currentUserName;
  };

  // Kiểm tra ghế có đang được chính mình khóa không
  const isSeatLockedByMe = (timeSlotId, seatNumber) => {
    const lock = seatLocks.find(
      l => l.timeSlotId === timeSlotId && l.seatNumber === seatNumber
    );
    return lock && lock.lockedBy === currentUserName;
  };

  // Lấy thông tin lock của ghế
  const getSeatLockInfo = (timeSlotId, seatNumber) => {
    return seatLocks.find(
      l => l.timeSlotId === timeSlotId && l.seatNumber === seatNumber
    );
  };

  // Lọc seat locks theo timeSlotId
  const getSeatLocksByTimeSlot = (timeSlotId) => {
    return seatLocks.filter(lock => lock.timeSlotId === timeSlotId);
  };

  const value = {
    selectedDate,
    setSelectedDate,
    selectedRoute,
    setSelectedRoute,
    bookings,
    currentDayBookings,
    selectedTrip,
    setSelectedTrip,
    isSlotSelected,
    setIsSlotSelected,
    showPassengerForm,
    setShowPassengerForm,
    selectedSeatNumber,
    setSelectedSeatNumber,
    editingBooking,
    setEditingBooking,
    timeSlots,
    currentDayTimeSlots,
    drivers,
    vehicles,
    loading,
    updateTimeSlot,
    addNewTimeSlot,
    changeTimeSlotTime,
    deleteTimeSlot,
    createTimeSlotsForDate,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingsByTimeSlot,
    formatDate,
    // Seat lock functions
    seatLocks,
    currentUserName,
    lockSeat,
    releaseSeat,
    isSeatLocked,
    isSeatLockedByMe,
    getSeatLockInfo,
    getSeatLocksByTimeSlot,
    // Transfer booking functions
    transferQueue,
    setTransferQueue,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
