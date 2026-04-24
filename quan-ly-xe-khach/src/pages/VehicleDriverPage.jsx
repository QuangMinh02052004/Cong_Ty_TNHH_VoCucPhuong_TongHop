import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import ToastNotification from '../components/ToastNotification';

const API_URL = '/api/tong-hop';

// Format biển số: "51b23033" → "51B-23033"
const formatPlate = (input) => {
  if (!input) return '';
  const clean = input.replace(/[\s\-]/g, '').toUpperCase();
  const match = clean.match(/^(\d{2}[A-Z]{1,2})(\d+)$/);
  if (match) return `${match[1]}-${match[2]}`;
  return clean;
};

// Normalize để tìm kiếm (bỏ gạch ngang, uppercase)
const norm = (str) => (str || '').replace(/[\s\-]/g, '').toUpperCase();

const VehicleDriverPage = () => {
  const [tab, setTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState(null);

  // Vehicle form
  const [vehicleForm, setVehicleForm] = useState({ plate: '' });
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Driver form
  const [driverForm, setDriverForm] = useState({ name: '', phone: '' });
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [driverSearch, setDriverSearch] = useState('');

  // Import Excel
  const vehicleFileRef = useRef(null);
  const driverFileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null); // { type, rows }
  const [importing, setImporting] = useState(false);

  const showMsg = (msg, isError = false) => {
    if (isError) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
    setToast({ message: msg, type: isError ? 'error' : 'success' });
  };

  const loadVehicles = async () => {
    const res = await axios.get(`${API_URL}/vehicles`);
    setVehicles(res.data || []);
  };
  const loadDrivers = async () => {
    const res = await axios.get(`${API_URL}/drivers`);
    setDrivers(res.data || []);
  };

  useEffect(() => { loadVehicles(); loadDrivers(); }, []);

  // ---- Vehicles ----
  const isDuplicatePlate = (plate, excludeId = null) => {
    return vehicles.some(v => norm(v.type || v.code) === norm(plate) && v.id !== excludeId);
  };

  const handleSaveVehicle = async () => {
    const raw = vehicleForm.plate.trim();
    if (!raw) { showMsg('Vui lòng nhập biển số xe', true); return; }
    const plate = formatPlate(raw);
    if (isDuplicatePlate(plate, editingVehicleId)) {
      showMsg(`Biển số "${plate}" đã tồn tại!`, true); return;
    }
    setLoading(true);
    try {
      if (editingVehicleId) {
        await axios.put(`${API_URL}/vehicles/${editingVehicleId}`, { code: plate, type: plate });
        showMsg('Đã cập nhật biển số xe');
      } else {
        await axios.post(`${API_URL}/vehicles`, { code: plate, type: plate });
        showMsg(`Đã thêm xe ${plate}`);
      }
      setVehicleForm({ plate: '' });
      setEditingVehicleId(null);
      await loadVehicles();
    } catch (e) {
      showMsg(e.response?.data?.error || 'Lỗi lưu xe', true);
    } finally { setLoading(false); }
  };

  const handleEditVehicle = (v) => {
    setEditingVehicleId(v.id);
    setVehicleForm({ plate: v.type || v.code || '' });
    setError(''); setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteVehicle = async (id, plate) => {
    if (!window.confirm(`Xóa xe "${plate}"?`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/vehicles/${id}`);
      showMsg('Đã xóa xe');
      await loadVehicles();
    } catch (e) { showMsg('Lỗi xóa xe', true); }
    finally { setLoading(false); }
  };

  const cancelVehicleEdit = () => { setEditingVehicleId(null); setVehicleForm({ plate: '' }); };

  // ---- Drivers ----
  const isDuplicateDriver = (name, excludeId = null) => {
    return drivers.some(d => d.name.trim().toLowerCase() === name.trim().toLowerCase() && d.id !== excludeId);
  };

  const handleSaveDriver = async () => {
    const name = driverForm.name.trim();
    const phone = driverForm.phone.trim();
    if (!name) { showMsg('Vui lòng nhập tên tài xế', true); return; }
    if (isDuplicateDriver(name, editingDriverId)) {
      showMsg(`Tài xế "${name}" đã tồn tại!`, true); return;
    }
    setLoading(true);
    try {
      if (editingDriverId) {
        await axios.put(`${API_URL}/drivers/${editingDriverId}`, { name, phone });
        showMsg('Đã cập nhật tài xế');
      } else {
        await axios.post(`${API_URL}/drivers`, { name, phone });
        showMsg(`Đã thêm tài xế ${name}`);
      }
      setDriverForm({ name: '', phone: '' });
      setEditingDriverId(null);
      await loadDrivers();
    } catch (e) {
      showMsg(e.response?.data?.error || 'Lỗi lưu tài xế', true);
    } finally { setLoading(false); }
  };

  const handleEditDriver = (d) => {
    setEditingDriverId(d.id);
    setDriverForm({ name: d.name || '', phone: d.phone || '' });
    setError(''); setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDriver = async (id, name) => {
    if (!window.confirm(`Xóa tài xế "${name}"?`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/drivers/${id}`);
      showMsg('Đã xóa tài xế');
      await loadDrivers();
    } catch (e) { showMsg('Lỗi xóa tài xế', true); }
    finally { setLoading(false); }
  };

  const cancelDriverEdit = () => { setEditingDriverId(null); setDriverForm({ name: '', phone: '' }); };

  // ---- Excel Import ----
  // Import 1 sheet cụ thể
  const handleExcelFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });

      // Nếu file có 2+ sheet: tìm sheet theo tên hoặc theo thứ tự
      const sheetNames = wb.SheetNames;
      let sheetName = sheetNames[0];
      if (type === 'vehicles') {
        sheetName = sheetNames.find(n => /biển|bien|xe|vehicle/i.test(n)) || sheetNames[0];
      } else {
        sheetName = sheetNames.find(n => /tài|tai|driver/i.test(n)) || sheetNames[Math.min(1, sheetNames.length - 1)];
      }

      const ws = wb.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      const rows = data.slice(1).filter(r => r[0] || r[1]);
      setImportPreview({ type, rows, file: file.name, sheetName });
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Import file có 2 sheet (xe + tài xế)
  const handleExcelFileBoth = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const sheetNames = wb.SheetNames;

      const vehicleSheet = sheetNames.find(n => /biển|bien|xe|vehicle/i.test(n)) || sheetNames[0];
      const driverSheet = sheetNames.find(n => /tài|tai|driver/i.test(n)) || sheetNames[Math.min(1, sheetNames.length - 1)];

      const vehicleData = XLSX.utils.sheet_to_json(wb.Sheets[vehicleSheet], { header: 1, defval: '' });
      const driverData = XLSX.utils.sheet_to_json(wb.Sheets[driverSheet], { header: 1, defval: '' });

      const vehicleRows = vehicleData.slice(1).filter(r => r[0]);
      const driverRows = driverData.slice(1).filter(r => r[0]);

      setImportPreview({
        type: 'both',
        vehicleRows, driverRows,
        file: file.name,
        vehicleSheet, driverSheet
      });
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const bothFileRef = useRef(null);

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setImporting(true);
    let addedV = 0, skippedV = 0, addedD = 0, skippedD = 0;
    try {
      const processVehicles = async (rows) => {
        for (const row of rows) {
          const plate = formatPlate(String(row[0] || '').trim());
          if (!plate) { skippedV++; continue; }
          if (isDuplicatePlate(plate)) { skippedV++; continue; }
          await axios.post(`${API_URL}/vehicles`, { code: plate, type: plate });
          addedV++;
        }
      };
      const processDrivers = async (rows) => {
        for (const row of rows) {
          const name = String(row[0] || '').trim();
          const phone = String(row[1] || '').trim();
          if (!name) { skippedD++; continue; }
          if (isDuplicateDriver(name)) { skippedD++; continue; }
          await axios.post(`${API_URL}/drivers`, { name, phone });
          addedD++;
        }
      };

      if (importPreview.type === 'vehicles') {
        await processVehicles(importPreview.rows);
        await loadVehicles();
        showMsg(`Import xong: thêm ${addedV} xe, bỏ qua ${skippedV} trùng/rỗng`);
      } else if (importPreview.type === 'drivers') {
        await processDrivers(importPreview.rows);
        await loadDrivers();
        showMsg(`Import xong: thêm ${addedD} tài xế, bỏ qua ${skippedD} trùng/rỗng`);
      } else if (importPreview.type === 'both') {
        await processVehicles(importPreview.vehicleRows);
        await processDrivers(importPreview.driverRows);
        await loadVehicles();
        await loadDrivers();
        showMsg(`Import xong: ${addedV} xe (bỏ ${skippedV} trùng), ${addedD} tài xế (bỏ ${skippedD} trùng)`);
      }
    } catch (e) {
      showMsg('Lỗi import: ' + e.message, true);
    } finally {
      setImporting(false);
      setImportPreview(null);
    }
  };

  // Filtered lists
  const filteredVehicles = vehicles.filter(v =>
    !vehicleSearch || norm(v.type || v.code || '').includes(norm(vehicleSearch))
  );
  const filteredDrivers = drivers.filter(d =>
    !driverSearch || d.name.toLowerCase().includes(driverSearch.toLowerCase()) || (d.phone || '').includes(driverSearch)
  );

  // Preview formatted plate while typing
  const platePreview = vehicleForm.plate.trim() ? formatPlate(vehicleForm.plate) : null;
  const plateChanged = platePreview && platePreview !== vehicleForm.plate.trim().toUpperCase().replace(/[\s]/g, '');

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Xe &amp; Tài xế</h1>
          <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xóa — hoặc import từ file Excel</p>
        </div>
        <div>
          <input ref={bothFileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={handleExcelFileBoth} />
          <button onClick={() => bothFileRef.current?.click()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition shadow-sm whitespace-nowrap">
            📥 Import 1 file (2 sheet)
          </button>
          <p className="text-xs text-gray-400 mt-1 text-right">Sheet 1: Biển số · Sheet 2: Tài xế</p>
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">{error}</div>}
      {success && <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600 text-sm font-medium">{success}</div>}

      {/* Import Preview Modal */}
      {importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setImportPreview(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-5" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-1">Xem trước import</h3>
            <p className="text-xs text-gray-400 mb-3">
              File: <strong>{importPreview.file}</strong>
              {importPreview.type === 'both'
                ? ` — Sheet xe: "${importPreview.vehicleSheet}" (${importPreview.vehicleRows.length} dòng), Sheet tài xế: "${importPreview.driverSheet}" (${importPreview.driverRows.length} dòng)`
                : ` — ${importPreview.rows?.length} dòng · Sheet: "${importPreview.sheetName}"`}
            </p>

            {importPreview.type === 'both' ? (
              <div className="flex gap-3 mb-4">
                {/* Xe */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-700 mb-1">🚌 Biển số xe</p>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0"><tr><th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-500">Biển số</th></tr></thead>
                      <tbody>
                        {importPreview.vehicleRows.map((row, i) => {
                          const plate = formatPlate(String(row[0] || ''));
                          const isDup = isDuplicatePlate(plate);
                          return <tr key={i} className={`border-t border-gray-100 ${isDup ? 'bg-red-50' : ''}`}>
                            <td className="px-2 py-1 font-mono font-medium text-xs">{plate}{isDup && <span className="ml-1 text-red-500">(trùng)</span>}</td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Tài xế */}
                <div className="flex-1">
                  <p className="text-xs font-semibold text-sky-700 mb-1">👤 Tài xế</p>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0"><tr><th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-500">Tên</th><th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-500">SĐT</th></tr></thead>
                      <tbody>
                        {importPreview.driverRows.map((row, i) => {
                          const isDup = isDuplicateDriver(String(row[0] || ''));
                          return <tr key={i} className={`border-t border-gray-100 ${isDup ? 'bg-red-50' : ''}`}>
                            <td className="px-2 py-1 font-medium text-xs">{row[0]}{isDup && <span className="ml-1 text-red-500">(trùng)</span>}</td>
                            <td className="px-2 py-1 text-gray-500 text-xs">{row[1]}</td>
                          </tr>;
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {importPreview.type === 'vehicles'
                        ? <th className="px-3 py-2 text-left font-semibold text-gray-600">Biển số</th>
                        : <><th className="px-3 py-2 text-left font-semibold text-gray-600">Tên</th><th className="px-3 py-2 text-left font-semibold text-gray-600">SĐT</th></>}
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.rows.map((row, i) => {
                      const isDup = importPreview.type === 'vehicles'
                        ? isDuplicatePlate(formatPlate(String(row[0] || '')))
                        : isDuplicateDriver(String(row[0] || ''));
                      return (
                        <tr key={i} className={`border-t border-gray-100 ${isDup ? 'bg-red-50' : ''}`}>
                          {importPreview.type === 'vehicles'
                            ? <td className="px-3 py-1.5 font-mono font-medium">{formatPlate(String(row[0] || ''))}{isDup && <span className="ml-2 text-xs text-red-500">(trùng)</span>}</td>
                            : <><td className="px-3 py-1.5 font-medium">{row[0]}{isDup && <span className="ml-2 text-xs text-red-500">(trùng)</span>}</td><td className="px-3 py-1.5 text-gray-500">{row[1]}</td></>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleConfirmImport} disabled={importing}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition disabled:opacity-50">
                {importing ? 'Đang import...' : 'Xác nhận import'}
              </button>
              <button onClick={() => setImportPreview(null)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => { setTab('vehicles'); cancelDriverEdit(); cancelVehicleEdit(); }}
          className={`px-6 py-3 font-semibold text-sm transition border-b-2 -mb-px ${tab === 'vehicles' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          🚌 Biển số xe <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{vehicles.length}</span>
        </button>
        <button onClick={() => { setTab('drivers'); cancelVehicleEdit(); cancelDriverEdit(); }}
          className={`px-6 py-3 font-semibold text-sm transition border-b-2 -mb-px ${tab === 'drivers' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          👤 Tài xế <span className="ml-1 text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full">{drivers.length}</span>
        </button>
      </div>

      {/* ===== TAB XE ===== */}
      {tab === 'vehicles' && (
        <div>
          {/* Form thêm/sửa */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
            <h2 className="font-semibold text-gray-700 mb-4 text-base">
              {editingVehicleId ? '✏️ Sửa biển số xe' : '➕ Thêm xe mới'}
            </h2>
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base font-mono font-medium outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition uppercase"
                  placeholder="VD: 51B23033"
                  value={vehicleForm.plate}
                  onChange={e => setVehicleForm({ plate: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSaveVehicle()}
                />
                {platePreview && plateChanged && (
                  <p className="text-xs text-amber-600 mt-1">
                    → Sẽ lưu: <strong>{platePreview}</strong>
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-7">
                <button onClick={handleSaveVehicle} disabled={loading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition disabled:opacity-50 whitespace-nowrap">
                  {editingVehicleId ? 'Cập nhật' : 'Thêm xe'}
                </button>
                {editingVehicleId && (
                  <button onClick={cancelVehicleEdit}
                    className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách xe + search + import */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <span className="font-semibold text-gray-700 whitespace-nowrap">Danh sách ({filteredVehicles.length}/{vehicles.length})</span>
              <input
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-amber-400 transition"
                placeholder="Tìm biển số..."
                value={vehicleSearch}
                onChange={e => setVehicleSearch(e.target.value)}
              />
              <input ref={vehicleFileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={e => handleExcelFile(e, 'vehicles')} />
              <button onClick={() => vehicleFileRef.current?.click()}
                className="px-3 py-1.5 text-sm text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition whitespace-nowrap font-medium">
                📥 Import Excel
              </button>
            </div>
            {filteredVehicles.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <p className="text-3xl mb-2">🚌</p>
                <p className="text-sm">{vehicleSearch ? 'Không tìm thấy biển số phù hợp' : 'Chưa có xe nào'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-5 py-3 text-left font-semibold w-12">STT</th>
                    <th className="px-5 py-3 text-left font-semibold">Mã tỉnh</th>
                    <th className="px-5 py-3 text-left font-semibold">Số xe</th>
                    <th className="px-5 py-3 text-left font-semibold">Biển đầy đủ</th>
                    <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v, idx) => {
                    const plate = formatPlate(v.type || v.code || '');
                    const parts = plate.split('-');
                    const provinceCode = parts[0] || plate;
                    const plateNum = parts[1] || '';
                    return (
                      <tr key={v.id} className={`border-t border-gray-100 hover:bg-amber-50/40 transition ${editingVehicleId === v.id ? 'bg-amber-50' : ''}`}>
                        <td className="px-5 py-3.5 text-sm text-gray-400">{idx + 1}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-block bg-amber-100 text-amber-800 font-bold text-sm px-2 py-0.5 rounded">{provinceCode}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-gray-700 text-base">{plateNum || '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-gray-800 text-base tracking-wide">{plate}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => handleEditVehicle(v)}
                            className="text-sm px-3 py-1.5 text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition mr-2">
                            Sửa
                          </button>
                          <button onClick={() => handleDeleteVehicle(v.id, plate)}
                            className="text-sm px-3 py-1.5 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition">
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              Format Excel nhập xe: cột A = Biển số (VD: 51B23033)
            </div>
          </div>
        </div>
      )}

      {/* ===== TAB TÀI XẾ ===== */}
      {tab === 'drivers' && (
        <div>
          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
            <h2 className="font-semibold text-gray-700 mb-4 text-base">
              {editingDriverId ? '✏️ Sửa thông tin tài xế' : '➕ Thêm tài xế mới'}
            </h2>
            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Tên tài xế <span className="text-red-500">*</span></label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                  placeholder="VD: Nguyễn Văn A"
                  value={driverForm.name}
                  onChange={e => setDriverForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSaveDriver()}
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Số điện thoại</label>
                <input
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition"
                  placeholder="VD: 0901234567"
                  value={driverForm.phone}
                  onChange={e => setDriverForm(f => ({ ...f, phone: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSaveDriver()}
                />
              </div>
              <button onClick={handleSaveDriver} disabled={loading}
                className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition disabled:opacity-50 whitespace-nowrap">
                {editingDriverId ? 'Cập nhật' : 'Thêm tài xế'}
              </button>
              {editingDriverId && (
                <button onClick={cancelDriverEdit}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition">
                  Hủy
                </button>
              )}
            </div>
          </div>

          {/* Danh sách tài xế + search + import */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <span className="font-semibold text-gray-700 whitespace-nowrap">Danh sách ({filteredDrivers.length}/{drivers.length})</span>
              <input
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-400 transition"
                placeholder="Tìm tên hoặc SĐT..."
                value={driverSearch}
                onChange={e => setDriverSearch(e.target.value)}
              />
              <input ref={driverFileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={e => handleExcelFile(e, 'drivers')} />
              <button onClick={() => driverFileRef.current?.click()}
                className="px-3 py-1.5 text-sm text-emerald-600 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition whitespace-nowrap font-medium">
                📥 Import Excel
              </button>
            </div>
            {filteredDrivers.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <p className="text-3xl mb-2">👤</p>
                <p className="text-sm">{driverSearch ? 'Không tìm thấy tài xế phù hợp' : 'Chưa có tài xế nào'}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-5 py-3 text-left font-semibold w-12">STT</th>
                    <th className="px-5 py-3 text-left font-semibold">Tên tài xế</th>
                    <th className="px-5 py-3 text-left font-semibold">Số điện thoại</th>
                    <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((d, idx) => (
                    <tr key={d.id} className={`border-t border-gray-100 hover:bg-sky-50/40 transition ${editingDriverId === d.id ? 'bg-sky-50' : ''}`}>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-800 text-base">{d.name}</td>
                      <td className="px-5 py-3.5 text-gray-600">{d.phone || <span className="text-gray-300 italic text-sm">Chưa có</span>}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => handleEditDriver(d)}
                          className="text-sm px-3 py-1.5 text-sky-600 border border-sky-300 rounded-lg hover:bg-sky-50 transition mr-2">
                          Sửa
                        </button>
                        <button onClick={() => handleDeleteDriver(d.id, d.name)}
                          className="text-sm px-3 py-1.5 text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              Format Excel nhập tài xế: cột A = Tên, cột B = Số điện thoại
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDriverPage;
