import { useBooking } from '../context/BookingContext';
import RouteFilter from '../components/RouteFilter';
import TimeSlotsNew from '../components/TimeSlotsNew';
import PassengerFormNew from '../components/PassengerFormNew';
import PaymentInfo from '../components/PaymentInfo';
import Timeline from '../components/Timeline';
import SeatMapNew from '../components/SeatMapNew';

const HanhKhachPage = () => {
  const { isSlotSelected, showPassengerForm } = useBooking();

  return (
    <div>
      {/* Route Filter */}
      <RouteFilter />

      {/* Main Content */}
      <div className="mt-4">
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
    </div>
  );
};

export default HanhKhachPage;
