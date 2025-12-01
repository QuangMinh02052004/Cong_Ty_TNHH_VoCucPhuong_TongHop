import React, { useState } from 'react';
import { FaPlus, FaCheckCircle } from 'react-icons/fa';

const TimeSlots = ({ onSelectSlot }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Dữ liệu mẫu cho các khung giờ
  const timeSlots = [
    { time: '05:30', date: '28/26', type: 'Xe 28G', code: 'T: TX Thanh Bắc', booked: '60BO5307', status: 'booked' },
    { time: '06:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '06:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '07:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '07:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '08:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '08:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '09:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '09:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '10:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '10:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '11:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '11:30', date: '28/27', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '12:00', date: '28/27', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '12:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '13:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '13:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '14:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '14:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '15:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '15:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '16:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '16:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '17:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '17:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '18:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '18:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '19:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '19:30', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
    { time: '20:00', date: '28/28', type: 'Xe 28G', code: '', booked: '', status: 'available' },
  ];

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {timeSlots.map((slot, index) => (
          <div
            key={index}
            onClick={() => handleSlotClick(slot)}
            className={`
              relative border-2 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md
              ${slot.status === 'booked'
                ? 'bg-green-50 border-green-400'
                : 'bg-white border-gray-300 hover:border-blue-400'
              }
              ${selectedSlot?.time === slot.time ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            {/* Time */}
            <div className="text-xl font-bold text-gray-800 mb-1">
              {slot.time}
            </div>

            {/* Date */}
            <div className="text-xs text-gray-500 mb-1">
              {slot.date}
            </div>

            {/* Vehicle Type */}
            <div className="text-xs text-gray-600 font-medium">
              {slot.type}
            </div>

            {/* Booked Code */}
            {slot.status === 'booked' && (
              <div className="mt-2">
                <div className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-1 rounded">
                  {slot.booked}
                </div>
                {slot.code && (
                  <div className="text-xs text-gray-600 mt-1">{slot.code}</div>
                )}
                <FaCheckCircle className="absolute top-2 right-2 text-green-500" />
              </div>
            )}
          </div>
        ))}

        {/* Add New Slot Button */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
          <FaPlus className="text-3xl text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default TimeSlots;
