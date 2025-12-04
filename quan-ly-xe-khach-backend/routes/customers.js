const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET - Tìm khách hàng theo số điện thoại
router.get('/search/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;

    // Validate phone number
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
    }

    const pool = await getConnection();

    // Tìm khách hàng trong bảng Customers
    const result = await pool.request()
      .input('phone', sql.NVarChar(20), phone)
      .query(`
        SELECT
          id,
          phone,
          fullName,
          pickupType,
          pickupLocation,
          dropoffType,
          dropoffLocation,
          notes,
          totalBookings,
          lastBookingDate,
          createdAt
        FROM Customers
        WHERE phone = @phone
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        found: false,
        message: 'Khách hàng mới'
      });
    }

    // Trả về thông tin khách hàng
    const customer = result.recordset[0];
    res.json({
      found: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        fullName: customer.fullName,
        pickupType: customer.pickupType,
        pickupLocation: customer.pickupLocation,
        dropoffType: customer.dropoffType,
        dropoffLocation: customer.dropoffLocation,
        notes: customer.notes,
        totalBookings: customer.totalBookings,
        lastBookingDate: customer.lastBookingDate
      }
    });
  } catch (err) {
    console.error('Lỗi tìm khách hàng:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Tạo hoặc cập nhật khách hàng
router.post('/', async (req, res) => {
  try {
    const {
      phone,
      fullName,
      pickupType,
      pickupLocation,
      dropoffType,
      dropoffLocation,
      notes
    } = req.body;

    // Validate
    if (!phone || !fullName) {
      return res.status(400).json({ error: 'Thiếu số điện thoại hoặc họ tên' });
    }

    const pool = await getConnection();

    // Kiểm tra khách hàng đã tồn tại chưa
    const existing = await pool.request()
      .input('phone', sql.NVarChar(20), phone)
      .query('SELECT id FROM Customers WHERE phone = @phone');

    if (existing.recordset.length > 0) {
      // Cập nhật thông tin khách hàng
      const result = await pool.request()
        .input('phone', sql.NVarChar(20), phone)
        .input('fullName', sql.NVarChar(100), fullName)
        .input('pickupType', sql.NVarChar(50), pickupType || null)
        .input('pickupLocation', sql.NVarChar(200), pickupLocation || null)
        .input('dropoffType', sql.NVarChar(50), dropoffType || null)
        .input('dropoffLocation', sql.NVarChar(200), dropoffLocation || null)
        .input('notes', sql.NVarChar(500), notes || null)
        .query(`
          UPDATE Customers
          SET
            fullName = @fullName,
            pickupType = @pickupType,
            pickupLocation = @pickupLocation,
            dropoffType = @dropoffType,
            dropoffLocation = @dropoffLocation,
            notes = @notes,
            totalBookings = totalBookings + 1,
            lastBookingDate = GETDATE(),
            updatedAt = GETDATE()
          OUTPUT INSERTED.*
          WHERE phone = @phone
        `);

      res.json({
        message: 'Đã cập nhật thông tin khách hàng',
        customer: result.recordset[0]
      });
    } else {
      // Tạo khách hàng mới
      const result = await pool.request()
        .input('phone', sql.NVarChar(20), phone)
        .input('fullName', sql.NVarChar(100), fullName)
        .input('pickupType', sql.NVarChar(50), pickupType || null)
        .input('pickupLocation', sql.NVarChar(200), pickupLocation || null)
        .input('dropoffType', sql.NVarChar(50), dropoffType || null)
        .input('dropoffLocation', sql.NVarChar(200), dropoffLocation || null)
        .input('notes', sql.NVarChar(500), notes || null)
        .query(`
          INSERT INTO Customers (phone, fullName, pickupType, pickupLocation, dropoffType, dropoffLocation, notes, totalBookings, lastBookingDate)
          OUTPUT INSERTED.*
          VALUES (@phone, @fullName, @pickupType, @pickupLocation, @dropoffType, @dropoffLocation, @notes, 1, GETDATE())
        `);

      res.status(201).json({
        message: 'Đã tạo khách hàng mới',
        customer: result.recordset[0]
      });
    }
  } catch (err) {
    console.error('Lỗi tạo/cập nhật khách hàng:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy lịch sử đặt vé của khách hàng
router.get('/history/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;

    const pool = await getConnection();
    const result = await pool.request()
      .input('phone', sql.NVarChar(20), phone)
      .query(`
        SELECT
          b.*,
          t.time,
          t.date,
          t.route,
          t.type as vehicleType
        FROM Bookings b
        LEFT JOIN TimeSlots t ON b.timeSlotId = t.id
        WHERE b.passengerPhone = @phone
        ORDER BY b.createdAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy lịch sử:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy danh sách tất cả khách hàng
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query(`
        SELECT *
        FROM Customers
        ORDER BY lastBookingDate DESC, fullName
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách khách hàng:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
