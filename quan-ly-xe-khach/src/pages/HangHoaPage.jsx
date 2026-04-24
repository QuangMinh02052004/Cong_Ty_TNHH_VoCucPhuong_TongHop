import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api/tong-hop';

// Danh sách biển số xe (đồng bộ với NhapHang)
const VEHICLE_LIST = [
  "01031","01057","01374","01785","04145","04424","04466","04564",
  "04627","04647","04650","04668","04669","04671","05296","05307",
  "05352","05480","23033","23831","26018","26025","26030","26186",
  "26411","26542","26879","27452","27642","27683","26165","27795",
  "31437","31935","87497","04103","49642","T15026","T32309"
];

const HangHoaPage = () => {
  const [activeTab, setActiveTab] = useState('homnay'); // 'homnay' | 'tongquan' | 'theoxe'

  // Today's freight
  const [todayList, setTodayList] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [todayLoading, setTodayLoading] = useState(false);

  // All freight (tổng quan)
  const [allList, setAllList] = useState([]);
  const [allStats, setAllStats] = useState(null);
  const [allLoading, setAllLoading] = useState(false);
  const [allFilters, setAllFilters] = useState({ status: '', fromDate: '', toDate: '' });

  // Vehicle freight
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleDate, setVehicleDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleData, setVehicleData] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [expandedVehicle, setExpandedVehicle] = useState(null);

  const getAuthToken = () => localStorage.getItem('token');
  const getAxiosConfig = () => ({ headers: { Authorization: `Bearer ${getAuthToken()}` } });
  const todayISO = new Date().toISOString().split('T')[0];

  // === Load today's data ===
  const loadToday = async () => {
    try {
      setTodayLoading(true);
      const [listRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/freight?fromDate=${todayISO}&toDate=${todayISO}`, getAxiosConfig()),
        axios.get(`${API_URL}/freight/stats?fromDate=${todayISO}&toDate=${todayISO}`, getAxiosConfig()),
      ]);
      const data = Array.isArray(listRes.data) ? listRes.data : (listRes.data.data || []);
      setTodayList(data);
      setTodayStats(statsRes.data);
    } catch (error) {
      console.error('Lỗi tải dữ liệu hôm nay:', error);
      setTodayList([]);
    } finally {
      setTodayLoading(false);
    }
  };

  // === Load all data (tổng quan) ===
  const loadAll = async () => {
    try {
      setAllLoading(true);
      const params = new URLSearchParams();
      if (allFilters.status) params.append('status', allFilters.status);
      if (allFilters.fromDate) params.append('fromDate', allFilters.fromDate);
      if (allFilters.toDate) params.append('toDate', allFilters.toDate);

      const statsParams = new URLSearchParams();
      if (allFilters.fromDate) statsParams.append('fromDate', allFilters.fromDate);
      if (allFilters.toDate) statsParams.append('toDate', allFilters.toDate);

      const [listRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/freight?${params.toString()}`, getAxiosConfig()),
        axios.get(`${API_URL}/freight/stats?${statsParams.toString()}`, getAxiosConfig()),
      ]);
      const data = Array.isArray(listRes.data) ? listRes.data : (listRes.data.data || []);
      setAllList(data);
      setAllStats(statsRes.data);
    } catch (error) {
      console.error('Lỗi tải tổng quan:', error);
      setAllList([]);
    } finally {
      setAllLoading(false);
    }
  };

  // === Load vehicle freight ===
  const loadVehicleFreight = async () => {
    try {
      setVehicleLoading(true);
      const params = new URLSearchParams();
      if (vehicleSearch.trim()) params.append('vehicle', vehicleSearch.trim());
      if (vehicleDate) params.append('date', vehicleDate);
      const response = await axios.get(`${API_URL}/freight/by-vehicle?${params.toString()}`, getAxiosConfig());
      if (response.data.success) {
        setVehicleData(response.data.vehicles || []);
      }
    } catch (error) {
      console.error('Lỗi tải hàng hóa theo xe:', error);
      setVehicleData([]);
    } finally {
      setVehicleLoading(false);
    }
  };

  // Auto-load on tab change
  useEffect(() => {
    if (activeTab === 'homnay') loadToday();
    if (activeTab === 'tongquan') loadAll();
    if (activeTab === 'theoxe') loadVehicleFreight();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload tổng quan khi filter thay đổi
  useEffect(() => {
    if (activeTab === 'tongquan') loadAll();
  }, [allFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload vehicle khi đổi ngày hoặc chọn xe
  useEffect(() => {
    if (activeTab === 'theoxe') loadVehicleFreight();
  }, [vehicleDate, vehicleSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = () => {
    if (activeTab === 'homnay') loadToday();
    else if (activeTab === 'tongquan') loadAll();
    else loadVehicleFreight();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      picked_up: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      picked_up: 'Đã lấy hàng',
      in_transit: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  // === Render stats cards ===
  const renderStats = (stats) => {
    if (!stats) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng đơn</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_freight || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Đã giao</p>
              <p className="text-2xl font-bold text-green-600">{stats.delivered || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Doanh thu</p>
              <p className="text-xl font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN').format(stats.total_revenue || 0)}đ</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // === Render freight table ===
  const renderFreightTable = (list, isLoading) => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người gửi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người nhận</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cước phí</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang tải...
                </div>
              </td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  <p>Không có đơn hàng dọc đường nào</p>
                </div>
              </td></tr>
            ) : (
              list.map(freight => (
                <tr key={freight.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{freight.id}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(freight.departure_time)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-medium">{freight.sender_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{freight.sender_phone || ''}</div>
                    <div className="text-xs text-blue-600">{freight.sender_station || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="font-medium">{freight.receiver_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{freight.receiver_phone || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="max-w-xs truncate" title={freight.description}>{freight.description || 'Hàng hóa'}</div>
                    {freight.special_instructions && <div className="text-xs text-orange-600 mt-1">{freight.special_instructions}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(freight.status)}`}>{getStatusText(freight.status)}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-semibold text-green-600">{new Intl.NumberFormat('vi-VN').format(freight.freight_charge || 0)}đ</div>
                    {freight.cod_amount > 0 && <div className="text-xs text-orange-600">COD: {new Intl.NumberFormat('vi-VN').format(freight.cod_amount)}đ</div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && list.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600 text-center">
          Hiển thị {list.length} đơn hàng
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Hàng Hóa</h1>
            <p className="text-sm text-gray-500 mt-1">Đơn hàng dọc đường từ hệ thống Nhập Hàng</p>
          </div>
          <button onClick={handleRefresh} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Làm mới
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 border-t pt-4">
          {[
            { key: 'homnay', label: '📦 Hôm Nay' },
            { key: 'tongquan', label: '📊 Tổng Quan' },
            { key: 'theoxe', label: '🚐 Theo Xe' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== TAB: HÔM NAY ===== */}
      {activeTab === 'homnay' && (
        <>
          {renderStats(todayStats)}
          {renderFreightTable(todayList, todayLoading)}
        </>
      )}

      {/* ===== TAB: TỔNG QUAN ===== */}
      {activeTab === 'tongquan' && (
        <>
          {renderStats(allStats)}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select name="status" value={allFilters.status} onChange={e => setAllFilters(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="">Tất cả</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="picked_up">Đã lấy hàng</option>
                  <option value="in_transit">Đang vận chuyển</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <input type="date" value={allFilters.fromDate} onChange={e => setAllFilters(f => ({ ...f, fromDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <input type="date" value={allFilters.toDate} onChange={e => setAllFilters(f => ({ ...f, toDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {renderFreightTable(allList, allLoading)}
        </>
      )}

      {/* ===== TAB: THEO XE ===== */}
      {activeTab === 'theoxe' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                <select value={vehicleSearch} onChange={e => { setVehicleSearch(e.target.value); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Tất cả xe --</option>
                  {VEHICLE_LIST.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                <input type="date" value={vehicleDate} onChange={e => setVehicleDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-end">
                <button onClick={loadVehicleFreight} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold">Làm mới</button>
              </div>
            </div>
          </div>

          {vehicleLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang tải...
              </div>
            </div>
          ) : vehicleData.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <p>Không tìm thấy hàng hóa theo xe</p>
              <p className="text-sm text-gray-400 mt-1">Hàng hóa sẽ hiện khi bên Nhập Hàng gán biển số xe cho đơn hàng</p>
            </div>
          ) : (
            vehicleData.map(veh => (
              <div key={veh.vehicle} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpandedVehicle(expandedVehicle === veh.vehicle ? null : veh.vehicle)}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{veh.vehicle}</h3>
                      <p className="text-sm text-gray-500">{veh.totalOrders} đơn hàng</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Tổng cước</p>
                      <p className="text-lg font-bold text-green-600">{new Intl.NumberFormat('vi-VN').format(veh.totalFreight)}đ</p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedVehicle === veh.vehicle ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {expandedVehicle === veh.vehicle && (
                  <div className="border-t">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người gửi</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Người nhận</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạm đến</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cước phí</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {veh.items.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm"><span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{item.id}</span></td>
                            <td className="px-4 py-2 text-sm">
                              <div className="font-medium">{item.sender_name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.sender_phone || ''}</div>
                              <div className="text-xs text-blue-600">{item.sender_station || ''}</div>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <div className="font-medium">{item.receiver_name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.receiver_phone || ''}</div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">{item.delivery_station || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm text-gray-700"><div className="max-w-[200px] truncate">{item.description}</div></td>
                            <td className="px-4 py-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(item.status === 'delivered' || item.delivery_status === 'delivered' ? 'delivered' : item.status === 'cancelled' ? 'cancelled' : 'pending')}`}>
                                {getStatusText(item.status === 'delivered' || item.delivery_status === 'delivered' ? 'delivered' : item.status === 'cancelled' ? 'cancelled' : item.delivery_status === 'in_transit' ? 'in_transit' : 'pending')}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-green-600">{new Intl.NumberFormat('vi-VN').format(item.freight_charge)}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default HangHoaPage;
