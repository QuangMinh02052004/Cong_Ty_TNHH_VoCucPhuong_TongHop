import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ToastNotification from './ToastNotification';

const API_URL = '/api/tong-hop';

const VehicleDriverManagement = ({ onClose }) => {
  const [tab, setTab] = useState('vehicles'); // 'vehicles' | 'drivers'
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [vehicleForm, setVehicleForm] = useState({ code: '', type: '' });
  const [driverForm, setDriverForm] = useState({ name: '', phone: '' });
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [editingDriverId, setEditingDriverId] = useState(null);
  const [error, setError] = useState('');

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const loadVehicles = async () => {
    const res = await axios.get(`${API_URL}/vehicles`);
    setVehicles(res.data || []);
  };
  const loadDrivers = async () => {
    const res = await axios.get(`${API_URL}/drivers`);
    setDrivers(res.data || []);
  };

  useEffect(() => {
    loadVehicles();
    loadDrivers();
  }, []);

  // --- Vehicles ---
  const handleSaveVehicle = async () => {
    const plate = vehicleForm.type.trim();
    const code = vehicleForm.code.trim();
    if (!plate) { setError('Vui lòng nhập biển số xe'); return; }
    setLoading(true); setError('');
    try {
      if (editingVehicleId) {
        await axios.put(`${API_URL}/vehicles/${editingVehicleId}`, { code, type: plate });
        showToast(`Đã cập nhật xe ${plate}${code ? ` (${code})` : ''}`, 'success');
      } else {
        await axios.post(`${API_URL}/vehicles`, { code, type: plate });
        showToast(`Đã thêm xe ${plate}${code ? ` (${code})` : ''}`, 'success');
      }
      setVehicleForm({ code: '', type: '' });
      setEditingVehicleId(null);
      await loadVehicles();
    } catch (e) {
      setError(e.response?.data?.error || 'Lỗi lưu xe');
      showToast('Lỗi lưu thông tin xe', 'error');
    } finally { setLoading(false); }
  };

  const handleEditVehicle = (v) => {
    setEditingVehicleId(v.id);
    setVehicleForm({ code: v.code || '', type: v.type || '' });
    setError('');
  };

  const handleDeleteVehicle = async (id, plate) => {
    if (!window.confirm(`Xóa xe ${plate}?`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/vehicles/${id}`);
      showToast(`Đã xóa xe ${plate}`, 'warning');
      await loadVehicles();
    } catch (e) {
      showToast('Lỗi xóa xe', 'error');
    } finally { setLoading(false); }
  };

  // --- Drivers ---
  const handleSaveDriver = async () => {
    const name = driverForm.name.trim();
    const phone = driverForm.phone.trim();
    if (!name) { setError('Vui lòng nhập tên tài xế'); return; }
    setLoading(true); setError('');
    try {
      if (editingDriverId) {
        await axios.put(`${API_URL}/drivers/${editingDriverId}`, { name, phone });
        showToast(`Đã cập nhật tài xế ${name}${phone ? ` — ${phone}` : ''}`, 'success');
      } else {
        await axios.post(`${API_URL}/drivers`, { name, phone });
        showToast(`Đã thêm tài xế ${name}${phone ? ` — ${phone}` : ''}`, 'success');
      }
      setDriverForm({ name: '', phone: '' });
      setEditingDriverId(null);
      await loadDrivers();
    } catch (e) {
      setError(e.response?.data?.error || 'Lỗi lưu tài xế');
      showToast('Lỗi lưu thông tin tài xế', 'error');
    } finally { setLoading(false); }
  };

  const handleEditDriver = (d) => {
    setEditingDriverId(d.id);
    setDriverForm({ name: d.name || '', phone: d.phone || '' });
    setError('');
  };

  const handleDeleteDriver = async (id, name) => {
    if (!window.confirm(`Xóa tài xế ${name}?`)) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/drivers/${id}`);
      showToast(`Đã xóa tài xế ${name}`, 'warning');
      await loadDrivers();
    } catch (e) {
      showToast('Lỗi xóa tài xế', 'error');
    } finally { setLoading(false); }
  };

  const cancelEdit = () => {
    setEditingVehicleId(null);
    setEditingDriverId(null);
    setVehicleForm({ code: '', type: '' });
    setDriverForm({ name: '', phone: '' });
    setError('');
  };

  return (
    <>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-800 text-lg">Quản lý xe &amp; tài xế</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setTab('vehicles'); cancelEdit(); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'vehicles' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Biển số xe ({vehicles.length})
            </button>
            <button
              onClick={() => { setTab('drivers'); cancelEdit(); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'drivers' ? 'border-b-2 border-sky-500 text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tài xế ({drivers.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded">{error}</p>}

            {tab === 'vehicles' && (
              <div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-amber-700 mb-2">{editingVehicleId ? 'Sửa xe' : 'Thêm xe mới'}</p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-0.5 block">Biển số <span className="text-red-500">*</span></label>
                      <input
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-amber-400"
                        placeholder="VD: 51B26879"
                        value={vehicleForm.type}
                        onChange={e => setVehicleForm(f => ({ ...f, type: e.target.value }))}
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-gray-600 mb-0.5 block">Mã xe</label>
                      <input
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-amber-400"
                        placeholder="VD: 28G"
                        value={vehicleForm.code}
                        onChange={e => setVehicleForm(f => ({ ...f, code: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveVehicle}
                      disabled={loading}
                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded transition disabled:opacity-50"
                    >
                      {editingVehicleId ? 'Cập nhật' : 'Thêm xe'}
                    </button>
                    {editingVehicleId && (
                      <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Hủy</button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {vehicles.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có xe nào</p>}
                  {vehicles.map(v => (
                    <div key={v.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${editingVehicleId === v.id ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} transition`}>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-800 text-sm">{v.type || '—'}</span>
                        {v.code && <span className="text-xs text-gray-400 ml-2">({v.code})</span>}
                      </div>
                      <button onClick={() => handleEditVehicle(v)} className="text-xs px-2 py-1 text-amber-600 border border-amber-300 rounded hover:bg-amber-50">Sửa</button>
                      <button onClick={() => handleDeleteVehicle(v.id, v.type)} className="text-xs px-2 py-1 text-red-500 border border-red-300 rounded hover:bg-red-50">Xóa</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'drivers' && (
              <div>
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-semibold text-sky-700 mb-2">{editingDriverId ? 'Sửa tài xế' : 'Thêm tài xế mới'}</p>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-0.5 block">Tên tài xế <span className="text-red-500">*</span></label>
                      <input
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-sky-400"
                        placeholder="VD: Nguyễn Văn A"
                        value={driverForm.name}
                        onChange={e => setDriverForm(f => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 mb-0.5 block">Số điện thoại</label>
                      <input
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-sky-400"
                        placeholder="VD: 0901234567"
                        value={driverForm.phone}
                        onChange={e => setDriverForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDriver}
                      disabled={loading}
                      className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold rounded transition disabled:opacity-50"
                    >
                      {editingDriverId ? 'Cập nhật' : 'Thêm tài xế'}
                    </button>
                    {editingDriverId && (
                      <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Hủy</button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {drivers.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Chưa có tài xế nào</p>}
                  {drivers.map(d => (
                    <div key={d.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${editingDriverId === d.id ? 'border-sky-400 bg-sky-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'} transition`}>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-800 text-sm">{d.name}</span>
                        {d.phone && <span className="text-xs text-gray-400 ml-2">{d.phone}</span>}
                      </div>
                      <button onClick={() => handleEditDriver(d)} className="text-xs px-2 py-1 text-sky-600 border border-sky-300 rounded hover:bg-sky-50">Sửa</button>
                      <button onClick={() => handleDeleteDriver(d.id, d.name)} className="text-xs px-2 py-1 text-red-500 border border-red-300 rounded hover:bg-red-50">Xóa</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleDriverManagement;
