import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'https://vocucphuongmanage.vercel.app/api/tong-hop';
const fmtVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));
const fmtPct = (n) => `${(Number(n) * 100).toFixed(1)}%`;

const ddmmyyyy = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
const toInputDate = (s) => { const [d, m, y] = (s || '').split('-'); return d && m && y ? `${y}-${m}-${d}` : ''; };
const fromInputDate = (s) => { const [y, m, d] = (s || '').split('-'); return d && m && y ? `${d}-${m}-${y}` : ''; };

const DashboardPage = () => {
  const today = new Date();
  const sevenAgo = new Date(today); sevenAgo.setDate(sevenAgo.getDate() - 6);

  const [from, setFrom] = useState(ddmmyyyy(sevenAgo));
  const [to, setTo] = useState(ddmmyyyy(today));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await axios.get(`${API_URL}/dashboard`, { params: { from, to } });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const setRange = (days) => {
    const t = new Date();
    const f = new Date(); f.setDate(f.getDate() - (days - 1));
    setFrom(ddmmyyyy(f)); setTo(ddmmyyyy(t));
  };

  // Heatmap pivot: rows = route, cols = timeSlot, value = fillRate
  const heatmapPivot = useMemo(() => {
    if (!data?.heatmap) return null;
    const routes = Array.from(new Set(data.heatmap.map(h => h.route))).sort();
    const slots = Array.from(new Set(data.heatmap.map(h => h.timeSlot))).sort();
    const cellMap = new Map(data.heatmap.map(h => [`${h.route}|${h.timeSlot}`, h]));
    return { routes, slots, cellMap };
  }, [data]);

  const maxDaily = useMemo(() => {
    if (!data?.daily) return 1;
    return Math.max(1, ...data.daily.map(d => d.paid));
  }, [data]);

  const heatColor = (fr) => {
    if (fr >= 0.9) return 'bg-emerald-500 text-white';
    if (fr >= 0.7) return 'bg-emerald-300 text-emerald-900';
    if (fr >= 0.5) return 'bg-amber-200 text-amber-900';
    if (fr >= 0.3) return 'bg-orange-200 text-orange-900';
    if (fr > 0) return 'bg-red-200 text-red-900';
    return 'bg-gray-100 text-gray-400';
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Dashboard điều hành</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={toInputDate(from)}
              onChange={(e) => setFrom(fromInputDate(e.target.value))}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={toInputDate(to)}
              onChange={(e) => setTo(fromInputDate(e.target.value))}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded"
            />
            <button onClick={() => setRange(7)} className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded">7 ngày</button>
            <button onClick={() => setRange(30)} className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded">30 ngày</button>
          </div>
        </div>

        {loading ? <div className="py-8 text-center text-gray-400">Đang tải...</div>
          : error ? <div className="py-8 text-center text-red-500">{error}</div>
          : data ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <Stat label="Tổng vé" value={data.summary.totalBookings} sub={`${data.summary.cancelledBookings} hủy`} color="sky" />
                <Stat label="Đã thu" value={`${fmtVND(data.summary.totalPaid)}đ`} color="emerald" />
                <Stat label="Còn nợ" value={`${fmtVND(data.summary.totalDebt)}đ`} color={data.summary.totalDebt > 0 ? 'red' : 'gray'} />
                <Stat label="Lấp ghế" value={fmtPct(data.summary.fillRate)} sub={`${data.summary.totalTrips} chuyến`} color="amber" />
              </div>

              {/* Daily revenue bar chart */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Doanh thu theo ngày</h3>
                <div className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="flex items-end gap-1 h-32 overflow-x-auto">
                    {data.daily.map(d => (
                      <div key={d.date} className="flex flex-col items-center min-w-[40px]" title={`${d.date}: ${fmtVND(d.paid)}đ — ${d.count} vé`}>
                        <div className="w-full flex-1 flex items-end">
                          <div
                            className="w-full bg-sky-500 hover:bg-sky-600 rounded-t transition cursor-help"
                            style={{ height: `${(d.paid / maxDaily) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">{d.date.slice(0, 5)}</div>
                        <div className="text-[10px] font-semibold text-gray-700">{d.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* By Route */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Theo tuyến</h3>
                <div className="overflow-x-auto border border-gray-200 rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Tuyến</th>
                        <th className="px-3 py-2 text-right">Vé</th>
                        <th className="px-3 py-2 text-right">Chuyến</th>
                        <th className="px-3 py-2 text-right">Lấp ghế</th>
                        <th className="px-3 py-2 text-right">Đã thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byRoute.map(r => (
                        <tr key={r.route} className="border-t border-gray-100">
                          <td className="px-3 py-2">{r.route}</td>
                          <td className="px-3 py-2 text-right">{r.count}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{r.trips}</td>
                          <td className="px-3 py-2 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${heatColor(r.fillRate)}`}>
                              {fmtPct(r.fillRate)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-emerald-700">{fmtVND(r.paid)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Heatmap */}
              {heatmapPivot && heatmapPivot.routes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Heatmap lấp ghế (tuyến × giờ)</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left">Tuyến \ Giờ</th>
                          {heatmapPivot.slots.map(s => (
                            <th key={s} className="px-2 py-2 text-center font-medium text-gray-500">{s}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapPivot.routes.map(r => (
                          <tr key={r} className="border-t border-gray-100">
                            <td className="px-2 py-1.5 font-medium text-gray-700 whitespace-nowrap">{r}</td>
                            {heatmapPivot.slots.map(s => {
                              const cell = heatmapPivot.cellMap.get(`${r}|${s}`);
                              if (!cell) return <td key={s} className="px-2 py-1.5 text-center text-gray-300">—</td>;
                              return (
                                <td key={s} className="px-1 py-1">
                                  <div
                                    className={`text-center rounded py-1 px-1 font-semibold ${heatColor(cell.fillRate)}`}
                                    title={`${cell.count} vé / ${cell.days} ngày`}
                                  >
                                    {fmtPct(cell.fillRate)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top customers */}
              {data.topCustomers.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Top 20 khách hàng</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Tên</th>
                          <th className="px-3 py-2 text-left">SĐT</th>
                          <th className="px-3 py-2 text-right">Vé</th>
                          <th className="px-3 py-2 text-right">Đã thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topCustomers.map((c, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 font-medium">{c.name || '-'}</td>
                            <td className="px-3 py-2 text-gray-500">{c.phone || '-'}</td>
                            <td className="px-3 py-2 text-right font-semibold">{c.count}</td>
                            <td className="px-3 py-2 text-right text-emerald-700">{fmtVND(c.paid)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
      </div>
    </div>
  );
};

const Stat = ({ label, value, sub, color }) => {
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
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
};

export default DashboardPage;
