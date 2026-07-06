import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ToastNotification from '../components/ToastNotification';

// Nguồn dùng chung với DatVe: bảng TH_PickupStations qua API tong-hop (cùng domain)
const API_URL = '/api/tong-hop/pickup-stations';

const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

const StationAliasPage = () => {
  const [direction, setDirection] = useState('sg-lk'); // 'sg-lk' | 'lk-sg'
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null); // station đang sửa
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ stt: '', sortOrder: '', name: '', aliasesText: '' });

  const showToast = (message, type = 'success') => setToast({ message, type });

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}?direction=${direction}&activeOnly=false`);
      setStations(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      showToast('Không tải được danh sách trạm', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [direction]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetForm = () => {
    setEditing(null);
    setForm({ stt: '', sortOrder: '', name: '', aliasesText: '' });
  };

  const startEdit = (s) => {
    setEditing(s);
    setForm({
      stt: s.stt,
      sortOrder: String(s.sortOrder),
      name: s.name,
      aliasesText: (s.aliases || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      stt: form.stt.trim(),
      sortOrder: parseFloat(form.sortOrder),
      name: form.name.trim(),
      aliases: form.aliasesText.split(',').map(x => x.trim().toLowerCase()).filter(Boolean),
    };
    if (!payload.stt || !payload.name || Number.isNaN(payload.sortOrder)) {
      showToast('Cần điền STT, thứ tự sắp xếp và tên trạm', 'error');
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await axios.patch(`${API_URL}/${editing.id}`, payload);
        showToast('Đã cập nhật trạm');
      } else {
        await axios.post(API_URL, payload);
        showToast('Đã thêm trạm');
      }
      resetForm();
      await load();
    } catch (e) {
      showToast(e.response?.data?.error || 'Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s) => {
    try {
      await axios.patch(`${API_URL}/${s.id}`, { isActive: !s.isActive });
      await load();
    } catch (e) {
      showToast('Đổi trạng thái thất bại', 'error');
    }
  };

  const remove = async (s) => {
    if (!window.confirm(`Xóa trạm "${s.name}"? Không khôi phục được.`)) return;
    try {
      await axios.delete(`${API_URL}/${s.id}`);
      showToast('Đã xóa trạm');
      await load();
    } catch (e) {
      showToast(e.response?.data?.error || 'Xóa thất bại', 'error');
    }
  };

  const filtered = useMemo(() => {
    const q = norm(search).trim();
    if (!q) return stations;
    return stations.filter(s =>
      norm(s.name).includes(q) ||
      String(s.stt).includes(q) ||
      (s.aliases || []).some(a => norm(a).includes(q))
    );
  }, [stations, search]);

  const totalAliases = useMemo(
    () => stations.reduce((t, s) => t + ((s.aliases || []).length), 0),
    [stations]
  );

  return (
    <div className="max-w-5xl mx-auto">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý trạm đón dọc đường &amp; từ viết tắt</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách trạm dùng chung cho cả 2 tuyến và cho auto-booking Nhập Hàng → Tổng Hợp.
          Bí danh (từ viết tắt) giúp tự nhận trạm, ví dụ ghi "minh tco 1 thùng" sẽ tự nhận trạm <strong>Trà Cổ</strong>.
          Hệ thống tự đảo thứ tự khi xem tuyến Long Khánh → Sài Gòn.
        </p>

        {/* Đảo chiều */}
        <div className="inline-flex bg-gray-100 rounded-md p-1 mt-4 text-sm">
          <button
            onClick={() => setDirection('sg-lk')}
            className={`px-3 py-1.5 rounded ${direction === 'sg-lk' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-600'}`}
          >
            Sài Gòn → Long Khánh
          </button>
          <button
            onClick={() => setDirection('lk-sg')}
            className={`px-3 py-1.5 rounded ${direction === 'lk-sg' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-600'}`}
          >
            Long Khánh → Sài Gòn
          </button>
        </div>
      </div>

      {/* Form thêm/sửa */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">STT hiển thị</label>
          <input type="text" value={form.stt} onChange={e => setForm(f => ({ ...f, stt: e.target.value }))}
            placeholder="vd. 7.1" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Thứ tự sắp xếp</label>
          <input type="number" step="0.01" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
            placeholder="vd. 7.1" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Tên trạm</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="vd. Bưu điện Trảng Bom" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Bí danh / viết tắt (cách nhau bằng dấu phẩy)</label>
          <input type="text" value={form.aliasesText} onChange={e => setForm(f => ({ ...f, aliasesText: e.target.value }))}
            placeholder="bd tbom, tbom" className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded outline-none focus:ring-2 focus:ring-sky-500" />
        </div>
        <div className="md:col-span-12 flex items-center gap-2">
          <button type="submit" disabled={saving} className="px-4 py-1.5 text-sm bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50">
            {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm trạm'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">Hủy</button>
          )}
        </div>
      </form>

      {/* Bảng */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên trạm / STT / viết tắt..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500" />
          <span className="text-sm text-gray-500 whitespace-nowrap">{filtered.length}/{stations.length} trạm · {totalAliases} viết tắt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 w-20">STT</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 w-16">Sort</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Tên trạm</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Bí danh / viết tắt</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 w-24">Trạng thái</th>
                <th className="px-3 py-2 text-right font-semibold text-gray-700 w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Đang tải...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Không có trạm phù hợp</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className={`border-b border-gray-100 ${!s.isActive ? 'bg-gray-50 text-gray-400' : 'hover:bg-sky-50/40'}`}>
                    <td className="px-3 py-2 font-mono font-semibold">{s.displayStt}</td>
                    <td className="px-3 py-2 text-gray-400">{s.sortOrder}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{s.name}</td>
                    <td className="px-3 py-2 text-xs text-gray-600">{(s.aliases || []).join(', ') || <span className="text-gray-300 italic">Chưa có</span>}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => toggleActive(s)}
                        className={`text-xs px-2 py-0.5 rounded ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {s.isActive ? 'Hoạt động' : 'Tắt'}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <button onClick={() => startEdit(s)} className="text-xs text-sky-700 hover:underline mr-3">Sửa</button>
                      <button onClick={() => remove(s)} className="text-xs text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StationAliasPage;
