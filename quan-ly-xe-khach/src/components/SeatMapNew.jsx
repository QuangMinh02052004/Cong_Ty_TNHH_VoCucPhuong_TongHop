import React, { useState, useEffect, useRef } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { activityLogAPI } from '../services/api';
import PrintBookingList from './PrintBookingList';
import ConfirmModal from './ConfirmModal';
import { findStationWithNumber } from '../data/stations';

// Call status options với màu sắc - khớp mẫu gốc
const CALL_STATUS_OPTIONS = [
  { value: 'Chưa gọi',                  bg: '#ffffff', text: '#4b5563', border: '#d1d5db' },
  { value: 'Phòng vé đã gọi',           bg: '#3b5bdb', text: '#ffffff', border: '#3b5bdb' },
  { value: 'Phòng vé gọi không nghe',   bg: '#e03131', text: '#ffffff', border: '#e03131' },
  { value: 'Tài xế đã gọi',             bg: '#2f9e44', text: '#ffffff', border: '#2f9e44' },
  { value: 'Tài xế gọi không nghe',     bg: '#f03e3e', text: '#ffffff', border: '#f03e3e' },
  { value: 'Số điện thoại không đúng',   bg: '#f59f00', text: '#ffffff', border: '#f59f00' },
  { value: 'Đã gọi cho tài xế',         bg: '#7048e8', text: '#ffffff', border: '#7048e8' },
  { value: 'Thuê bao không gọi được',    bg: '#e64980', text: '#ffffff', border: '#e64980' },
  { value: 'Tài xế báo hủy',            bg: '#495057', text: '#ffffff', border: '#495057' },
  { value: 'Đã nhận tin',                bg: '#e03131', text: '#ffffff', border: '#e03131' },
  { value: 'Đã nhận tin trung chuyển',   bg: '#e8590c', text: '#ffffff', border: '#e8590c' },
  { value: 'Sai địa chỉ đón',           bg: '#d6336c', text: '#ffffff', border: '#d6336c' },
  { value: 'Chuyển chuyến khác',         bg: '#1098ad', text: '#ffffff', border: '#1098ad' },
];

const getCallStatusObj = (status) => {
  return CALL_STATUS_OPTIONS.find(o => o.value === status) || CALL_STATUS_OPTIONS[0];
};

