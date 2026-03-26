import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = '/api/tong-hop';

const RouteManagementPage = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    routeType: 'quoc_lo',
    fromStation: '',
    toStation: '',
    price: '',
    duration: '',
    busType: 'Ghế ngồi',
    seats: 28,
    distance: '',
    operatingStart: '05:30',
    operatingEnd: '20:00',
    intervalMinutes: 30
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/routes`);
      setRoutes(response.data);
    } catch (error) {
      console.error('Lỗi load routes:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách tuyến' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoutes(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = () => {
    setEditingRoute(null);
    setFormData({ name: '', routeType: 'quoc_lo', fromStation: '', toStation: '', price: '', duration: '', busType: 'Ghế ngồi', seats: 28, distance: '', operatingStart: '05:30', operatingEnd: '20:00', intervalMinutes: 30 });
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      routeType: route.routeType || 'quoc_lo',
      fromStation: route.fromStation || '',
      toStation: route.toStation || '',
      price: route.price || '',
      duration: route.duration || '',
      busType: route.busType || 'Ghế ngồi',
      seats: route.seats || 28,
      distance: route.distance || '',
      operatingStart: route.operatingStart || '05:30',
      operatingEnd: route.operatingEnd || '20:00',
      intervalMinutes: route.intervalMinutes || 30
    });
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        name: formData.name,
        routeType: formData.routeType,
        fromStation: formData.fromStation,
        toStation: formData.toStation,
        price: parseFloat(formData.price) || 0,
        duration: formData.duration,
        busType: formData.busType,
        seats: parseInt(formData.seats) || 28,
        distance: formData.distance,
        operatingStart: formData.operatingStart,
        operatingEnd: formData.operatingEnd,
        intervalMinutes: parseInt(formData.intervalMinutes) || 30
      };

      if (editingRoute) {
        await axios.put(`${API_URL}/routes/${editingRoute.id}`, payload);
        setMessage({ type: 'success', text: 'Cập nhật tuyến thành công!' });
      } else {
        await axios.post(`${API_URL}/routes`, payload);
        setMessage({ type: 'success', text: 'Tạo tuyến mới thành công!' });
      }

      loadRoutes();
      setTimeout(() => { setShowModal(false); setMessage({ type: '', text: '' }); }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra' });
    }
  };

  const handleToggleActive = async (route) => {
    try {
      await axios.put(`${API_URL}/routes/${route.id}`, {
        ...route,
        isActive: !route.isActive
      });
      loadRoutes();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể cập nhật trạng thái' });
    }
  };

  const handleDelete = (route) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa tuyến đường',
      message: `Bạn có chắc muốn xóa tuyến "${route.name}"?`,
      type: 'danger',
      danger: true,
      confirmText: 'Xóa',
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, isOpen: false }));
        try {
          await axios.delete(`${API_URL}/routes/${route.id}`);
          setMessage({ type: 'success', text: `Đã xóa tuyến ${route.name}` });
          loadRoutes();
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
          setMessage({ type: 'error', text: 'Không thể xóa tuyến' });
        }
      }
    });
  };

  const routeTypeLabel = (type) => {
    const map = { cao_toc: 'Cao tốc', quoc_lo: 'Quốc lộ' };
    return map[type] || type;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Tuyến đường</h1>
            <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa các tuyến đường trong hệ thống</p>
          </div>
          <button onClick={handleCreate}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Thêm tuyến</span>
          </button>
        </div>

        {message.text && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>{message.text}</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên tuyến</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm đi → Điểm đến</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá vé</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giờ chạy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại xe</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className={`hover:bg-gray-50 ${!route.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{route.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        route.routeType === 'cao_toc' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {routeTypeLabel(route.routeType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {route.fromStation && route.toStation ? `${route.fromStation} → ${route.toStation}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatPrice(route.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{route.duration || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {route.operatingStart || '?'} - {route.operatingEnd || '?'}
                      <br /><span className="text-xs text-gray-400">{route.intervalMinutes || 30}p/chuyến</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {route.busType || '-'}
                      <br /><span className="text-xs text-gray-400">{route.seats || 28} chỗ</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(route)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          route.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {route.isActive ? 'Hoạt động' : 'Tắt'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <button onClick={() => handleEdit(route)} className="text-blue-600 hover:text-blue-900 mr-3" title="Sửa">
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(route)} className="text-red-600 hover:text-red-900" title="Xóa">
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {routes.length === 0 && (
              <div className="p-8 text-center text-gray-500">Chưa có tuyến đường nào</div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingRoute ? 'Sửa tuyến đường' : 'Thêm tuyến đường'}
            </h2>

            {message.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên tuyến <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="VD: Sài Gòn - Long Khánh (Cao tốc)" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đi</label>
                    <input type="text" name="fromStation" value={formData.fromStation} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: Sài Gòn" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm đến</label>
                    <input type="text" name="toStation" value={formData.toStation} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="VD: Long Khánh" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại tuyến</label>
                    <select name="routeType" value={formData.routeType} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="quoc_lo">Quốc lộ</option>
                      <option value="cao_toc">Cao tốc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá vé (VND)</label>
                    <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="110000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian di chuyển</label>
                    <input type="text" name="duration" value={formData.duration} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="~2 giờ 30 phút" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng cách</label>
                    <input type="text" name="distance" value={formData.distance} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="80 km" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                    <input type="text" name="busType" value={formData.busType} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ghế ngồi" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ</label>
                    <input type="number" name="seats" value={formData.seats} onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="28" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Lịch chạy xe</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Giờ bắt đầu</label>
                      <input type="time" name="operatingStart" value={formData.operatingStart} onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Giờ kết thúc</label>
                      <input type="time" name="operatingEnd" value={formData.operatingEnd} onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Mỗi (phút)</label>
                      <input type="number" name="intervalMinutes" value={formData.intervalMinutes} onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="30" min="5" max="120" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition">
                  {editingRoute ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); setMessage({ type: '', text: '' }); }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        danger={confirmModal.danger}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(m => ({ ...m, isOpen: false }))}
      />
    </div>
  );
};

export default RouteManagementPage;
