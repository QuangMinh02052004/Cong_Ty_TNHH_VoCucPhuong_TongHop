import React, { createContext, useContext, useState } from 'react';

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
  const [bookings, setBookings] = useState([
    {
      id: 1,
      phone: '0376670275',
      name: '51. Nhà thọ Tân Bắc',
      gender: 'male',
      nationality: 'Việt Nam',
      pickupMethod: 'Dọc đường',
      pickupAddress: 'Trạm Long Khánh',
      dropoffMethod: 'Tại bến',
      note: 'giao loan 1 thùng bông',
      seatNumber: 1,
      amount: 100000,
      paid: 0,
      timeSlot: '05:30',
      date: '26-11-2025',
    },
    {
      id: 2,
      phone: '0989347425',
      name: '22. Ngã 4 Bình Thái',
      gender: 'female',
      nationality: 'Việt Nam',
      pickupMethod: 'Dọc đường',
      pickupAddress: 'Trạm Long Khánh',
      dropoffMethod: 'Tại bến',
      note: '1 ghế',
      seatNumber: 2,
      amount: 100000,
      paid: 0,
      timeSlot: '05:30',
      date: '26-11-2025',
    },
  ]);

  // State cho chuyến xe đang chọn
  const [selectedTrip, setSelectedTrip] = useState({
    time: '05:30',
    date: '28/26',
    type: 'Xe 28G',
    code: '60BO5307',
    status: 'booked'
  });

  // State để theo dõi xem đã chọn khung giờ chưa
  const [isSlotSelected, setIsSlotSelected] = useState(false);

  // State để theo dõi việc hiển thị form hành khách
  const [showPassengerForm, setShowPassengerForm] = useState(false);

  // State cho các khung giờ
  const [timeSlots, setTimeSlots] = useState([
    { time: '05:30', date: '28/26', type: 'Xe 28G', code: '60BO5307', driver: 'TX Thanh Bắc', phone: '0918026316' },
    { time: '06:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '06:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '07:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '07:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '08:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '08:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '09:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '09:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '10:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '10:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '11:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '11:30', date: '28/27', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '12:00', date: '28/27', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '12:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '13:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '13:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '14:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '14:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '15:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '15:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '16:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '16:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '17:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '17:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '18:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '18:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '19:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '19:30', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
    { time: '20:00', date: '28/28', type: 'Xe 28G', code: '', driver: '', phone: '' },
  ]);

  // Thêm booking mới
  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: Date.now(),
      timeSlot: selectedTrip.time,
      date: selectedTrip.date,
    };
    setBookings([...bookings, newBooking]);
    return newBooking;
  };

  // Cập nhật booking
  const updateBooking = (id, updatedData) => {
    setBookings(bookings.map(booking =>
      booking.id === id ? { ...booking, ...updatedData } : booking
    ));
  };

  // Xóa booking
  const deleteBooking = (id) => {
    setBookings(bookings.filter(booking => booking.id !== id));
  };

  // Lấy bookings theo timeSlot
  const getBookingsByTimeSlot = (timeSlot) => {
    return bookings.filter(booking => booking.timeSlot === timeSlot);
  };

  // Cập nhật thông tin khung giờ (biển số xe, tài xế, v.v.)
  const updateTimeSlot = (time, updatedData) => {
    setTimeSlots(timeSlots.map(slot =>
      slot.time === time ? { ...slot, ...updatedData } : slot
    ));
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
    updateTimeSlot,
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
