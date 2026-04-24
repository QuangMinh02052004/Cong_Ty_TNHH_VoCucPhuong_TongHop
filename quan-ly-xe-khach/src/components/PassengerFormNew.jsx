import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { activityLogAPI } from '../services/api';
import axios from 'axios';
import { stationNamesWithSTT, extractStationFromText, removeStationFromText } from '../data/stations';
import ConfirmModal from './ConfirmModal';
import StationInput from './StationInput';

const API_URL = 'https://vocucphuongmanage.vercel.app/api/tong-hop';

const PassengerFormNew = () => {
  const {
    addBooking,
    updateBooking,
    selectedTrip,
    bookings,
    currentDayBookings,
    setShowPassengerForm,
    selectedSeatNumber,
    setSelectedSeatNumber,
    editingBooking,
    setEditingBooking,
    transferQueue,
    setTransferQueue,
    selectedRoute,
    selectedDate,
    releaseSeat
  } = useBooking();

  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [foundPassenger, setFoundPassenger] = useState(null);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {} });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Parse route for Bến lên / Bến xuống defaults
  const routeParts = (selectedRoute || '').split('-').map(s => s.trim());
  const defaultPickupStation = routeParts[0] ? `Trạm ${routeParts[0]}` : '';
  const defaultDropoffStation = routeParts[1] ? `Trạm ${routeParts[1]}` : '';

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    gender: '',
    nationality: '',
    ticketType: false,
    pickupStation: defaultPickupStation,
    dropoffStation: defaultDropoffStation,
    pickupMethod: 'Tại bến',
    pickupAddress: '',
    dropoffMethod: 'Tại bến',
    dropoffAddress: '',
    note: '',
    seatNumber: null,
    amount: 110000,
    paid: 0,
    deposit: 0,
    paymentMethod: 'Thanh toán tiền mặt tại quầy',
    preferredSeat: false,
    sendSMS: false,
    printTicket: false,
    printStamp: false,
    sendEmail: false,
    sendZalo: false,
    autoFill: true,
  });

  const searchPassengerByPhone = async (phone) => {
    if (phone.length >= 10) {
      setSearching(true);
      try {
        const response = await axios.get(`${API_URL}/customers/search/${phone}`);
        if (response.data.found) {
          const customer = response.data.customer;
          setFoundPassenger(customer);
          setFormData(prev => ({
            ...prev,
            name: customer.fullName || '',
            pickupMethod: customer.pickupType || 'Tại bến',
            pickupAddress: customer.pickupLocation || '',
            dropoffMethod: customer.dropoffType || 'Tại bến',
            dropoffAddress: customer.dropoffLocation || '',
            note: customer.notes || '',
          }));
          return true;
        } else {
          setFoundPassenger(null);
          return false;
        }
      } catch (error) {
        setFoundPassenger(null);
        return false;
      } finally {
        setSearching(false);
      }
    }
    return false;
  };

  // Format VND: 1000 → "1.000", 1000000 → "1.000.000"
  const formatVND = (value) => {
    const num = String(value).replace(/\D/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(num));
  };
  const parseVND = (str) => parseInt(String(str).replace(/\./g, '')) || 0;

  const moneyFields = ['amount', 'deposit', 'paid'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      let newValue = type === 'checkbox' ? checked : value;
      // Parse tiền VND về số
      if (moneyFields.includes(name)) {
        newValue = parseVND(value);
      }
      const newData = { ...prev, [name]: newValue };
      if (name === 'pickupMethod' && value === 'Tại bến') newData.pickupAddress = '';
      if (name === 'dropoffMethod' && value === 'Tại bến') newData.dropoffAddress = '';
      return newData;
    });
    if (name === 'phone') searchPassengerByPhone(value);
  };

  const handleNoteBlur = () => {
    const match = extractStationFromText(formData.note);
    if (match) {
      const formattedSTT = String(match.stt).padStart(2, '0');
      const stationValue = `${formattedSTT} - ${match.stationName}`;
      const cleanNote = removeStationFromText(formData.note, match);
      setFormData(prev => ({
        ...prev, note: cleanNote, dropoffMethod: 'Dọc đường', dropoffAddress: stationValue
      }));
    }
  };

  const handleStartTransfer = () => {
    const bookingToTransfer = currentDayBookings.find(b => b.id === editingId);
    if (bookingToTransfer) {
      const alreadyInQueue = transferQueue.find(b => b.id === bookingToTransfer.id);
      if (!alreadyInQueue) setTransferQueue(prev => [...prev, bookingToTransfer]);
      setShowPassengerForm(false);
      setIsEditing(false);
      setEditingId(null);
      resetForm();
    }
  };

  const handleSubmit = async () => {
    if (!formData.phone || !formData.name) {
      setModal({ isOpen: true, title: 'Thiếu thông tin', message: 'Vui lòng nhập số điện thoại và họ tên!', type: 'warning', cancelText: null, onConfirm: () => setModal(m => ({ ...m, isOpen: false })) });
      return;
    }
    if (isEditing) {
      updateBooking(editingId, formData);
      activityLogAPI.log({ action: 'edit', description: `Sửa vé: ${formData.name} - Ghế ${formData.seatNumber} - SĐT ${formData.phone} - Chuyến ${selectedTrip?.time || ''} - Trả: ${formData.dropoffAddress || formData.dropoffMethod || 'Tại bến'}`, bookingId: editingId, seatNumber: formData.seatNumber, userName: user?.fullName || user?.username, date: selectedDate, route: selectedRoute, timeSlot: selectedTrip?.time });
      showToast('Đã cập nhật thông tin hành khách!');
      setIsEditing(false);
      setEditingId(null);
    } else {
      if (formData.seatNumber) {
        const seatTaken = currentDayBookings.find(
          booking => booking.timeSlot === selectedTrip.time && booking.seatNumber === formData.seatNumber
        );
        if (seatTaken) {
          setModal({ isOpen: true, title: 'Ghế đã có người', message: `Ghế ${formData.seatNumber} đã được đặt bởi ${seatTaken.name} (${seatTaken.phone}).\nVui lòng chọn ghế khác!`, type: 'warning', cancelText: null, onConfirm: () => setModal(m => ({ ...m, isOpen: false })) });
          return;
        }
      }
      addBooking(formData);
      activityLogAPI.log({ action: 'add', description: `Thêm vé: ${formData.name} - Ghế ${formData.seatNumber} - SĐT ${formData.phone} - Chuyến ${selectedTrip?.time || ''} - Trả: ${formData.dropoffAddress || formData.dropoffMethod || 'Tại bến'}`, seatNumber: formData.seatNumber, userName: user?.fullName || user?.username, date: selectedDate, route: selectedRoute, timeSlot: selectedTrip?.time });
      if (formData.seatNumber && selectedTrip) releaseSeat(selectedTrip.id, formData.seatNumber);
      try {
        await axios.post(`${API_URL}/customers`, {
          phone: formData.phone, fullName: formData.name,
          pickupType: formData.pickupMethod, pickupLocation: formData.pickupAddress,
          dropoffType: formData.dropoffMethod, dropoffLocation: formData.dropoffAddress,
          notes: formData.note
        });
      } catch (error) { /* ignore */ }
      showToast('Đã thêm hành khách thành công!');
    }
    resetForm();
    // Tự động đóng form sau khi thành công
    setTimeout(() => setShowPassengerForm(false), 300);
  };

  const resetForm = () => {
    setFormData({
      phone: '', name: '', gender: '', nationality: '', ticketType: false,
      pickupStation: defaultPickupStation, dropoffStation: defaultDropoffStation,
      pickupMethod: 'Tại bến', pickupAddress: '',
      dropoffMethod: 'Tại bến', dropoffAddress: '',
      note: '', seatNumber: null, amount: 110000, paid: 0, deposit: 0,
      paymentMethod: 'Thanh toán tiền mặt tại quầy',
      preferredSeat: false, sendSMS: false, printTicket: false, printStamp: false,
      sendEmail: false, sendZalo: false, autoFill: true,
    });
    setSelectedSeatNumber(null);
  };

  useEffect(() => {
    if (editingBooking) {
      setFormData(prev => ({ ...prev, ...editingBooking }));
      setIsEditing(true);
      setEditingId(editingBooking.id);
      setEditingBooking(null);
    }
  }, [editingBooking, setEditingBooking]);

  useEffect(() => {
    if (selectedSeatNumber !== null && !isEditing) {
      setFormData(prev => ({ ...prev, seatNumber: selectedSeatNumber }));
    }
  }, [selectedSeatNumber, isEditing]);

  const remaining = (formData.amount || 0) - (formData.paid || 0);
  const tripTime = selectedTrip?.time || '';
  const tripVehicle = selectedTrip?.vehicle || '';

  const inp = "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none";
  const lbl = "text-sm font-medium text-gray-700 whitespace-nowrap w-[90px] min-w-[90px] text-right pr-3";
  const row = "flex items-center";

  return (
    <div className="bg-white flex flex-col min-h-full">
      {/* THÔNG TIN HÀNH KHÁCH */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <span className="font-bold text-gray-800 text-sm uppercase">
          {isEditing ? 'Chỉnh sửa hành khách' : 'Thông tin hành khách'}
        </span>
        <button
          onClick={() => {
            if (selectedSeatNumber && selectedTrip && !isEditing) releaseSeat(selectedTrip.id, selectedSeatNumber);
            setShowPassengerForm(false);
            setSelectedSeatNumber(null);
          }}
          className="text-gray-400 hover:text-red-500 text-xl font-bold leading-none" title="Đóng"
        >×</button>
      </div>

      <div className="px-4 py-3 space-y-2.5 flex-1">
        {/* Điện thoại */}
        <div className={row}>
          <label className={lbl}>Điện thoại</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
            autoComplete="off" className={`${inp} flex-1`} placeholder="Số điện thoại" />
        </div>
        {foundPassenger && (
          <div className="ml-[94px] px-2 py-1 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-600">
            Tìm thấy: <strong>{foundPassenger.name}</strong>
          </div>
        )}

        {/* Họ tên */}
        <div className={row}>
          <label className={lbl}>Họ tên</label>
          <input type="text" name="name" value={formData.name} onChange={handleInputChange}
            autoComplete="off" className={`${inp} flex-1`} placeholder="" />
        </div>

        {/* Bến lên */}
        <div className={row}>
          <label className={lbl}>Bến lên</label>
          <select name="pickupStation" value={formData.pickupStation} onChange={handleInputChange}
            className={`${inp} flex-1`}>
            <option value={defaultPickupStation}>{defaultPickupStation || '-- Chọn bến --'}</option>
            {stationNamesWithSTT.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Bến xuống */}
        <div className={row}>
          <label className={lbl}>Bến xuống</label>
          <select name="dropoffStation" value={formData.dropoffStation} onChange={handleInputChange}
            className={`${inp} flex-1`}>
            <option value={defaultDropoffStation}>{defaultDropoffStation || '-- Chọn bến --'}</option>
            {stationNamesWithSTT.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Cách đón */}
        <div className={row}>
          <label className={lbl}>Cách đón <span className="text-red-500">*</span></label>
          <select name="pickupMethod" value={formData.pickupMethod} onChange={handleInputChange}
            className={`${inp} flex-1`}>
            <option value="Tại bến">Tại bến</option>
            <option value="Dọc đường">Dọc đường</option>
            <option value="Tại nhà">Tại nhà</option>
          </select>
        </div>

        {formData.pickupMethod !== 'Tại bến' && (
          <div className={row}>
            <label className={lbl}></label>
            <StationInput
              value={formData.pickupAddress}
              onChange={(val) => handleInputChange({ target: { name: 'pickupAddress', value: val } })}
              options={stationNamesWithSTT}
              placeholder="Chọn hoặc nhập địa chỉ đón"
              className="flex-1"
            />
          </div>
        )}

        {/* Cách trả */}
        <div className={row}>
          <label className={lbl}>Cách trả <span className="text-red-500">*</span></label>
          <select name="dropoffMethod" value={formData.dropoffMethod} onChange={handleInputChange}
            className={`${inp} flex-1`}>
            <option value="Tại bến">Tại bến</option>
            <option value="Dọc đường">Dọc đường</option>
          </select>
        </div>

        {formData.dropoffMethod !== 'Tại bến' && (
          <div className={row}>
            <label className={lbl}></label>
            <StationInput
              value={formData.dropoffAddress}
              onChange={(val) => handleInputChange({ target: { name: 'dropoffAddress', value: val } })}
              options={stationNamesWithSTT}
              placeholder="Chọn hoặc nhập địa chỉ trả"
              className="flex-1"
            />
          </div>
        )}

        {/* Ghi chú */}
        <div className="flex items-start">
          <label className={lbl + ' pt-2'}>Ghi chú</label>
          <textarea name="note" value={formData.note} onChange={handleInputChange} onBlur={handleNoteBlur}
            rows="3" className={`${inp} flex-1`} placeholder="" />
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 ml-[94px]">
          {[
            { name: 'preferredSeat', label: 'Ghế ưu đãi' },
            { name: 'sendSMS', label: 'Gửi tin nhắn' },
            { name: 'printTicket', label: 'In vé' },
            { name: 'printStamp', label: 'In tem vé' },
            { name: 'sendEmail', label: 'Gửi email' },
            { name: 'sendZalo', label: 'Gửi ZALO OA' },
          ].map(cb => (
            <label key={cb.name} className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" name={cb.name} checked={formData[cb.name] || false} onChange={handleInputChange}
                className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-600">{cb.label}</span>
            </label>
          ))}
        </div>

        {/* Tự động điền */}
        <div className="ml-[94px] pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="autoFill" checked={formData.autoFill} onChange={handleInputChange}
              className="w-4 h-4 rounded text-sky-600" />
            <span className="text-sm text-sky-600 font-medium">Tự động điền cho tất cả</span>
          </label>
        </div>
      </div>

      {/* THÔNG TIN THANH TOÁN */}
      <div className="px-4 py-2.5 border-y border-gray-200 bg-gray-50">
        <span className="font-bold text-gray-800 text-sm uppercase">Thông tin thanh toán</span>
      </div>

      <div className="px-4 py-3 space-y-2.5">
        {/* Thực thu */}
        <div className={row}>
          <label className={lbl}>Thực thu <span className="text-red-500">*</span></label>
          <input type="text" inputMode="numeric" name="amount" value={formatVND(formData.amount)} onChange={handleInputChange}
            autoComplete="off" className={`${inp} flex-1 text-right font-semibold`} />
        </div>

        {/* Thu cọc/Thu tiếp */}
        <div className={row}>
          <label className={lbl}>Thu cọc/Thu tiếp</label>
          <input type="text" inputMode="numeric" name="deposit" value={formatVND(formData.deposit)} onChange={handleInputChange}
            autoComplete="off" className={`${inp} flex-1 text-right`} />
        </div>

        {/* Đã thu + Còn lại */}
        <div className={row}>
          <label className={lbl}>Đã thu</label>
          <input type="text" inputMode="numeric" name="paid" value={formatVND(formData.paid)} onChange={handleInputChange}
            autoComplete="off" className={`${inp} w-24 text-right`} />
          <span className="text-sm text-gray-500 mx-2">Còn lại</span>
          <span className={`text-base font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {new Intl.NumberFormat('vi-VN').format(remaining)}
          </span>
        </div>

        {/* Hình thức TT */}
        <div className={row}>
          <label className={lbl}>Hình thức TT</label>
          <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange}
            className={`${inp} flex-1`}>
            <option value="Thanh toán tiền mặt tại quầy">Thanh toán tiền mặt tại quầy</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Thẻ tín dụng">Thẻ tín dụng</option>
            <option value="Ví điện tử">Ví điện tử</option>
          </select>
        </div>
      </div>

      {/* Trip Info Bar */}
      <div className="mt-auto bg-slate-800 text-white px-4 py-3 text-sm space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-bold">{tripTime} - {selectedDate || ''}, xe: {tripVehicle || '---'}</div>
            <div>Số ghế: <strong>{formData.seatNumber || '-'}</strong>
              <span className="ml-4">Tổng tiền: <strong>{new Intl.NumberFormat('vi-VN').format(formData.amount)}</strong></span>
            </div>
            <div>Thực thu: <strong>{new Intl.NumberFormat('vi-VN').format(formData.amount)}</strong>
              <span className="ml-4">Đã thu: <strong>{new Intl.NumberFormat('vi-VN').format(formData.paid)}</strong></span>
            </div>
          </div>
          {remaining > 0 && (
            <span className="bg-red-500 text-white px-3 py-1.5 rounded font-bold text-sm whitespace-nowrap">
              Phải thu: {new Intl.NumberFormat('vi-VN').format(remaining)}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex border-t border-gray-300">
        <button onClick={() => setFormData(prev => ({ ...prev, paid: prev.amount }))}
          className="flex-1 py-3 text-sm font-bold text-blue-700 border-r border-gray-300 hover:bg-blue-50 transition">
          Thu tiền
        </button>
        {isEditing && (
          <button type="button" onClick={handleStartTransfer}
            className="flex-1 py-3 text-sm font-bold text-orange-600 border-r border-gray-300 hover:bg-orange-50 transition">
            Chuyển
          </button>
        )}
        <button onClick={handleSubmit}
          className="flex-1 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition">
          {isEditing ? 'Cập nhật' : 'Thêm hành khách'}
        </button>
        {isEditing && (
          <button onClick={() => { setIsEditing(false); setEditingId(null); resetForm(); }}
            className="flex-1 py-3 text-sm font-bold text-gray-500 border-l border-gray-300 hover:bg-gray-100 transition">
            Hủy
          </button>
        )}
      </div>
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold animate-[slideIn_0.3s_ease] ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Confirm/Alert Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        cancelText={modal.cancelText}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal(m => ({ ...m, isOpen: false }))}
      />
    </div>
  );
};

export default PassengerFormNew;
