import { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

// Use relative URL for Vercel deployment - API routes are on the same domain
const API_URL = '/api/tong-hop';

// Danh sách tất cả permissions của TongHop
const ALL_PERMS = [
  { key: 'tonghop.view',     label: 'Xem đặt vé / chuyến (Tổng hợp)' },
  { key: 'tonghop.edit',     label: 'Tạo / sửa đặt vé' },
  { key: 'tonghop.cancel',   label: 'Hủy đặt vé' },
  { key: 'thongke.view',     label: 'Xem thống kê / doanh thu' },
  { key: 'logs.view',        label: 'Xem nhật ký thao tác' },
  { key: 'routes.manage',    label: 'Quản lý tuyến xe' },
  { key: 'vehicles.manage',  label: 'Quản lý xe' },
  { key: 'drivers.manage',   label: 'Quản lý tài xế' },
  { key: 'phongve.view',     label: 'Xem nhập hàng (Phòng vé)' },
  { key: 'phongve.create',   label: 'Tạo đơn nhập hàng' },
  { key: 'phongve.edit',     label: 'Sửa đơn nhập hàng' },
  { key: 'phongve.cancel',   label: 'Hủy đơn nhập hàng' },
  { key: 'kho.view',         label: 'Xem kho hàng' },
  { key: 'kho.edit',         label: 'Sửa kho hàng (giao / nhận)' },
  { key: 'users.manage',     label: 'Quản lý tài khoản' }
];

// Preset cho từng vai trò
const PRESETS = {
  user: {
    label: 'Nhân viên cơ bản',
    perms: ['tonghop.view', 'tonghop.edit', 'thongke.view']
  },
  manager: {
    label: 'Quản lý chi nhánh',
    perms: ['tonghop.view','tonghop.edit','tonghop.cancel','thongke.view','logs.view','routes.manage','vehicles.manage','drivers.manage']
  },
  admin: {
    label: 'Toàn quyền',
    perms: ALL_PERMS.map(p => p.key)
  },
  none: {
    label: 'Bỏ chọn tất cả',
    perms: []
  }
};

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'user',
    permissions: []
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/auth/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi load users:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle 1 permission
  const togglePerm = (key) => {
    setFormData(prev => {
      const has = prev.permissions.includes(key);
      return {
        ...prev,
        permissions: has ? prev.permissions.filter(p => p !== key) : [...prev.permissions, key]
      };
    });
  };

  // Apply preset
  const applyPreset = (presetName) => {
    const preset = PRESETS[presetName];
    if (!preset) return;
    setFormData(prev => ({ ...prev, permissions: [...preset.perms] }));
  };

  // Open modal for create
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'user',
      permissions: [...PRESETS.user.perms]
    });
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  // Open modal for edit
  const handleEdit = (user) => {
    setEditingUser(user);
    let perms = Array.isArray(user.permissions) ? [...user.permissions] : [];
    if (perms.length === 0 && PRESETS[user.role]) {
      perms = [...PRESETS[user.role].perms];
    }
    setFormData({
      username: user.username,
      password: '', // Don't pre-fill password
      fullName: user.fullName,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      permissions: perms
    });
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      if (editingUser) {
        // Update user
        await axios.put(`${API_URL}/auth/users/${editingUser.id}`, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          isActive: editingUser.isActive,
          permissions: formData.permissions
        });
        setMessage({ type: 'success', text: 'Cập nhật user thành công!' });
      } else {
        // Create new user
        if (!formData.password) {
          setMessage({ type: 'error', text: 'Vui lòng nhập mật khẩu!' });
          return;
        }
        await axios.post(`${API_URL}/auth/users`, formData);
        setMessage({ type: 'success', text: 'Tạo user mới thành công!' });
      }

      loadUsers();
      setTimeout(() => {
        setShowModal(false);
        setMessage({ type: '', text: '' });
      }, 1500);
    } catch (error) {
      console.error('Lỗi submit:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Có lỗi xảy ra'
      });
    }
  };

  // Toggle user active status
  const handleToggleActive = async (user) => {
    try {
      await axios.put(`${API_URL}/auth/users/${user.id}`, {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: !user.isActive,
        permissions: Array.isArray(user.permissions) ? user.permissions : []
      });
      setMessage({
        type: 'success',
        text: `Đã ${!user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} user ${user.fullName}`
      });
      loadUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Lỗi toggle active:', error);
      setMessage({ type: 'error', text: 'Không thể cập nhật trạng thái user' });
    }
  };

  // Delete user
  const handleDelete = (user) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa tài khoản',
      message: `Bạn có chắc muốn xóa user "${user.fullName}"?`,
      type: 'danger',
      danger: true,
      confirmText: 'Xóa',
      onConfirm: async () => {
        setConfirmModal(m => ({ ...m, isOpen: false }));
        try {
          await axios.delete(`${API_URL}/auth/users/${user.id}`);
          setMessage({ type: 'success', text: `Đã xóa user ${user.fullName}` });
          loadUsers();
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
          console.error('Lỗi xóa user:', error);
          setMessage({ type: 'error', text: 'Không thể xóa user' });
        }
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Users</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản người dùng trong hệ thống</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            
            <span>Thêm User</span>
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Users Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SĐT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => {
                  const permCount = Array.isArray(user.permissions) ? user.permissions.length : 0;
                  return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                          {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.role === 'admin'
                        ? <span className="text-purple-700 font-medium">Toàn quyền</span>
                        : (permCount > 0 ? `${permCount} quyền` : <span className="text-gray-400">Mặc định</span>)
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Sửa"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Chưa có user nào trong hệ thống
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Sửa User' : 'Thêm User Mới'}
            </h2>

            {/* Message in modal */}
            {message.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!!editingUser}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      editingUser ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    }`}
                    required
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">Không thể thay đổi username</p>
                  )}
                </div>

                {/* Password */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="user">Nhân viên</option>
                    <option value="manager">Quản lý</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              {/* Permissions */}
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phân quyền chi tiết
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      (Admin luôn có toàn quyền — không cần tick)
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(PRESETS).map(([key, p]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyPreset(key)}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded transition"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border">
                  {ALL_PERMS.map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 text-sm py-1 hover:bg-white rounded px-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.key)}
                        onChange={() => togglePerm(perm.key)}
                        disabled={formData.role === 'admin'}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <span className={formData.role === 'admin' ? 'text-gray-400' : 'text-gray-700'}>
                        {perm.label}
                        <span className="ml-1 text-xs text-gray-400">({perm.key})</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Đã chọn: <strong>{formData.role === 'admin' ? ALL_PERMS.length : formData.permissions.length}</strong> / {ALL_PERMS.length} quyền
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  {editingUser ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                >
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

export default UserManagementPage;
