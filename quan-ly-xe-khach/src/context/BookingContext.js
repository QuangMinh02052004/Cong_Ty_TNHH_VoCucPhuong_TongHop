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

export const BookingProvider = ({ children }) => {
  // State cho danh sách đặt vé
  const [bookings, setBookings] = useState([]);

  // State cho chuyến xe đang chọn
  const [selectedTrip, setSelectedTrip] = useState(null);

  // State để theo dõi xem đã chọn khung giờ chưa
  const [isSlotSelected, setIsSlotSelected] = useState(false);

  // State để theo dõi việc hiển thị form hành khách
  const [showPassengerForm, setShowPassengerForm] = useState(false);

  // State cho các khung giờ
  const [timeSlots, setTimeSlots] = useState([]);

  // State cho danh sách tài xế và xe
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // State loading
  const [loading, setLoading] = useState(true);

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

        // Chọn khung giờ đầu tiên nếu có
        if (slotsData.length > 0 && !selectedTrip) {
          setSelectedTrip(slotsData[0]);
          setIsSlotSelected(true);
        }

        console.log('✅ Đã load dữ liệu từ database:', {
          timeSlots: slotsData.length,
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

  // Thêm booking mới
  const addBooking = async (bookingData) => {
    try {
      const newBookingData = {
        ...bookingData,
        timeSlotId: selectedTrip.id,
        timeSlot: selectedTrip.time,
        date: selectedTrip.date,
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
        date: newSlot.date || '28/28',
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
    bookings,
    selectedTrip,
    setSelectedTrip,
    isSlotSelected,
    setIsSlotSelected,
    showPassengerForm,
    setShowPassengerForm,
    timeSlots,
    drivers,
    vehicles,
    loading,
    updateTimeSlot,
    addNewTimeSlot,
    changeTimeSlotTime,
    deleteTimeSlot,
    addBooking,
    updateBooking,
    deleteBooking,
    getBookingsByTimeSlot,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
