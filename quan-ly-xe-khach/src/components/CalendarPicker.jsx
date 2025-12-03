import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { convertSolar2Lunar } from '../utils/lunarCalendar';

const CalendarPicker = ({ selectedDate, onDateSelect, onClose }) => {
  // Parse selectedDate (format: DD-MM-YYYY)
  const [day, month, year] = selectedDate.split('-').map(Number);
  const [currentMonth, setCurrentMonth] = useState(month - 1); // JavaScript months are 0-indexed
  const [currentYear, setCurrentYear] = useState(year);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day) => {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const newDate = `${formattedDay}-${formattedMonth}-${currentYear}`;
    onDateSelect(newDate);
    onClose();
  };

  // Tạo mảng ngày để hiển thị
  const days = [];
  // Thêm ô trống cho những ngày trước ngày 1
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Thêm các ngày trong tháng
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === parseInt(selectedDate.split('-')[0]) &&
           currentMonth === parseInt(selectedDate.split('-')[1]) - 1 &&
           currentYear === parseInt(selectedDate.split('-')[2]);
  };

  return (
    <div className="absolute top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4 w-80">
      {/* Header với tháng/năm và nút điều hướng */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <FaChevronLeft className="text-gray-600" />
        </button>
        <div className="text-lg font-bold text-gray-800">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>

      {/* Tên các ngày trong tuần */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((name, index) => (
          <div key={index} className="text-center text-xs font-semibold text-gray-600 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Grid các ngày */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const lunar = convertSolar2Lunar(day, currentMonth + 1, currentYear);
          const isTodayDate = isToday(day);
          const isSelectedDate = isSelected(day);

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-md transition
                hover:bg-blue-100 relative
                ${isTodayDate ? 'bg-green-100 font-bold' : ''}
                ${isSelectedDate ? 'bg-blue-500 text-white font-bold' : 'text-gray-800'}
              `}
            >
              {/* Ngày dương lịch */}
              <span className={`text-sm ${isSelectedDate ? 'text-white' : ''}`}>
                {day}
              </span>
              {/* Ngày âm lịch */}
              <span className={`text-[9px] ${isSelectedDate ? 'text-blue-100' : 'text-gray-500'}`}>
                {lunar.day}/{lunar.month}
              </span>
              {/* Đánh dấu ngày hôm nay */}
              {isTodayDate && !isSelectedDate && (
                <div className="absolute bottom-0.5 w-1 h-1 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer với nút đóng */}
      <div className="mt-4 pt-3 border-t flex justify-end gap-2">
        <button
          onClick={() => {
            const today = new Date();
            const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
            onDateSelect(formattedDate);
            onClose();
          }}
          className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Hôm nay
        </button>
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default CalendarPicker;
