import { createContext, useContext, useState, useEffect } from 'react';
import { timeSlotAPI, bookingAPI, driverAPI, vehicleAPI } from '../services/api';

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
  // State cho ngày đang chọn (mặc định là hôm nay)
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  // State cho tuyến đường đang chọn (mặc định là Sài Gòn - Long Khánh)
  const [selectedRoute, setSelectedRoute] = useState('Sài Gòn- Long Khánh');

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

  // State cho các khung giờ
  const [timeSlots, setTimeSlots] = useState([]);

  // State cho danh sách tài xế và xe
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // State loading
  const [loading, setLoading] = useState(true);

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

  // Tạo timeslots cho ngày mới và tuyến mới (template khác nhau cho từng tuyến)
  const createTimeSlotsForDate = async (date, route) => {
    try {
      console.log(`🔄 Đang tạo timeslots cho ngày ${date}, tuyến ${route}...`);

      // Template khung giờ khác nhau cho từng tuyến
      let timeTemplate;

      if (route === 'Long Khánh - Sài Gòn') {
        // Tuyến Long Khánh - Sài Gòn: 03:30 - 18:00 (30 khung giờ)
        timeTemplate = [
          '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00',
          '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
          '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
        ];
        console.log(`📋 Sử dụng template Long Khánh - Sài Gòn (03:30 - 18:00)`);
      } else {
        // Tuyến Sài Gòn- Long Khánh: 05:30 - 20:00 (30 khung giờ)
        timeTemplate = [
          '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00',
          '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
          '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
        ];
        console.log(`📋 Sử dụng template Sài Gòn- Long Khánh (05:30 - 20:00)`);
      }

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

      const updated = [...timeSlots, ...newSlots];
      setTimeSlots(sortTimeSlots(updated));
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
          // Đã có timeslots, chọn khung giờ đầu tiên
          setSelectedTrip(slotsForDateAndRoute[0]);
          setIsSlotSelected(true);
          console.log(`✅ Đã chuyển sang ngày ${selectedDate}, tuyến ${selectedRoute}, có ${slotsForDateAndRoute.length} timeslots`);
        } else {
          // Chưa có timeslots, tạo mới
          console.log(`⚠️ Ngày ${selectedDate}, tuyến ${selectedRoute} chưa có timeslots, đang tạo...`);
          await createTimeSlotsForDate(selectedDate, selectedRoute);
        }
      }
    };

    handleDateOrRouteChange();
  }, [selectedDate, selectedRoute, loading]); // ✅ Theo dõi cả ngày và tuyến

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
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
