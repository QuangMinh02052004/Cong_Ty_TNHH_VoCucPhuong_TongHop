import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://vocucphuongmanage.vercel.app/api/tong-hop';

const todayDDMMYYYY = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};
const toInputDate = (s) => { const [d, m, y] = (s || '').split('-'); return d && m && y ? `${y}-${m}-${d}` : ''; };
const fromInputDate = (s) => { const [y, m, d] = (s || '').split('-'); return d && m && y ? `${d}-${m}-${y}` : ''; };

const STATUS_PRIORITY = {
  'Chưa gọi': 0,
  'Phòng vé gọi không nghe': 1,
  'Tài xế gọi không nghe': 2,
  'Phòng vé đã gọi': 3,
  'Tài xế đã gọi': 4,
};

const STATUS_BG = {
  'Chưa gọi': '#f1f5f9',
  'Phòng vé gọi không nghe': '#fee2e2',
  'Tài xế gọi không nghe': '#fee2e2',
  'Phòng vé đã gọi': '#dbeafe',
  'Tài xế đã gọi': '#dcfce7',
};

const CallListPage = () => {
  const [date, setDate] = useState(todayDDMMYYYY());
  const [routeFilter, setRouteFilter] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/bookings`, { params: { date } });
      const data = Array.isArray(res.data) ? res.data : (res.data.bookings || []);
      setBookings(data.filter(b => b.status !== 'cancelled'));
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, callStatus) => {
    try {
      await axios.patch(`${API_URL}/bookings/${id}`, { callStatus });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, callStatus } : b));
    } catch (e) {
      alert('Không cập nhật được: ' + e.message);
    }
  };

  const filtered = bookings
    .filter(b => !routeFilter || b.route === routeFilter)
    .sort((a, b) => {
      const sa = STATUS_PRIORITY[a.callStatus || 'Chưa gọi'] ?? 0;
      const sb = STATUS_PRIORITY[b.callStatus || 'Chưa gọi'] ?? 0;
      if (sa !== sb) return sa - sb;
      const ra = (a.route || '').localeCompare(b.route || '');
      if (ra !== 0) return ra;
      return (a.timeSlot || '').localeCompare(b.timeSlot || '');
    });

  const routes = Array.from(new Set(bookings.map(b => b.route).filter(Boolean))).sort();
  const stats = {
    total: filtered.length,
    chuagoi: filtered.filter(b => !b.callStatus || b.callStatus === 'Chưa gọi').length,
    khongnghe: filtered.filter(b => (b.callStatus || '').includes('không nghe')).length,
    dagoi: filtered.filter(b => (b.callStatus || '').includes('đã gọi')).length,
  };

  return (
    <div className="space-y-4">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3 no-print">
          <h2 className="text-lg font-semibold text-gray-800">Danh sách gọi khách</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={toInputDate(date)}
              onChange={(e) => setDate(fromInputDate(e.target.value))}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded"
            />
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded"
            >
              <option value="">Tất cả tuyến</option>
              {routes.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={() => window.print()} className="px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium">
              In danh sách
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <Stat label="Tổng" value={stats.total} color="sky" />
          <Stat label="Chưa gọi" value={stats.chuagoi} color="amber" />
          <Stat label="Không nghe" value={stats.khongnghe} color="red" />
          <Stat label="Đã gọi" value={stats.dagoi} color="emerald" />
        </div>

        <div className="text-base font-semibold text-gray-800 mb-2">
          {date} {routeFilter ? `· ${routeFilter}` : ''}
        </div>

        {loading ? <div className="py-8 text-center text-gray-400">Đang tải...</div>
          : filtered.length === 0 ? <div className="py-8 text-center text-gray-400">Không có khách</div>
          : (
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-2 py-2 text-left w-10">#</th>
                    <th className="px-2 py-2 text-left">Tuyến · Giờ</th>
                    <th className="px-2 py-2 text-center w-12">Ghế</th>
                    <th className="px-2 py-2 text-left">Tên</th>
                    <th className="px-2 py-2 text-left">SĐT</th>
                    <th className="px-2 py-2 text-left">Điểm trả</th>
                    <th className="px-2 py-2 text-left">Trạng thái gọi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <tr key={b.id} className="border-t border-gray-100" style={{ background: STATUS_BG[b.callStatus || 'Chưa gọi'] }}>
                      <td className="px-2 py-1.5 text-gray-400">{i + 1}</td>
                      <td className="px-2 py-1.5">
                        <div className="font-medium">{b.route}</div>
                        <div className="text-xs text-gray-500">{b.timeSlot}</div>
                      </td>
                      <td className="px-2 py-1.5 text-center font-bold text-sky-600">{b.seatNumber}</td>
                      <td className="px-2 py-1.5">{b.name}</td>
                      <td className="px-2 py-1.5">
                        <a href={`tel:${b.phone}`} className="text-sky-600 underline font-semibold">{b.phone}</a>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-gray-600">{b.dropoffAddress || b.dropoffMethod}</td>
                      <td className="px-2 py-1.5 no-print">
                        <select
                          value={b.callStatus || 'Chưa gọi'}
                          onChange={(e) => updateStatus(b.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                        >
                          <option>Chưa gọi</option>
                          <option>Phòng vé đã gọi</option>
                          <option>Phòng vé gọi không nghe</option>
                          <option>Tài xế đã gọi</option>
                          <option>Tài xế gọi không nghe</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
};

const Stat = ({ label, value, color }) => {
  const colors = {
    sky: 'bg-sky-50 border-sky-500 text-sky-700',
    emerald: 'bg-emerald-50 border-emerald-500 text-emerald-700',
    amber: 'bg-amber-50 border-amber-500 text-amber-700',
    red: 'bg-red-50 border-red-500 text-red-700',
  };
  return (
    <div className={`${colors[color]} border-l-4 rounded p-3`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
};

export default CallListPage;
