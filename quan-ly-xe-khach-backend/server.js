const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/timeslots', require('./routes/timeSlots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/freight', require('./routes/freight'));
app.use('/api/webhook', require('./routes/webhook'));
app.use('/api/seat-locks', require('./routes/seatLocks'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server đang chạy',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hệ Thống Quản Lý Xe Khách - Võ Cúc Phương API',
    version: '1.0.0',
    endpoints: {
      timeSlots: '/api/timeslots',
      bookings: '/api/bookings',
      drivers: '/api/drivers',
      vehicles: '/api/vehicles',
      stations: '/api/stations',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Lỗi server',
    message: err.message
  });
});

// Khởi động server
const startServer = async () => {
  try {
    // Khởi tạo database và các bảng
    await initDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📝 API Documentation: http://localhost:${PORT}`);
      console.log('='.repeat(60));
    });
  } catch (err) {
    console.error('❌ Lỗi khởi động server:', err);
    process.exit(1);
  }
};

startServer();
