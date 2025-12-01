import React from 'react';
import { BookingProvider, useBooking } from './context/BookingContext';
import Header from './components/Header';
import RouteFilter from './components/RouteFilter';
import TimeSlotsNew from './components/TimeSlotsNew';
import PassengerFormNew from './components/PassengerFormNew';
import PaymentInfo from './components/PaymentInfo';
import Timeline from './components/Timeline';
import SeatMapNew from './components/SeatMapNew';

function AppContent() {
  const { isSlotSelected, showPassengerForm } = useBooking();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Route Filter */}
      <RouteFilter />

      {/* Main Content */}
      <div className="py-4">
        {/* Grid Layout: Left (Time Slots) and Right (Form) - Dynamic based on form visibility */}
        <div className={`grid grid-cols-1 ${showPassengerForm ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-0`}>
          {/* Left Side - Time Slots (Full width when form hidden) */}
          <div className={showPassengerForm ? 'lg:col-span-3' : 'lg:col-span-1'}>
            <TimeSlotsNew />

            {/* Timeline Below Time Slots - Only show when slot is selected */}
            {isSlotSelected && (
              <div className="mt-2">
                <Timeline />
              </div>
            )}

            {/* Seat Map Below Timeline - Only show when slot is selected */}
            {isSlotSelected && (
              <div className="mt-2">
                <SeatMapNew />
              </div>
            )}
          </div>

          {/* Right Side - Passenger Form & Payment (1/4 width on large screens) - Only show when form is visible */}
          {isSlotSelected && showPassengerForm && (
            <div className="lg:col-span-1 space-y-2 px-2">
              <PassengerFormNew />
              <PaymentInfo />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4 mt-8">
        <p className="text-sm">© 2025 Phần mềm Nhà Xe - Hệ thống quản lý vận tải</p>
        <p className="text-xs text-gray-400 mt-1">Hotline: 1900 7034</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BookingProvider>
      <AppContent />
    </BookingProvider>
  );
}

export default App;
