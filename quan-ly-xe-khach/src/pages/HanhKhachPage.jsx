import { useBooking } from '../context/BookingContext';
import RouteFilter from '../components/RouteFilter';
import TimeSlotsNew from '../components/TimeSlotsNew';
import PassengerFormNew from '../components/PassengerFormNew';
import Timeline from '../components/Timeline';
import SeatMapNew from '../components/SeatMapNew';

const HanhKhachPage = () => {
  const { isSlotSelected, showPassengerForm } = useBooking();

  return (
    <div className={showPassengerForm ? 'lg:pr-[420px]' : ''}>
      {/* Route Filter */}
      <RouteFilter />

      {/* Main Content */}
      <div className="mt-4">
        <TimeSlotsNew />

        {isSlotSelected && (
          <div className="mt-2">
            <Timeline />
          </div>
        )}

        {isSlotSelected && (
          <div className="mt-2">
            <SeatMapNew />
          </div>
        )}
      </div>

      {/* Form Sidebar - Fullscreen overlay on mobile, fixed sidebar on desktop */}
      {isSlotSelected && showPassengerForm && (
        <div className="fixed top-0 right-0 bottom-0 left-0 lg:left-auto lg:w-[420px] bg-white lg:border-l border-gray-300 shadow-xl z-50 overflow-y-auto">
          <PassengerFormNew />
        </div>
      )}
    </div>
  );
};

export default HanhKhachPage;
