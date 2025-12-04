import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const HangHoaPage = () => {
  const [freightList, setFreightList] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFreight, setEditingFreight] = useState(null);
  const [stats, setStats] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    timeSlotId: '',
    fromDate: '',
    toDate: ''
  });

  // Form data
  const [formData, setFormData] = useState({
    time_slot_id: '',
    sender_customer_id: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    pickup_station_id: '',
    delivery_station_id: '',
    description: '',
    weight: '',
    size_length: '',
    size_width: '',
    size_height: '',
    quantity: 1,
    freight_charge: 0,
    cod_amount: 0,
    special_instructions: ''
  });

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Tạo axios config với token
  const getAxiosConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    };
  };

  // Load dữ liệu ban đầu
  useEffect(() => {
    loadFreightList();
    loadTimeSlots();
    loadCustomers();
    loadStations();
    loadStats();
  }, [filters]);

  const loadFreightList = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.timeSlotId) params.append('timeSlotId', filters.timeSlotId);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);

      const response = await axios.get(
        `${API_URL}/freight?${params.toString()}`,
        getAxiosConfig()
      );
      setFreightList(response.data);
    } catch (error) {
      console.error('Lỗi tải danh sách hàng hóa:', error);
      alert('Không thể tải danh sách hàng hóa');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/timeslots`, getAxiosConfig());
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Lỗi tải khung giờ:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`, getAxiosConfig());
      setCustomers(response.data);
    } catch (error) {
      console.error('Lỗi tải khách hàng:', error);
    }
  };

  const loadStations = async () => {
    try {
      const response = await axios.get(`${API_URL}/stations`, getAxiosConfig());
      setStations(response.data);
    } catch (error) {
      console.error('Lỗi tải trạm:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/freight/stats/summary`, getAxiosConfig());
      setStats(response.data);
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.time_slot_id || !formData.sender_customer_id || !formData.description) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    try {
      if (editingFreight) {
        // Cập nhật
        await axios.put(
          `${API_URL}/freight/${editingFreight.id}`,
          formData,
          getAxiosConfig()
        );
        alert('Cập nhật hàng hóa thành công!');
      } else {
        // Tạo mới
        await axios.post(`${API_URL}/freight`, formData, getAxiosConfig());
        alert('Thêm hàng hóa thành công!');
      }

      resetForm();
      loadFreightList();
      loadStats();
    } catch (error) {
      console.error('Lỗi lưu hàng hóa:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (freight) => {
    setEditingFreight(freight);
    setFormData({
      time_slot_id: freight.time_slot_id,
      sender_customer_id: freight.sender_customer_id,
      receiver_name: freight.receiver_name || '',
      receiver_phone: freight.receiver_phone || '',
      receiver_address: freight.receiver_address || '',
      pickup_station_id: freight.pickup_station_id || '',
      delivery_station_id: freight.delivery_station_id || '',
      description: freight.description,
      weight: freight.weight || '',
      size_length: freight.size_length || '',
      size_width: freight.size_width || '',
      size_height: freight.size_height || '',
      quantity: freight.quantity,
      freight_charge: freight.freight_charge,
      cod_amount: freight.cod_amount || 0,
      special_instructions: freight.special_instructions || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/freight/${id}`, getAxiosConfig());
      alert('Xóa hàng hóa thành công!');
      loadFreightList();
      loadStats();
    } catch (error) {
      console.error('Lỗi xóa hàng hóa:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/freight/${id}/status`,
        { status },
        getAxiosConfig()
      );
      alert('Cập nhật trạng thái thành công!');
      loadFreightList();
      loadStats();
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      time_slot_id: '',
      sender_customer_id: '',
      receiver_name: '',
      receiver_phone: '',
      receiver_address: '',
      pickup_station_id: '',
      delivery_station_id: '',
      description: '',
      weight: '',
      size_length: '',
      size_width: '',
      size_height: '',
      quantity: 1,
      freight_charge: 0,
      cod_amount: 0,
      special_instructions: ''
    });
    setEditingFreight(null);
    setShowAddForm(false);
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
      pending: 'Chờ lấy hàng',
      picked_up: 'Đã lấy hàng',
      in_transit: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Hàng Hóa</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý vận chuyển hàng hóa và kiện hàng</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-semibold"
          >
            {showAddForm ? '✕ Đóng' : '+ Thêm Hàng Hóa'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_freight || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang vận chuyển</p>
                <p className="text-2xl font-bold text-purple-600">{stats.in_transit || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đã giao hàng</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered || 0}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Doanh thu</p>
                <p className="text-xl font-bold text-emerald-600">
                  {new Intl.NumberFormat('vi-VN').format(stats.total_revenue || 0)}đ
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingFreight ? 'Chỉnh Sửa Hàng Hóa' : 'Thêm Hàng Hóa Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chuyến xe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chuyến xe <span className="text-red-500">*</span>
              </label>
              <select
                name="time_slot_id"
                value={formData.time_slot_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn chuyến xe --</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.time} - {slot.route || slot.code} ({slot.driver})
                  </option>
                ))}
              </select>
            </div>

            {/* Người gửi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người gửi <span className="text-red-500">*</span>
              </label>
              <select
                name="sender_customer_id"
                value={formData.sender_customer_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn khách hàng --</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Tên người nhận */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên người nhận
              </label>
              <input
                type="text"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên người nhận"
              />
            </div>

            {/* SĐT người nhận */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SĐT người nhận
              </label>
              <input
                type="text"
                name="receiver_phone"
                value={formData.receiver_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* Địa chỉ người nhận */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ người nhận
              </label>
              <input
                type="text"
                name="receiver_address"
                value={formData.receiver_address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập địa chỉ giao hàng"
              />
            </div>

            {/* Điểm lấy hàng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm lấy hàng
              </label>
              <select
                name="pickup_station_id"
                value={formData.pickup_station_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn trạm --</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.station_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Điểm giao hàng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm giao hàng
              </label>
              <select
                name="delivery_station_id"
                value={formData.delivery_station_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn trạm --</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>
                    {station.station_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mô tả hàng hóa */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả hàng hóa <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả chi tiết hàng hóa"
                required
              />
            </div>

            {/* Cân nặng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cân nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng kiện
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Kích thước */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dài (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="size_length"
                  value={formData.size_length}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rộng (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="size_width"
                  value={formData.size_width}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cao (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="size_height"
                  value={formData.size_height}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Cước phí */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cước phí (đ)
              </label>
              <input
                type="number"
                name="freight_charge"
                value={formData.freight_charge}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* COD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiền thu hộ (COD)
              </label>
              <input
                type="number"
                name="cod_amount"
                value={formData.cod_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            {/* Ghi chú đặc biệt */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú đặc biệt
              </label>
              <textarea
                name="special_instructions"
                value={formData.special_instructions}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Hướng dẫn đặc biệt cho việc giao hàng"
              />
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold"
              >
                {editingFreight ? 'Cập nhật' : 'Thêm mới'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ lấy hàng</option>
              <option value="picked_up">Đã lấy hàng</option>
              <option value="in_transit">Đang vận chuyển</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chuyến xe</label>
            <select
              name="timeSlotId"
              value={filters.timeSlotId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              {timeSlots.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.time} - {slot.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Freight List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chuyến xe</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người gửi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người nhận</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hàng hóa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cước phí</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : freightList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                freightList.map(freight => (
                  <tr key={freight.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">#{freight.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{freight.departure_time ? new Date(freight.departure_time).toLocaleString('vi-VN') : 'N/A'}</div>
                      <div className="text-xs text-gray-500">{freight.vehicle_plate} - {freight.driver_name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium">{freight.sender_name}</div>
                      <div className="text-xs text-gray-500">{freight.sender_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="font-medium">{freight.receiver_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{freight.receiver_phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="max-w-xs truncate" title={freight.description}>
                        {freight.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {freight.weight ? `${freight.weight}kg` : ''}
                        {freight.quantity > 1 ? ` × ${freight.quantity} kiện` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={freight.status}
                        onChange={(e) => handleUpdateStatus(freight.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(freight.status)}`}
                      >
                        <option value="pending">Chờ lấy hàng</option>
                        <option value="picked_up">Đã lấy hàng</option>
                        <option value="in_transit">Đang vận chuyển</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold text-green-600">
                        {new Intl.NumberFormat('vi-VN').format(freight.freight_charge)}đ
                      </div>
                      {freight.cod_amount > 0 && (
                        <div className="text-xs text-orange-600">
                          COD: {new Intl.NumberFormat('vi-VN').format(freight.cod_amount)}đ
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(freight)}
                          className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-xs"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(freight.id)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-xs"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
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

export default HangHoaPage;
