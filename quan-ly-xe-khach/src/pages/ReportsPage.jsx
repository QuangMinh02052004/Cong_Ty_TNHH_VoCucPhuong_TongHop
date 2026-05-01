import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://vocucphuongmanage.vercel.app/api/tong-hop';

const fmtVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));

const todayDDMMYYYY = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};

const ReportsPage = () => {
  const [date, setDate] = useState(todayDDMMYYYY());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [recipients, setRecipients] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/reports/daily`, { params: { date } });
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const res = await axios.post(`${API_URL}/reports/daily/send`, {
        date,
        to: recipients.trim() || undefined,
      });
      setSendResult({ type: 'success', message: `Đã gửi tới ${res.data.sent.join(', ')}` });
    } catch (err) {
      setSendResult({ type: 'error', message: err.response?.data?.error || err.message });
    } finally {
      setSending(false);
    }
  };

  // Convert DD-MM-YYYY ↔ YYYY-MM-DD for date input
  const toInputDate = (s) => {
    const [d, m, y] = (s || '').split('-');
    if (!d || !m || !y) return '';
    return `${y}-${m}-${d}`;
  };
  const fromInputDate = (s) => {
    const [y, m, d] = (s || '').split('-');
    if (!d || !m || !y) return '';
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Báo cáo cuối ngày</h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={toInputDate(date)}
              onChange={(e) => setDate(fromInputDate(e.target.value))}
              className="px-2 py-1.5 text-sm border border-gray-300 rounded bg-white"
            />
            <button
              onClick={() => setDate(todayDDMMYYYY())}
              className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium transition"
            >
              Hôm nay
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-center text-gray-400">Đang tải...</div>
        ) : error ? (
          <div className="px-4 py-8 text-center text-red-500">{error}</div>
        ) : report ? (
          <>
            <div className="px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-sky-50 border-l-4 border-sky-500 rounded p-3">
                <div className="text-xs text-gray-500">Tổng vé</div>
                <div className="text-2xl font-semibold text-sky-700">{report.summary.totalBookings}</div>
                {report.summary.cancelledBookings > 0 && (
                  <div className="text-xs text-red-500">+ {report.summary.cancelledBookings} hủy</div>
                )}
              </div>
              <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded p-3">
                <div className="text-xs text-gray-500">Đã thu</div>
                <div className="text-2xl font-semibold text-emerald-700">{fmtVND(report.summary.totalPaid)}đ</div>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-3">
                <div className="text-xs text-gray-500">Tổng giá trị</div>
                <div className="text-2xl font-semibold text-amber-700">{fmtVND(report.summary.totalAmount)}đ</div>
              </div>
              <div className={`${report.summary.totalDebt > 0 ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-gray-300 text-gray-500'} border-l-4 rounded p-3`}>
                <div className="text-xs text-gray-500">Còn nợ</div>
                <div className="text-2xl font-semibold">{fmtVND(report.summary.totalDebt)}đ</div>
              </div>
            </div>

            <div className="px-4 pb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Theo tuyến</h3>
              <div className="overflow-x-auto border border-gray-200 rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Tuyến</th>
                      <th className="px-3 py-2 text-right">Vé</th>
                      <th className="px-3 py-2 text-right">Đã thu</th>
                      <th className="px-3 py-2 text-right">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byRoute.map(r => (
                      <tr key={r.route} className="border-t border-gray-100">
                        <td className="px-3 py-2">{r.route}</td>
                        <td className="px-3 py-2 text-right">{r.count}</td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-700">{fmtVND(r.paid)}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{fmtVND(r.amount)}</td>
                      </tr>
                    ))}
                    {report.byRoute.length === 0 && (
                      <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-400">Không có dữ liệu</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-4 pb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Theo khung giờ</h3>
              <div className="overflow-x-auto border border-gray-200 rounded max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Tuyến</th>
                      <th className="px-3 py-2 text-left">Giờ</th>
                      <th className="px-3 py-2 text-right">Vé</th>
                      <th className="px-3 py-2 text-right">Đã thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byTimeSlot.map((t, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-3 py-2 text-xs text-gray-500">{t.route}</td>
                        <td className="px-3 py-2 font-semibold">{t.timeSlot}</td>
                        <td className="px-3 py-2 text-right">{t.count}</td>
                        <td className="px-3 py-2 text-right text-emerald-700">{fmtVND(t.paid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Send via email */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">Gửi báo cáo qua email</h3>
          <p className="text-xs text-gray-500 mt-1">Cần env <code className="bg-gray-100 px-1 rounded">RESEND_API_KEY</code> và <code className="bg-gray-100 px-1 rounded">REPORT_RECIPIENTS</code> (hoặc nhập thủ công)</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          <input
            type="text"
            placeholder="Email người nhận (cách nhau dấu phẩy) — để trống dùng env mặc định"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:border-sky-400 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSend}
              disabled={sending || !report}
              className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded font-medium disabled:opacity-50 transition"
            >
              {sending ? 'Đang gửi...' : `Gửi báo cáo ${date}`}
            </button>
            {sendResult && (
              <span className={`text-sm ${sendResult.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                {sendResult.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Auto-cron instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="font-semibold mb-1">Tự động gửi cuối ngày (miễn phí):</p>
        <ol className="list-decimal pl-5 space-y-1 text-xs text-blue-800">
          <li>Đăng ký tài khoản miễn phí tại <a href="https://cron-job.org" target="_blank" rel="noreferrer" className="underline">cron-job.org</a></li>
          <li>Tạo cronjob POST tới <code className="bg-blue-100 px-1 rounded">https://vocucphuongmanage.vercel.app/api/tong-hop/reports/daily/send</code></li>
          <li>Body: <code className="bg-blue-100 px-1 rounded">{`{"date":"DD-MM-YYYY"}`}</code> (cần script tự sinh ngày hôm nay)</li>
          <li>Schedule: 23:30 mỗi ngày, timezone Asia/Ho_Chi_Minh</li>
        </ol>
      </div>
    </div>
  );
};

export default ReportsPage;
