import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ TIME SLOTS API ============
export const timeSlotAPI = {
  // Lấy tất cả khung giờ
  getAll: async () => {
    const response = await api.get('/timeslots');
    return response.data;
  },

  // Lấy một khung giờ theo ID
  getById: async (id) => {
    const response = await api.get(`/timeslots/${id}`);
    return response.data;
  },

  // Tạo khung giờ mới
  create: async (data) => {
    const response = await api.post('/timeslots', data);
    return response.data;
  },

  // Cập nhật khung giờ
  update: async (id, data) => {
    const response = await api.put(`/timeslots/${id}`, data);
    return response.data;
  },

  // Cập nhật một phần thông tin
  patch: async (id, data) => {
    const response = await api.patch(`/timeslots/${id}`, data);
    return response.data;
  },

  // Xóa khung giờ
  delete: async (id) => {
    const response = await api.delete(`/timeslots/${id}`);
    return response.data;
  },
};

// ============ BOOKINGS API ============
export const bookingAPI = {
  // Lấy tất cả booking
  getAll: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  // Lấy booking theo timeSlotId
  getByTimeSlot: async (timeSlotId) => {
    const response = await api.get(`/bookings/timeslot/${timeSlotId}`);
    return response.data;
  },

  // Lấy một booking theo ID
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  // Tạo booking mới
  create: async (data) => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  // Cập nhật booking
  update: async (id, data) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response.data;
  },

  // Cập nhật một phần thông tin
  patch: async (id, data) => {
    const response = await api.patch(`/bookings/${id}`, data);
    return response.data;
  },

  // Xóa booking
  delete: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  },
};

// ============ DRIVERS API ============
export const driverAPI = {
  // Lấy tất cả tài xế
  getAll: async () => {
    const response = await api.get('/drivers');
    return response.data;
  },

  // Lấy một tài xế theo ID
  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data;
  },

  // Tạo tài xế mới
  create: async (data) => {
    const response = await api.post('/drivers', data);
    return response.data;
  },

  // Cập nhật tài xế
  update: async (id, data) => {
    const response = await api.put(`/drivers/${id}`, data);
    return response.data;
  },

  // Xóa tài xế
  delete: async (id) => {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },
};

// ============ VEHICLES API ============
export const vehicleAPI = {
  // Lấy tất cả xe
  getAll: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  // Lấy một xe theo ID
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Tạo xe mới
  create: async (data) => {
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  // Cập nhật xe
  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  // Xóa xe
  delete: async (id) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

export default api;
