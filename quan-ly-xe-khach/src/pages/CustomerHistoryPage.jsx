import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://vocucphuongmanage.vercel.app/api/tong-hop';
const fmtVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));

const STATUS_BADGE = {
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  default: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const CustomerHistoryPage = () => {
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setError(null);
    try {
      const isPhone = /^\d{9,11}$/.test(q.trim());
      const res = await axios.get(`${API_URL}/customers/history`, {
        params: isPhone ? { phone: q.trim() } : { q: q.trim() }
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Lịch sử khách hàng</h2>
        <form onSubmit={search} className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nhập SĐT hoặc tên khách..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:border-sky-400 focus:outline-none"
          />
          <button type="submit" className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded font-medium">
            Tìm
          </button>
        </form>

        {loading ? <div className="py-8 text-center text-gray-400">Đang tải...</div>
          : error ? <div className="py-8 text-center text-red-500">{error}</div>
          : data ? (
            <>
              {data.profile && (
                <div className="bg-sky-50 border border-sky-200 rounded p-3 mb-3">
                  <div className="font-semibold text-sky-800">{data.profile.name || '(không tên)'} · {data.profile.phone}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Lần đầu: {data.profile.firstSeen ? new Date(data.profile.firstSeen).toLocaleDateString('vi-VN') : '-'}
                    &nbsp;·&nbsp; Lần gần nhất: {data.profile.lastSeen ? new Date(data.profile.lastSeen).toLocaleDateString('vi-VN') : '-'}
                  </div>
                  {data.profile.lastDropoffAddress && (
                    <div className="text-xs text-gray-600 mt-1">
                      Địa chỉ trả gần nhất: <strong>{data.profile.lastDropoffAddress}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <Stat label="Tổng vé" value={data.summary.total} color="sky" />
                <Stat label="Đã thu" value={`${fmtVND(data.summary.totalPaid)}đ`} color="emerald" />
                <Stat label="Nợ" value={`${fmtVND(data.summary.debt)}đ`} color={data.summary.debt > 0 ? 'red' : 'gray'} />
                <Stat label="Đã hủy" value={data.summary.cancelled} color="amber" />
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded max-h-[480px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Ngày</th>
                      <th className="px-3 py-2 text-left">Tuyến</th>
                      <th className="px-3 py-2 text-left">Giờ</th>
                      <th className="px-3 py-2 text-right">Ghế</th>
                      <th className="px-3 py-2 text-right">Tiền</th>
                      <th className="px-3 py-2 text-right">Đã thu</th>
                      <th className="px-3 py-2 text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bookings.map(b => (
                      <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">{b.date}</td>
                        <td className="px-3 py-2 truncate max-w-xs">{b.route}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{b.timeSlot}</td>
                        <td className="px-3 py-2 text-right font-semibold">{b.seatNumber}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{fmtVND(b.amount)}</td>
                        <td className="px-3 py-2 text-right text-emerald-700">{fmtVND(b.paid)}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_BADGE[b.status] || STATUS_BADGE.default}`}>
                            {b.status === 'cancelled' ? 'Đã hủy' : 'OK'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.bookings.length === 0 && (
                      <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-400">Nhập SĐT hoặc tên để xem lịch sử</div>
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
    gray: 'bg-gray-50 border-gray-300 text-gray-500',
  };
  return (
    <div className={`${colors[color]} border-l-4 rounded p-3`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
};

export default CustomerHistoryPage;
