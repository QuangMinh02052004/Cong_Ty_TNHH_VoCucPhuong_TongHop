import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = 'https://vocucphuongmanage.vercel.app/api/tong-hop';

const ACTION_META = {
  add:         { icon: '+',  bg: 'bg-emerald-500', label: 'Thêm' },
  edit:        { icon: '✎',  bg: 'bg-amber-500',   label: 'Sửa' },
  delete:      { icon: '✕',  bg: 'bg-red-500',     label: 'Hủy' },
  transfer:    { icon: '→',  bg: 'bg-indigo-500',  label: 'Chuyển' },
  swap:        { icon: '⇄',  bg: 'bg-purple-500',  label: 'Hoán đổi' },
  call_status: { icon: '☎',  bg: 'bg-sky-500',     label: 'Gọi điện' },
};

const PAGE_SIZE = 100;

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    route: '',
    userName: '',
    action: '',
    search: '',
  });

  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);

  // Load users + routes for filter dropdowns
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUsers(res.data || []))
      .catch(() => {});
    axios.get(`${API_URL}/routes`)
      .then(res => setRoutes((res.data || []).filter(r => r.isActive)))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        includeCount: '1',
      });
      if (filters.dateFrom) params.set('dateFrom', new Date(filters.dateFrom).toISOString());
      if (filters.dateTo) {
        const d = new Date(filters.dateTo);
        d.setHours(23, 59, 59, 999);
        params.set('dateTo', d.toISOString());
      }
      if (filters.route) params.set('route', filters.route);
      if (filters.userName) params.set('userName', filters.userName);
      if (filters.action) params.set('action', filters.action);
      if (filters.search) params.set('search', filters.search);

      const res = await axios.get(`${API_URL}/activity-log?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  const handleFilterChange = (key, value) => {
    setPage(0);
    setFilters(f => ({ ...f, [key]: value }));
  };

  const resetFilters = () => {
    setPage(0);
    setFilters({ dateFrom: '', dateTo: '', route: '', userName: '', action: '', search: '' });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Export CSV
  const exportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Thời gian', 'User', 'Action', 'Tuyến', 'Ngày', 'Khung giờ', 'Mô tả'];
    const rows = logs.map(l => [
      new Date(l.createdAt).toLocaleString('vi-VN'),
      l.userName || '',
      ACTION_META[l.action]?.label || l.action,
      l.route || '',
      l.date || '',
      l.timeSlot || '',
      (l.description || '').replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${c}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Lịch sử thao tác
          <span className="text-sm font-normal text-gray-500">({total.toLocaleString('vi-VN')} bản ghi)</span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            disabled={logs.length === 0}
            className="px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 transition"
          >
            Tải CSV
          </button>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Từ ngày</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-sky-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Đến ngày</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-sky-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">User</label>
          <select
            value={filters.userName}
            onChange={(e) => handleFilterChange('userName', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-sky-400 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {users.map(u => (
              <option key={u.id} value={u.fullName || u.username}>{u.fullName || u.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Action</label>
          <select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-sky-400 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {Object.entries(ACTION_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Tuyến</label>
          <select
            value={filters.route}
            onChange={(e) => handleFilterChange('route', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-sky-400 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {routes.map(r => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tên/SĐT/ghế..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:border-sky-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-600 uppercase">
            <tr>
              <th className="px-3 py-2 whitespace-nowrap">Thời gian</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Tuyến / Ngày</th>
              <th className="px-3 py-2">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400">Đang tải...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400">Không có bản ghi nào</td></tr>
            ) : (
              logs.map((l) => {
                const meta = ACTION_META[l.action] || { icon: '•', bg: 'bg-gray-400', label: l.action };
                const created = new Date(l.createdAt);
                return (
                  <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                      <div>{created.toLocaleDateString('vi-VN')}</div>
                      <div className="text-gray-400">{created.toLocaleTimeString('vi-VN')}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-white ${meta.bg}`}>
                        <span>{meta.icon}</span>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-700">{l.userName || '-'}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {l.route && <div className="truncate max-w-[180px]" title={l.route}>{l.route}</div>}
                      {(l.date || l.timeSlot) && (
                        <div className="text-gray-400">
                          {l.date}{l.timeSlot && ` · ${l.timeSlot}`}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-700">{l.description}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-gray-500">
            Trang {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50 transition"
            >
              ← Trước
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50 transition"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
