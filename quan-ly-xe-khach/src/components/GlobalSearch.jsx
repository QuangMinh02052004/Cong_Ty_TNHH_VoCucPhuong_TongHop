import React, { useState, useEffect, useRef } from 'react';
import { useBooking } from '../context/BookingContext';
import { bookingAPI } from '../services/api';

const GlobalSearch = () => {
  const { setSelectedDate, setSelectedRoute, setSelectedTrip, setIsSlotSelected } = useBooking();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await bookingAPI.search(query.trim(), 30);
        setResults(data.results || []);
        setOpen(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handlePick = (booking) => {
    if (booking.date) setSelectedDate(booking.date);
    if (booking.route) setSelectedRoute(booking.route);
    if (booking.timeSlot) {
      setSelectedTrip({
        id: booking.timeSlotId,
        time: booking.timeSlot,
        date: booking.date,
        route: booking.route,
      });
      setIsSlotSelected(true);
    }
    setQuery('');
    setResults([]);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Tìm SĐT / tên khách..."
          className="w-64 pl-8 pr-3 h-8 text-xs rounded-md bg-slate-800 text-white placeholder:text-slate-400 border border-slate-700 focus:border-blue-400 focus:bg-slate-700 focus:outline-none transition"
        />
        {loading && (
          <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        )}
      </div>

      {open && (results.length > 0 || (query.length >= 2 && !loading)) && (
        <div className="absolute right-0 mt-1 w-96 max-h-96 overflow-y-auto bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 z-50">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-400">Không tìm thấy kết quả</div>
          ) : (
            <>
              <div className="px-3 py-1.5 text-[11px] text-slate-500 bg-slate-50 border-b border-slate-200">
                {results.length} kết quả
              </div>
              {results.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handlePick(r)}
                  className="px-3 py-2 border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm text-slate-800 truncate">{r.name || '(không tên)'}</div>
                    <div className="text-xs text-blue-600 font-mono whitespace-nowrap">{r.phone}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">Ghế {r.seatNumber}</span>
                    {r.timeSlot && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{r.timeSlot}</span>}
                    {r.date && <span className="bg-slate-100 px-1.5 py-0.5 rounded">{r.date}</span>}
                    {r.route && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded truncate max-w-[140px]">{r.route}</span>}
                  </div>
                  {(r.dropoffAddress || r.dropoffMethod) && (
                    <div className="text-[11px] text-emerald-700 mt-0.5 truncate">
                      → {r.dropoffAddress || r.dropoffMethod}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
