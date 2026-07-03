import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ToastNotification from '../components/ToastNotification';

// API NhapHang (cùng domain vocucphuongmanage.vercel.app)
const API_URL = '/api/nhap-hang/station-aliases';

// Bỏ dấu để lọc tìm kiếm không phân biệt dấu
const norm = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

const StationAliasPage = () => {
  const [stations, setStations] = useState([]);   // [{stt,name,aliases}]
  const [drafts, setDrafts] = useState({});        // stt -> aliases[] (bản nháp đang sửa)
  const [newAlias, setNewAlias] = useState({});    // stt -> chuỗi đang gõ thêm
  const [savingStt, setSavingStt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const load = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      const data = res.data?.data || [];
      setStations(data);
      const d = {};
      data.forEach(s => { d[s.stt] = [...(s.aliases || [])]; });
      setDrafts(d);
    } catch (e) {
      showToast('Không tải được danh sách viết tắt', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addAlias = (stt) => {
    const raw = (newAlias[stt] || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (!raw) return;
    setDrafts(prev => {
      const cur = prev[stt] || [];
      if (cur.includes(raw)) return prev;
      return { ...prev, [stt]: [...cur, raw] };
    });
    setNewAlias(prev => ({ ...prev, [stt]: '' }));
  };

  const removeAlias = (stt, alias) => {
    setDrafts(prev => ({ ...prev, [stt]: (prev[stt] || []).filter(a => a !== alias) }));
  };

  const isDirty = (s) => {
    const a = drafts[s.stt] || [];
    const b = s.aliases || [];
    return a.length !== b.length || a.some((x, i) => x !== b[i]);
  };

  const save = async (s) => {
    try {
      setSavingStt(s.stt);
      const aliases = drafts[s.stt] || [];
      const res = await axios.put(API_URL, { stt: s.stt, aliases });
      const saved = res.data?.data;
      setStations(prev => prev.map(x => x.stt === s.stt ? { ...x, aliases: saved?.aliases || aliases } : x));
      setDrafts(prev => ({ ...prev, [s.stt]: [...(saved?.aliases || aliases)] }));
      showToast(`Đã lưu viết tắt cho "${s.name}"`);
    } catch (e) {
      showToast('Lưu thất bại', 'error');
    } finally {
      setSavingStt(null);
    }
  };

  const filtered = useMemo(() => {
    const q = norm(search).trim();
    if (!q) return stations;
    return stations.filter(s =>
      norm(s.name).includes(q) ||
      String(s.stt).includes(q) ||
      (drafts[s.stt] || []).some(a => norm(a).includes(q))
    );
  }, [stations, drafts, search]);

  const totalAliases = useMemo(
    () => Object.values(drafts).reduce((t, arr) => t + (arr?.length || 0), 0),
    [drafts]
  );

  return (
    <div className="max-w-4xl mx-auto">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý từ viết tắt</h1>
        <p className="text-sm text-gray-500 mt-1">
          Từ viết tắt dùng để tự động điền trạm nhận khi auto-booking đơn Nhập Hàng sang Tổng Hợp.
          Ví dụ ghi "minh tco 1 thùng" sẽ tự nhận trạm <strong>Trà Cổ</strong>.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên trạm / STT / từ viết tắt..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filtered.length}/{stations.length} trạm · {totalAliases} viết tắt
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Đang tải...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const aliases = drafts[s.stt] || [];
            const dirty = isDirty(s);
            return (
              <div key={s.stt} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <span className="inline-block bg-sky-100 text-sky-700 font-bold text-xs px-2 py-0.5 rounded mr-2">
                      {String(s.stt).padStart(2, '0')}
                    </span>
                    <span className="font-semibold text-gray-800">{s.name}</span>
                  </div>
                  <button
                    onClick={() => save(s)}
                    disabled={!dirty || savingStt === s.stt}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition whitespace-nowrap ${
                      dirty
                        ? 'bg-sky-500 hover:bg-sky-600 text-white'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {savingStt === s.stt ? 'Đang lưu...' : dirty ? 'Lưu' : 'Đã lưu'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {aliases.length === 0 && (
                    <span className="text-sm text-gray-400 italic">Chưa có từ viết tắt</span>
                  )}
                  {aliases.map(a => (
                    <span key={a} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-2.5 py-1 rounded-full">
                      {a}
                      <button
                        onClick={() => removeAlias(s.stt, a)}
                        className="text-gray-400 hover:text-red-500 font-bold leading-none"
                        title="Xóa"
                      >×</button>
                    </span>
                  ))}
                  <input
                    value={newAlias[s.stt] || ''}
                    onChange={e => setNewAlias(prev => ({ ...prev, [s.stt]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAlias(s.stt); } }}
                    placeholder="+ thêm viết tắt rồi Enter"
                    className="px-2.5 py-1 border border-gray-300 rounded-full text-sm outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 w-52"
                  />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              Không tìm thấy trạm phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StationAliasPage;