const SeatMapNew = () => {
  const {
    currentDayBookings,
    deleteBooking,
    updateBooking,
    selectedTrip,
    setShowPassengerForm,
    showPassengerForm,
    setSelectedSeatNumber,
    selectedRoute,
    selectedDate,
    setEditingBooking,
    transferQueue,
    setTransferQueue,
    // Seat lock functions
    lockSeat,
    releaseSeat,
    isSeatLocked,
    isSeatLockedByMe,
    getSeatLockInfo,
    currentUserName
  } = useBooking();
  const [activeTab, setActiveTab] = useState('seatMap');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [sortedBookings, setSortedBookings] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [toast, setToast] = useState(null); // { message, type: 'success'|'error' }
  const [isTransferring, setIsTransferring] = useState(false); // Khóa chống nhấn nhiều lần
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null, cancelText: 'Hủy', confirmText: 'Đồng ý', danger: false });
  const [openCallStatusId, setOpenCallStatusId] = useState(null); // ID booking đang mở dropdown call status
  const [activityLogs, setActivityLogs] = useState([]);
  const callStatusRef = useRef(null);
  const { user } = useAuth();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Ghi log hoạt động (fire-and-forget)
  const logActivity = (action, description, bookingId, seatNumber) => {
    const logData = {
      action,
      description,
      bookingId,
      seatNumber,
      userName: user?.fullName || user?.username || 'Unknown',
      date: selectedDate,
      route: selectedRoute,
      timeSlot: selectedTrip?.time || null,
    };
    activityLogAPI.log(logData);
    // Thêm vào local state ngay lập tức
    setActivityLogs(prev => [{ ...logData, createdAt: new Date().toISOString(), id: Date.now() }, ...prev].slice(0, 50));
  };

  // Load activity log khi đổi ngày/route
  useEffect(() => {
    if (!selectedDate || !selectedRoute) return;
    activityLogAPI.getByDateRoute(selectedDate, selectedRoute, 50)
      .then(logs => setActivityLogs(logs))
      .catch(() => {});
  }, [selectedDate, selectedRoute]);

  // Close call status dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (callStatusRef.current && !callStatusRef.current.contains(e.target)) {
        setOpenCallStatusId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cập nhật call status
  const handleCallStatusChange = async (booking, newStatus) => {
    try {
      await updateBooking(booking.id, { callStatus: newStatus });
      logActivity('call_status', `Ghế ${booking.seatNumber} - ${booking.name}: đổi trạng thái gọi → "${newStatus}"`, booking.id, booking.seatNumber);
      setOpenCallStatusId(null);
    } catch (error) {
      showToast('Lỗi cập nhật trạng thái: ' + error.message, 'error');
    }
  };

  // Lọc bookings theo chuyến đang chọn (đã được lọc theo ngày từ context)
  // ✅ Fix: Match bằng cả timeSlotId VÀ timeSlot để đảm bảo không miss booking
  const currentBookings = selectedTrip
    ? currentDayBookings.filter(booking => {
        // Match bằng timeSlotId (chính xác nhất)
        if (booking.timeSlotId === selectedTrip.id) return true;
        // Fallback: match bằng timeSlot string
        if (booking.timeSlot === selectedTrip.time) return true;
        return false;
      })
    : [];

  // Debug log để kiểm tra matching
  if (selectedTrip && currentDayBookings.length > 0) {
    console.log(`[SeatMap] Trip: ${selectedTrip.time} (ID: ${selectedTrip.id}), Matched: ${currentBookings.length}/${currentDayBookings.length}`);
  }

  // Đồng bộ danh sách với currentBookings (giữ nguyên thứ tự đã sắp)
  useEffect(() => {
    const currentIds = currentBookings.map(b => b.id);
    const sortedIds = sortedBookings.map(b => b.id);

    // Kiểm tra xem có booking mới hoặc bị xóa không
    const hasNewBookings = currentIds.some(id => !sortedIds.includes(id));
    const hasDeletedBookings = sortedIds.some(id => !currentIds.includes(id));

    if (hasNewBookings || hasDeletedBookings) {
      // Giữ lại các booking cũ (theo thứ tự hiện tại)
      const keptBookings = sortedBookings.filter(b => currentIds.includes(b.id));
      // Tìm các booking mới
      const newBookings = currentBookings.filter(b => !sortedIds.includes(b.id));
      // Thêm booking mới vào cuối
      setSortedBookings([...keptBookings, ...newBookings]);
    }
  }, [currentBookings.length]); // Chỉ trigger khi length thay đổi

  // Xử lý kéo thả
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newList = [...sortedBookings];
      const draggedItem = newList[draggedIndex];
      newList.splice(draggedIndex, 1);
      newList.splice(dropIndex, 0, draggedItem);
      setSortedBookings(newList);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Hàm sắp xếp theo địa chỉ trả (dropoff)
  const handleSortByAddress = () => {
    const sorted = [...sortedBookings].sort((a, b) => {
      const addressA = a.dropoffAddress || a.dropoffMethod || '';
      const addressB = b.dropoffAddress || b.dropoffMethod || '';
      return addressA.localeCompare(addressB, 'vi');
    });
    setSortedBookings(sorted);
  };

  // Lấy địa chỉ giao (ưu tiên dropoffAddress, nếu không có thì dùng dropoffMethod)
  const getDeliveryAddress = (booking) => {
    // Nếu có dropoffAddress, tìm và thêm STT
    if (booking.dropoffAddress && booking.dropoffAddress.trim()) {
      const withNumber = findStationWithNumber(booking.dropoffAddress);
      return withNumber || booking.dropoffAddress;
    }
    // Nếu không có địa chỉ cụ thể, hiển thị phương thức
    return booking.dropoffMethod || 'Tại bến';
  };

  const isTransferMode = transferQueue.length > 0;
  // Booking đang chờ chuyển tiếp theo (đầu hàng đợi)
  const currentTransfer = isTransferMode ? transferQueue[0] : null;

  // Toggle chọn/bỏ chọn booking vào hàng đợi chuyển
  const toggleTransferSelect = (booking) => {
    if (isTransferring) return;
    const exists = transferQueue.find(b => b.id === booking.id);
    if (exists) {
      setTransferQueue(transferQueue.filter(b => b.id !== booking.id));
    } else {
      setTransferQueue([...transferQueue, booking]);
    }
  };

  // Chuyển booking đầu hàng đợi vào ghế đích
  const handleTransferToSeat = async (targetSeatNum) => {
    if (!currentTransfer || !selectedTrip || isTransferring) return;

    // Không cho chuyển vào chính ghế mình
    if (targetSeatNum === currentTransfer.seatNumber &&
        selectedTrip.id === currentTransfer.timeSlotId) {
      return;
    }

    // Không cho chuyển vào ghế đang trong hàng đợi
    const isInQueue = transferQueue.find(b => b.seatNumber === targetSeatNum && b.timeSlotId === selectedTrip.id);
    if (isInQueue) {
      showToast(`Ghế ${targetSeatNum} đang trong hàng đợi chuyển!`, 'error');
      return;
    }

    setIsTransferring(true);
    const existingBooking = currentBookings.find(b => b.seatNumber === targetSeatNum);

    try {
      if (existingBooking) {
        // HOÁN ĐỔI
        const srcSeat = currentTransfer.seatNumber;
        await updateBooking(existingBooking.id, { seatNumber: 0 });
        await updateBooking(currentTransfer.id, {
          timeSlotId: selectedTrip.id,
          timeSlot: selectedTrip.time,
          date: selectedTrip.date,
          route: selectedTrip.route,
          seatNumber: targetSeatNum
        });
        await updateBooking(existingBooking.id, { seatNumber: srcSeat });
        showToast(`Hoán đổi: ${currentTransfer.name} ↔ ${existingBooking.name}`);
        logActivity('swap', `Hoán đổi ghế: ${currentTransfer.name} Ghế ${currentTransfer.seatNumber} ↔ ${existingBooking.name} Ghế ${targetSeatNum} | Chuyến ${selectedTrip?.time || ''} | Tuyến ${selectedRoute} | ${selectedDate}`, currentTransfer.id, targetSeatNum);
      } else {
        await updateBooking(currentTransfer.id, {
          timeSlotId: selectedTrip.id,
          timeSlot: selectedTrip.time,
          date: selectedTrip.date,
          route: selectedTrip.route,
          seatNumber: targetSeatNum
        });
        showToast(`Chuyển "${currentTransfer.name}" → Ghế ${targetSeatNum}`);
        const fromRoute = currentTransfer.route || selectedRoute;
        const toRoute = selectedTrip?.route || selectedRoute;
        const crossRoute = fromRoute !== toRoute ? ` | ${fromRoute} → ${toRoute}` : ` | Tuyến ${toRoute}`;
        logActivity('transfer', `Chuyển ${currentTransfer.name}: Ghế ${currentTransfer.seatNumber} (${currentTransfer.timeSlot || '?'}) → Ghế ${targetSeatNum} (${selectedTrip?.time || '?'})${crossRoute} | ${currentTransfer.date || selectedDate} → ${selectedTrip?.date || selectedDate}`, currentTransfer.id, targetSeatNum);
      }
      // Xóa booking đã chuyển xong khỏi hàng đợi
      setTransferQueue(prev => prev.slice(1));
    } catch (error) {
      showToast('Lỗi chuyển: ' + error.message, 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleEdit = (booking) => {
    // Set booking cần edit vào context TRƯỚC khi hiện form
    setEditingBooking(booking);
    // Hiện form hành khách
    setShowPassengerForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const booking = currentBookings.find(b => b.id === id);
    setModal({
      isOpen: true,
      title: 'Xóa hành khách',
      message: 'Bạn có chắc muốn xóa hành khách này?',
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      danger: true,
      onConfirm: () => {
        deleteBooking(id);
        if (booking) logActivity('delete', `Hủy vé: ${booking.name} - Ghế ${booking.seatNumber} - SĐT ${booking.phone} - Chuyến ${booking.timeSlot || selectedTrip?.time || ''}`, id, booking.seatNumber);
        setModal(m => ({ ...m, isOpen: false }));
      }
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 p-2">
          <button
            onClick={() => setActiveTab('seatMap')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'seatMap'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sơ đồ ghế
          </button>
          <button
            onClick={() => setActiveTab('ticketList')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'ticketList'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Danh sách vé ({currentBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'transfer'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Phân tài trung chuyển khách
          </button>
          <button
            onClick={() => setActiveTab('cargo')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'cargo'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hàng trên xe
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'seatMap' && (
          <div>
            {/* Seat Numbers - 28 ghế từ 1-28 */}
            <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-200 pb-3">
              {Array.from({ length: 28 }, (_, i) => i + 1).map(num => {
                const booking = currentBookings.find(b => b.seatNumber === num);
                const isBooked = !!booking;
                const isLocked = selectedTrip && isSeatLocked(selectedTrip.id, num);
                const isLockedByMe = selectedTrip && isSeatLockedByMe(selectedTrip.id, num);
                const lockInfo = selectedTrip && getSeatLockInfo(selectedTrip.id, num);

                // Xác định màu và trạng thái của ghế
                let buttonClass = 'bg-white border-gray-300 hover:border-sky-400 cursor-pointer';
                let title = `Ghế ${num} - Trống`;

                if (isBooked) {
                  buttonClass = 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 cursor-pointer';
                  title = `Ghế ${num} - ${booking.name}`;
                } else if (isLocked) {
                  buttonClass = 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed';
                  title = `Ghế ${num} - Đã bị khóa bởi ${lockInfo?.lockedBy}`;
                } else if (isLockedByMe) {
                  buttonClass = 'bg-sky-400 text-white border-sky-500 hover:bg-sky-500 cursor-pointer';
                  title = `Ghế ${num} - Bạn đang chọn ghế này`;
                } else if (isTransferMode) {
                  // Kiểm tra ghế này có trong hàng đợi chuyển không
                  const inQueue = transferQueue.find(b => b.seatNumber === num && b.timeSlotId === selectedTrip?.id);
                  if (inQueue) {
                    buttonClass = 'bg-amber-400 text-white border-amber-500 cursor-pointer';
                    title = `Ghế ${num} - Đang trong hàng đợi chuyển (nhấn để bỏ)`;
                  } else {
                    buttonClass = 'bg-indigo-100 text-indigo-600 border-indigo-400 border-dashed hover:bg-indigo-300 cursor-pointer';
                    title = `Ghế ${num} - Nhấn để chuyển đến đây`;
                  }
                }

                return (
                  <button
                    key={num}
                    onClick={() => {
                      if (isBooked && isTransferMode) {
                        // Trong transfer mode: click ghế có khách → toggle chọn hoặc hoán đổi
                        const inQueue = transferQueue.find(b => b.id === booking.id);
                        if (inQueue) {
                          // Đã trong queue → bỏ chọn
                          setTransferQueue(transferQueue.filter(b => b.id !== booking.id));
                        } else {
                          // Chưa trong queue → chuyển/hoán đổi vào ghế này
                          handleTransferToSeat(num);
                        }
                      } else if (isBooked) {
                        handleEdit(booking);
                      } else if (isTransferMode && !isLocked) {
                        handleTransferToSeat(num);
                      } else if (!isLocked) {
                        // Ghế trống hoặc do mình khóa - có thể click
                      }
                    }}
                    disabled={isLocked}
                    title={title}
                    className={`w-10 h-10 border-2 rounded-lg text-sm font-semibold transition ${buttonClass}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Chú thích màu ghế */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                <span className="text-gray-600">Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-500 border-2 border-emerald-600 rounded"></div>
                <span className="text-gray-600">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded relative">
                  <svg className="w-3 h-3 text-red-500 absolute -top-1 -right-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-600">Đang bị khóa (người khác)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-400 border-2 border-sky-500 rounded"></div>
                <span className="text-gray-600">Bạn đang chọn</span>
              </div>
            </div>

            {/* Transfer mode banner */}
            {isTransferMode && (
              <div className={`mb-4 p-3 border-2 rounded-lg ${
                isTransferring ? 'bg-yellow-100 border-yellow-400' : 'bg-indigo-100 border-indigo-400'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isTransferring ? (
                      <svg className="w-5 h-5 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    )}
                    <span className={`font-bold ${isTransferring ? 'text-yellow-800' : 'text-indigo-800'}`}>
                      {isTransferring
                        ? 'Đang xử lý...'
                        : `Đang chuyển: ${currentTransfer.name} (Ghế ${currentTransfer.seatNumber})`
                      }
                    </span>
                    {!isTransferring && (
                      <span className="text-sm text-indigo-600">
                        — Còn {transferQueue.length} trong hàng đợi
                      </span>
                    )}
                  </div>
                  {!isTransferring && (
                    <button
                      onClick={() => setTransferQueue([])}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition font-semibold"
                    >
                      Hủy tất cả
                    </button>
                  )}
                </div>
                {/* Danh sách hàng đợi */}
                {transferQueue.length > 1 && !isTransferring && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {transferQueue.map((b, i) => (
                      <span key={b.id} className={`text-xs px-2 py-1 rounded-full ${
                        i === 0 ? 'bg-indigo-600 text-white' : 'bg-indigo-200 text-indigo-700'
                      }`}>
                        {i === 0 ? '→ ' : ''}{b.name} (Ghế {b.seatNumber})
                        {i > 0 && (
                          <button
                            onClick={() => setTransferQueue(transferQueue.filter(q => q.id !== b.id))}
                            className="ml-1 hover:text-red-600"
                          >×</button>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Passenger Cards - Hiển thị 28 ô ghế - Tự động tăng cột khi form ẩn */}
            <div className={`grid grid-cols-1 gap-3 ${
              showPassengerForm
                ? 'lg:grid-cols-2 xl:grid-cols-3'
                : 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            }`}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((seatNum) => {
                const passenger = currentBookings.find(b => b.seatNumber === seatNum);
                const hasPassenger = !!passenger;
                const isLocked = selectedTrip && isSeatLocked(selectedTrip.id, seatNum);
                const isLockedByMe = selectedTrip && isSeatLockedByMe(selectedTrip.id, seatNum);
                const lockInfo = selectedTrip && getSeatLockInfo(selectedTrip.id, seatNum);

                // Xử lý click vào ghế trống
                const handleSeatClick = async () => {
                  if (!selectedTrip) {
                    setModal({ isOpen: true, title: 'Chưa chọn khung giờ', message: 'Vui lòng chọn khung giờ trước khi đặt ghế!\n\nNếu chưa có khung giờ, hãy bấm nút "+" bên danh sách khung giờ để tạo mới.', type: 'info', confirmText: 'Đã hiểu', cancelText: null, danger: false, onConfirm: () => setModal(m => ({ ...m, isOpen: false })) });
                    return;
                  }

                  // Nếu ghế đã bị người khác khóa, hiển thị thông báo
                  if (isLocked) {
                    setModal({ isOpen: true, title: 'Ghế đã bị khóa', message: `Ghế ${seatNum} đang được ${lockInfo?.lockedBy} điền thông tin.\nVui lòng chọn ghế khác hoặc đợi 10 phút.`, type: 'warning', confirmText: 'Đã hiểu', cancelText: null, danger: false, onConfirm: () => setModal(m => ({ ...m, isOpen: false })) });
                    return;
                  }

                  // Khóa ghế trước khi mở form
                  const result = await lockSeat(selectedTrip.id, seatNum);

                  if (result.success || isLockedByMe) {
                    setSelectedSeatNumber(seatNum);
                    setShowPassengerForm(true);
                  } else if (result.locked) {
                    setModal({ isOpen: true, title: 'Ghế đã bị khóa', message: result.message, type: 'warning', confirmText: 'Đã hiểu', cancelText: null, danger: false, onConfirm: () => setModal(m => ({ ...m, isOpen: false })) });
                  }
                };

                // Xác định style cho card — đọc trực tiếp từ DB (qua booking data)
                const isPrinted = hasPassenger && !!passenger.printed;
                let cardClass = 'border-gray-200 bg-gray-50';
                if (hasPassenger && isTransferMode) {
                  // Kiểm tra có trong hàng đợi không
                  const inQueue = transferQueue.find(b => b.id === passenger.id);
                  if (inQueue) {
                    cardClass = 'border-amber-400 bg-amber-50 ring-2 ring-amber-300';
                  } else {
                    cardClass = isPrinted ? 'border-gray-500 bg-gray-300' : 'border-sky-300 bg-sky-50';
                  }
                } else if (hasPassenger) {
                  cardClass = isPrinted ? 'border-gray-500 bg-gray-300' : 'border-sky-300 bg-sky-50';
                } else if (isLocked) {
                  cardClass = 'border-gray-400 bg-gray-200';
                } else if (isLockedByMe) {
                  cardClass = 'border-sky-400 bg-sky-100';
                } else if (isTransferMode) {
                  // Transfer mode: viền nét đứt, màu indigo
                  cardClass = 'border-indigo-300 bg-indigo-50 border-dashed';
                }

                return (
                  <div
                    key={seatNum}
                    className={`border-2 rounded-lg p-3 hover:shadow-lg transition ${cardClass}`}
                  >
                    {hasPassenger ? (
                      <>
                        {/* Clickable area - nhấn vào để sửa hoặc hoán đổi */}
                        {(() => {
                          const statusObj = getCallStatusObj(passenger.callStatus || 'Chưa gọi');
                          const isDefault = statusObj.value === 'Chưa gọi';
                          return (
                        <div
                          className="cursor-pointer hover:opacity-80 transition"
                          onClick={() => {
                            if (isTransferMode) {
                              const inQueue = transferQueue.find(b => b.id === passenger.id);
                              if (inQueue) {
                                setTransferQueue(transferQueue.filter(b => b.id !== passenger.id));
                              } else {
                                handleTransferToSeat(seatNum);
                              }
                            } else {
                              handleEdit(passenger);
                            }
                          }}
                        >
                          {/* Header: Ghế + SĐT trong khung màu */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-2xl font-bold text-sky-600">
                              {seatNum}
                            </div>
                            <div
                              className="px-2.5 py-1 rounded-md border-2 font-bold text-lg"
                              style={{
                                borderColor: isDefault ? '#0ea5e9' : statusObj.bg,
                                backgroundColor: isDefault ? '#0ea5e9' : statusObj.bg,
                                color: '#ffffff',
                              }}
                            >
                              {passenger.phone}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="space-y-1 mb-2">
                            <div className="font-semibold text-gray-800">{passenger.name}</div>
                            <div className="text-xs text-gray-500">Điểm trả</div>
                            <div className="text-sm text-emerald-700 font-semibold">
                              {getDeliveryAddress(passenger)}
                            </div>
                            {passenger.note && (
                              <div className="text-sm text-sky-700 font-semibold mt-1">
                                {passenger.note}
                              </div>
                            )}
                          </div>
                        </div>
                          );
                        })()}

                        {/* Call Status Dropdown */}
                        {(() => {
                          const statusObj = getCallStatusObj(passenger.callStatus || 'Chưa gọi');
                          const isDefault = statusObj.value === 'Chưa gọi';
                          return (
                        <div className="relative mb-2" ref={openCallStatusId === passenger.id ? callStatusRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenCallStatusId(openCallStatusId === passenger.id ? null : passenger.id);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-md text-sm font-semibold border-2 transition"
                            style={{
                              backgroundColor: isDefault ? '#ffffff' : statusObj.bg,
                              color: isDefault ? '#4b5563' : statusObj.text,
                              borderColor: isDefault ? '#d1d5db' : statusObj.bg,
                            }}
                          >
                            {statusObj.value} <span className="float-right">▾</span>
                          </button>
                          {openCallStatusId === passenger.id && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                              {CALL_STATUS_OPTIONS.map((opt) => (
                                <div
                                  key={opt.value}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCallStatusChange(passenger, opt.value);
                                  }}
                                  className="px-3 py-2 text-sm font-semibold cursor-pointer transition hover:opacity-80"
                                  style={{ backgroundColor: opt.bg, color: opt.text }}
                                >
                                  {opt.value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                          );
                        })()}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {(() => {
                            const inQueue = transferQueue.find(b => b.id === passenger.id);
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inQueue) {
                                    setTransferQueue(transferQueue.filter(b => b.id !== passenger.id));
                                  } else {
                                    toggleTransferSelect(passenger);
                                  }
                                }}
                                className={`py-1 px-2 rounded-lg text-sm transition flex items-center justify-center ${
                                  inQueue
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                                }`}
                                title={inQueue ? 'Bỏ khỏi hàng đợi' : 'Thêm vào hàng đợi chuyển'}
                              >
                                {inQueue ? '✓' : '⇄'}
                              </button>
                            );
                          })()}
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`tel:${passenger.phone}`); }}
                            className="flex-1 bg-sky-500 text-white py-1 px-2 rounded-lg text-sm hover:bg-sky-600 transition flex items-center justify-center"
                          >
                            Gọi
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(passenger.id); }}
                            className="bg-red-500 text-white py-1 px-2 rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </>
                    ) : isLocked ? (
                      // Ô ghế bị người khác khóa - hiển thị ổ khóa và nền xám
                      <div className="text-center py-6 cursor-not-allowed opacity-70">
                        <div className="relative">
                          <div className="text-4xl font-bold text-gray-400 mb-2">
                            Ghế {seatNum}
                          </div>
                          {/* Biểu tượng ổ khóa */}
                          <div className="absolute -top-1 -right-1">
                            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="text-sm text-red-600 font-semibold flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Đã bị khóa
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          bởi {lockInfo?.lockedBy}
                        </div>
                      </div>
                    ) : isLockedByMe ? (
                      // Ô ghế do mình khóa - click để hủy chọn
                      <div
                        className="text-center py-8 cursor-pointer hover:bg-red-50 transition rounded"
                        onClick={() => {
                          releaseSeat(selectedTrip.id, seatNum);
                          setShowPassengerForm(false);
                          setSelectedSeatNumber(null);
                        }}
                      >
                        <div className="text-4xl font-bold text-sky-500 mb-2">
                          Ghế {seatNum}
                        </div>
                        <div className="text-sm text-sky-600 font-semibold">
                          Bạn đang chọn
                        </div>
                        <div className="text-xs text-red-400 mt-2 font-semibold">Click để hủy chọn</div>
                      </div>
                    ) : isTransferMode ? (
                      // Ô ghế trống trong transfer mode - viền nét đứt, làm mờ
                      <div
                        className="text-center py-8 cursor-pointer hover:bg-indigo-100 hover:border-indigo-500 transition rounded opacity-60 hover:opacity-100"
                        onClick={() => handleTransferToSeat(seatNum)}
                      >
                        <div className="text-4xl font-bold text-indigo-300 mb-2">
                          Ghế {seatNum}
                        </div>
                        <div className="text-sm text-indigo-400">Trống</div>
                        <div className="text-xs text-indigo-500 mt-2 font-semibold">Nhấn để chuyển đến đây</div>
                      </div>
                    ) : (
                      // Ô ghế trống - Click để thêm hành khách
                      <div
                        className="text-center py-8 cursor-pointer hover:bg-gray-100 transition rounded"
                        onClick={handleSeatClick}
                      >
                        <div className="text-4xl font-bold text-gray-300 mb-2">
                          Ghế {seatNum}
                        </div>
                        <div className="text-sm text-gray-400">Trống</div>
                        <div className="text-xs text-sky-500 mt-2">Click để thêm</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ticketList' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-sky-800">Kéo thả để sắp xếp</p>
                  <p className="text-xs text-sky-700">Hoặc nhấn nút sắp xếp bên phải</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSortByAddress}
                  className="px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 font-semibold shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  Sắp xếp A-Z
                </button>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 font-semibold shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  In danh sách
                </button>
              </div>
            </div>

            {sortedBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">Chưa có vé nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedBookings.map((booking, index) => (
                  <div
                    key={booking.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center gap-3 p-4 bg-white border-2 rounded-lg cursor-move transition-all ${
                      draggedIndex === index
                        ? 'border-sky-400 bg-sky-50 shadow-lg'
                        : dragOverIndex === index
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-200 hover:border-sky-300 hover:shadow-md'
                    }`}
                  >
                    {/* Icon kéo */}
                    <div className="text-gray-400 hover:text-sky-500 cursor-grab active:cursor-grabbing flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                    </div>

                    {/* Thông tin booking */}
                    <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                      {/* STT */}
                      <div className="col-span-1">
                        <span className="font-bold text-lg text-sky-600">#{index + 1}</span>
                      </div>

                      {/* Tên + SĐT */}
                      <div className="col-span-2">
                        <div className="font-semibold text-gray-800">{booking.name}</div>
                        <div className="text-sm text-gray-600">{booking.phone}</div>
                      </div>

                      {/* TimeSlot + Date */}
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">Khung giờ</div>
                        <div className="font-semibold text-purple-600">
                          {booking.timeSlot || '-'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {booking.date || '-'}
                        </div>
                      </div>

                      {/* Điểm trả */}
                      <div className="col-span-4">
                        <div className="text-xs text-gray-500 mb-1">Điểm trả</div>
                        <div className="font-semibold text-emerald-700 truncate" title={getDeliveryAddress(booking)}>
                          {getDeliveryAddress(booking)}
                        </div>
                      </div>

                      {/* Ghi chú */}
                      <div className="col-span-2">
                        {booking.note && (
                          <div className="text-xs text-sky-600 truncate" title={booking.note}>
                            {booking.note}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex gap-1 justify-end">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                          title="Sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="text-center py-8 text-gray-500">
            Chức năng đang được phát triển...
          </div>
        )}

        {activeTab === 'cargo' && (
          <div className="text-center py-8 text-gray-500">
            Chức năng đang được phát triển...
          </div>
        )}
      </div>

      {/* Activity Log Panel */}
      <div className="mt-4 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Lịch sử thao tác
          </h3>
          <span className="text-xs text-gray-400">{activityLogs.length} bản ghi</span>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {activityLogs.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">Chưa có thao tác nào</div>
          ) : (
            activityLogs.map((log) => {
              const ACTION_META = {
                add:         { icon: '+', bg: 'bg-emerald-500', label: 'Thêm' },
                edit:        { icon: '✎', bg: 'bg-amber-500',   label: 'Sửa' },
                delete:      { icon: '✕', bg: 'bg-red-500',     label: 'Hủy' },
                transfer:    { icon: '→', bg: 'bg-indigo-500',  label: 'Chuyển' },
                swap:        { icon: '⇄', bg: 'bg-purple-500',  label: 'Hoán đổi' },
                call_status: { icon: '☎', bg: 'bg-sky-500',     label: 'Gọi điện' },
              };
              const meta = ACTION_META[log.action] || { icon: '•', bg: 'bg-gray-400', label: '' };
              const time = log.createdAt ? new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
              const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '';

              // Parse thông tin chuyển/hoán đổi để hiển thị ô ghế trực quan
              let seatVisual = null;
              if (log.action === 'transfer') {
                // "Chuyển Tên: Ghế X (HH:MM) → Ghế Y (HH:MM) | Tuyến ... | DD-MM-YYYY"
                const m = log.description.match(/Ghế (\d+) \(([^)]+)\) → Ghế (\d+) \(([^)]+)\)/);
                const routeM = log.description.match(/Tuyến ([^|]+)/);
                const dateM = log.description.match(/(\d{2}-\d{2}-\d{4}) → (\d{2}-\d{2}-\d{4})/);
                if (m) {
                  const [, fromSeat, fromTime, toSeat, toTime] = m;
                  const routeInfo = routeM ? routeM[1].trim() : (log.route || '');
                  const dateInfo = dateM ? `${dateM[1]} → ${dateM[2]}` : (log.date || '');
                  seatVisual = (
                    <div className="mt-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mb-1">
                        {routeInfo && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{routeInfo}</span>}
                        {dateInfo && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{dateInfo}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-lg bg-red-100 border-2 border-red-400 flex items-center justify-center font-bold text-red-700 text-sm">{fromSeat}</div>
                          <span className="text-[10px] text-gray-500 mt-0.5">{fromTime}</span>
                        </div>
                        <span className="text-indigo-500 font-bold text-lg">→</span>
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center font-bold text-emerald-700 text-sm">{toSeat}</div>
                          <span className="text-[10px] text-gray-500 mt-0.5">{toTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              } else if (log.action === 'swap') {
                // "Hoán đổi ghế: Tên1 Ghế X ↔ Tên2 Ghế Y | Chuyến HH:MM | Tuyến ..."
                const m = log.description.match(/(.+?) Ghế (\d+) ↔ (.+?) Ghế (\d+)/);
                const routeM = log.description.match(/Tuyến ([^|]+)/);
                const timeM = log.description.match(/Chuyến ([^|]+)/);
                if (m) {
                  const [, name1, seat1, name2, seat2] = m;
                  const routeInfo = routeM ? routeM[1].trim() : (log.route || '');
                  const timeInfo = timeM ? timeM[1].trim() : '';
                  seatVisual = (
                    <div className="mt-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mb-1">
                        {routeInfo && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{routeInfo}</span>}
                        {timeInfo && <span className="bg-gray-100 px-1.5 py-0.5 rounded">Chuyến {timeInfo}</span>}
                        {log.date && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{log.date}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-lg bg-purple-100 border-2 border-purple-400 flex items-center justify-center font-bold text-purple-700 text-sm">{seat1}</div>
                          <span className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[40px] text-center">{name1}</span>
                        </div>
                        <span className="text-purple-500 font-bold text-lg">⇄</span>
                        <div className="flex flex-col items-center">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-700 text-sm">{seat2}</div>
                          <span className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[40px] text-center">{name2}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              return (
                <div key={log.id} className="px-4 py-2.5 border-b border-gray-100 flex items-start gap-3 hover:bg-gray-50 transition">
                  <div className={`w-7 h-7 rounded-full ${meta.bg} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${meta.bg} text-white`}>{meta.label}</span>
                      <span className="text-xs font-semibold text-gray-700">{log.userName}</span>
                      <span className="text-xs text-gray-400 ml-auto">{dateStr} {time}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">{log.description.split(' | ')[0]}</p>
                    {seatVisual}
                    {!seatVisual && log.route && (
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{log.route}</span>
                        {log.date && <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{log.date}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <PrintBookingList
          onClose={() => setShowPrintModal(false)}
          sortedBookings={sortedBookings}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-5 py-3 rounded-xl shadow-lg text-white font-bold text-sm flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
          }`}>
            {toast.type === 'error' ? '!' : '✓'} {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">×</button>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        danger={modal.danger}
        onConfirm={modal.onConfirm || (() => setModal(m => ({ ...m, isOpen: false })))}
        onCancel={() => setModal(m => ({ ...m, isOpen: false }))}
      />
    </div>
  );
};

export default SeatMapNew;
