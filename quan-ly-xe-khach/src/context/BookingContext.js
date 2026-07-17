import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Global toast
  const [globalToast, setGlobalToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setGlobalToast({ message, type });
  }, []);

  // State cho ngày đang chọn (mặc định là hôm nay)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // State cho tuyến đường đang chọn (lưu vào localStorage để giữ sau F5)
  const [selectedRoute, setSelectedRoute] = useState(() => {
    return localStorage.getItem('lastSelectedRoute') || '';
  });

  // Lưu selectedRoute vào localStorage mỗi khi thay đổi
  const setSelectedRouteAndSave = (route) => {
    localStorage.setItem('lastSelectedRoute', route);
    setSelectedRoute(route);
  };

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

  // Load dữ liệu ban đầu từ database (KHÔNG load tất cả timeslots - sẽ load theo date+route)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [bookingsData, driversData, vehiclesData] = await Promise.all([
          bookingAPI.getAll(),
          driverAPI.getAll(),
          vehicleAPI.getAll(),
        ]);

        setBookings(bookingsData);
        setDrivers(driversData);
        setVehicles(vehiclesData);

        console.log('✅ Đã load dữ liệu từ database:', {
          bookings: bookingsData.length,
          drivers: driversData.length,
          vehicles: vehiclesData.length,
        });

      } catch (error) {
        console.error('❌ Lỗi load dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Hàm refresh data thủ công (dùng cho nút Refresh và auto-refresh)
  const refreshData = async () => {
    try {
      const bookingsData = await bookingAPI.getAll();
      setBookings(bookingsData);

      // Refresh timeslots cho date+route hiện tại nếu có
      if (selectedDate && selectedRoute) {
        const params = new URLSearchParams({ date: selectedDate, route: selectedRoute });
        const res = await fetch(`https://vocucphuongmanage.vercel.app/api/tong-hop/timeslots?${params}`);
        if (res.ok) {
          const routeSlots = await res.json();
          setTimeSlots(prev => {
            const otherSlots = prev.filter(s => !(s.date === selectedDate && s.route === selectedRoute));
            return sortTimeSlots([...otherSlots, ...routeSlots]);
          });
        }
      }
    } catch (error) {
      console.error('❌ Lỗi refresh data:', error);
    }
  };

  // Auto-refresh bookings - 30 giây full reload (bắt DELETE), pause khi tab ẩn
  useEffect(() => {
    let intervalId = null;
    const start = () => { if (!intervalId) intervalId = setInterval(refreshData, 30000); };
    const stop = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };
    const onVis = () => { if (document.hidden) stop(); else { refreshData(); start(); } };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVis);
    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
  }, [selectedDate, selectedRoute]);

  // ===== Delta polling (3 giây) - chỉ fetch update/insert mới, merge vào state =====
  // Mục đích: realtime ~3s cho booking mới + driver/vehicle change từ tab/máy khác
  const lastSyncRef = useRef(new Date().toISOString());
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;
  const selectedRouteForDeltaRef = useRef(selectedRoute);
  selectedRouteForDeltaRef.current = selectedRoute;
  const timeSlotsRef = useRef([]);
  useEffect(() => { timeSlotsRef.current = timeSlots; }, [timeSlots]);
  // Dedupe toast: cùng slotId không show toast 2 lần trong 8 giây (tránh trùng giữa BroadcastChannel + delta)
  const recentSlotToastsRef = useRef(new Map());

  useEffect(() => {
    let cancelled = false;
    const deltaSync = async () => {
      try {
        const since = lastSyncRef.current;
        const date = selectedDateRef.current;
        const route = selectedRouteForDeltaRef.current;
        if (!date || !route) return;

        const qs = new URLSearchParams({ since, date, route }).toString();
        const [bRes, tRes] = await Promise.all([
          fetch(`https://vocucphuongmanage.vercel.app/api/tong-hop/bookings?${qs}`),
          fetch(`https://vocucphuongmanage.vercel.app/api/tong-hop/timeslots?${qs}`),
        ]);
        if (cancelled) return;

        if (bRes.ok) {
          const data = await bRes.json();
          const delta = data.bookings || [];
          if (data.serverTime) lastSyncRef.current = data.serverTime;
          if (delta.length > 0) {
            setBookings(prev => {
              const map = new Map(prev.map(b => [b.id, b]));
              for (const b of delta) map.set(b.id, b);
              return Array.from(map.values());
            });
          }
        }

        if (tRes.ok) {
          const data = await tRes.json();
          const delta = data.timeSlots || [];
          if (delta.length > 0) {
            // So sánh prev/new để toast khi driver/code (biển số) thay đổi từ tab/máy khác
            const prevMap = new Map(timeSlotsRef.current.map(s => [s.id, s]));
            const now = Date.now();
            for (const s of delta) {
              const old = prevMap.get(s.id);
              if (!old) continue;
              const drvNew = (s.driver || '').trim();
              const drvOld = (old.driver || '').trim();
              const codeNew = (s.code || '').trim();
              const codeOld = (old.code || '').trim();
              const parts = [];
              if (drvNew !== drvOld) parts.push(`tài xế: ${drvNew || '(trống)'}`);
              if (codeNew !== codeOld) parts.push(`biển số: ${codeNew || '(trống)'}`);
              if (parts.length === 0) continue;
              const last = recentSlotToastsRef.current.get(s.id) || 0;
              if (now - last < 8000) continue; // dedupe với BroadcastChannel
              recentSlotToastsRef.current.set(s.id, now);
              showToast(`Khung ${s.time} ${s.route} — ${parts.join(', ')}`, 'info');
            }

            setTimeSlots(prev => {
              const map = new Map(prev.map(s => [s.id, s]));
              for (const s of delta) map.set(s.id, s);
              return sortTimeSlots(Array.from(map.values()));
            });
            // Cập nhật selectedTrip nếu đang chọn slot vừa thay đổi (driver/vehicle)
            setSelectedTrip(prevTrip => {
              if (!prevTrip) return prevTrip;
              const updated = delta.find(s => s.id === prevTrip.id);
              return updated || prevTrip;
            });
          }
        }
      } catch (e) {
        // Silent: lỗi mạng tạm thời — sẽ thử lại sau 3s
      }
    };

    // Visibility-aware polling: 2s khi active, pause khi tab ẩn, fetch ngay khi visible
    let intervalId = null;
    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(deltaSync, 2000);
    };
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        deltaSync(); // catch-up ngay
        startPolling();
      }
    };

    if (typeof document !== 'undefined' && !document.hidden) {
      startPolling();
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Cross-tab broadcast (cùng route → đồng bộ thông báo + refresh) =====
  const channelRef = useRef(null);
  const tabIdRef = useRef(Math.random().toString(36).slice(2));
  const selectedRouteRef = useRef(selectedRoute);
  useEffect(() => { selectedRouteRef.current = selectedRoute; }, [selectedRoute]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('vcp-route-sync');
    channelRef.current = ch;
    ch.onmessage = (ev) => {
      const msg = ev.data || {};
      if (!msg || msg.from === tabIdRef.current) return;
      if (msg.route && msg.route !== selectedRouteRef.current) return;
      if (msg.message) showToast(msg.message, msg.type || 'success');
      refreshData();
    };
    return () => ch.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const broadcastChange = useCallback((route, message, type = 'success') => {
    if (!channelRef.current) return;
    try {
      channelRef.current.postMessage({ from: tabIdRef.current, route, message, type, ts: Date.now() });
    } catch (e) {
      console.warn('broadcastChange failed:', e);
    }
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

    // Refresh mỗi 15 giây — pause khi tab ẩn để tiết kiệm
    let intervalId = null;
    const start = () => { if (!intervalId) intervalId = setInterval(refreshSeatLocks, 15000); };
    const stop = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };
    const onVis = () => { if (document.hidden) stop(); else { refreshSeatLocks(); start(); } };
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVis);

    return () => { stop(); document.removeEventListener('visibilitychange', onVis); };
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

  // Tạo timeslots cho ngày + tuyến (gọi server, server tự tạo và trả về)
  const createTimeSlotsForDate = async (date, route) => {
    try {
      console.log(`🔄 Đang tạo timeslots cho ngày ${date}, tuyến ${route}...`);

      const params = new URLSearchParams({ date, route });
      const res = await fetch(`https://vocucphuongmanage.vercel.app/api/tong-hop/timeslots?${params}`);
      if (!res.ok) throw new Error('Lỗi tạo timeslots');
      const routeSlots = await res.json();

      // Thay thế timeslots cho date+route này
      setTimeSlots(prev => {
        const otherSlots = prev.filter(s => !(s.date === date && s.route === route));
        return sortTimeSlots([...otherSlots, ...routeSlots]);
      });

      console.log(`✅ Đã load ${routeSlots.length} timeslots cho ngày ${date}, tuyến ${route}`);
      return routeSlots;
    } catch (error) {
      console.error('❌ Lỗi tạo timeslots:', error);
      throw error;
    }
  };

  // Khi chuyển ngày hoặc tuyến → LUÔN fetch timeslots từ server (server tự tạo nếu chưa có)
  useEffect(() => {
    const handleDateOrRouteChange = async () => {
      if (!selectedRoute || loading) return;

      console.log(`🔄 Đang chuyển sang ngày ${selectedDate}, tuyến ${selectedRoute}...`);

      // Reset các state liên quan
      setSelectedSeatNumber(null);
      setShowPassengerForm(false);
      setIsSlotSelected(false);
      setSelectedTrip(null);

      try {
        const params = new URLSearchParams({ date: selectedDate, route: selectedRoute });
        const res = await fetch(`https://vocucphuongmanage.vercel.app/api/tong-hop/timeslots?${params}`);
        if (!res.ok) throw new Error('Lỗi fetch timeslots');
        const routeSlots = await res.json();

        // Thay thế timeslots cho date+route này, giữ nguyên các date/route khác
        setTimeSlots(prev => {
          const otherSlots = prev.filter(s => !(s.date === selectedDate && s.route === selectedRoute));
          return sortTimeSlots([...otherSlots, ...routeSlots]);
        });

        if (routeSlots.length > 0) {
          const sorted = sortTimeSlots(routeSlots);
          setSelectedTrip(sorted[0]);
          setIsSlotSelected(true);
          console.log(`✅ Loaded ${routeSlots.length} timeslots cho ${selectedDate} - ${selectedRoute}`);
        }
      } catch (error) {
        console.error('❌ Lỗi load timeslots:', error);
      }
    };

    handleDateOrRouteChange();
  }, [selectedDate, selectedRoute, loading]);

  // Thêm booking mới
  const addBooking = async (bookingData) => {
    try {
      const newBookingData = {
        ...bookingData,
        timeSlotId: selectedTrip.id,
        timeSlot: selectedTrip.time,
        date: selectedTrip.date,
        route: selectedTrip.route,  // Thêm tuyến đường
        createdBy: currentUserName, // người bán — hiện "G: ..." trên thẻ ghế
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
      const prev = timeSlots.find(s => s.id === slotId);
      const updatedSlot = await timeSlotAPI.patch(slotId, updatedData);
      const updated = timeSlots.map(slot =>
        slot.id === slotId ? updatedSlot : slot
      );
      setTimeSlots(sortTimeSlots(updated));

      // Cập nhật selectedTrip nếu đang chọn slot này
      if (selectedTrip && selectedTrip.id === slotId) {
        setSelectedTrip(updatedSlot);
      }

      // Broadcast tới tab cùng máy (instant) — tab cross-machine sẽ nhận qua delta polling
      try {
        const drvNew = (updatedSlot.driver || '').trim();
        const drvOld = ((prev && prev.driver) || '').trim();
        const codeNew = (updatedSlot.code || '').trim();
        const codeOld = ((prev && prev.code) || '').trim();
        const parts = [];
        if (drvNew !== drvOld) parts.push(`tài xế: ${drvNew || '(trống)'}`);
        if (codeNew !== codeOld) parts.push(`biển số: ${codeNew || '(trống)'}`);
        if (parts.length > 0) {
          const msg = `Khung ${updatedSlot.time} ${updatedSlot.route} — ${parts.join(', ')}`;
          if (channelRef.current) {
            channelRef.current.postMessage({
              from: tabIdRef.current,
              route: updatedSlot.route,
              message: msg,
              type: 'info',
              slotId: updatedSlot.id,
              ts: Date.now(),
            });
          }
        }
      } catch (e) { /* ignore broadcast failure */ }

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
    setSelectedRoute: setSelectedRouteAndSave,
    refreshData,
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
    // Global toast
    globalToast,
    setGlobalToast,
    showToast,
    // Cross-tab sync
    broadcastChange,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
