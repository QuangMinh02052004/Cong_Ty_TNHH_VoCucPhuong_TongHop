const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// GET - Tìm khách hàng theo số điện thoại
router.get('/search/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;

    // Validate phone number
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
    }

    // Tìm khách hàng trong bảng Customers
    const result = await queryOne(`
      SELECT
        id,
        phone,
        "fullName",
        "pickupType",
        "pickupLocation",
        "dropoffType",
        "dropoffLocation",
        notes,
        "totalBookings",
        "lastBookingDate",
        "createdAt"
      FROM "TH_Customers"
      WHERE phone = $1
    `, [phone]);

    if (!result) {
      return res.status(404).json({
        found: false,
        message: 'Khách hàng mới'
      });
    }

    // Trả về thông tin khách hàng
    res.json({
      found: true,
      customer: {
        id: result.id,
        phone: result.phone,
        fullName: result.fullName,
        pickupType: result.pickupType,
        pickupLocation: result.pickupLocation,
        dropoffType: result.dropoffType,
        dropoffLocation: result.dropoffLocation,
        notes: result.notes,
        totalBookings: result.totalBookings,
        lastBookingDate: result.lastBookingDate
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

    // Kiểm tra khách hàng đã tồn tại chưa
    const existing = await query(
      'SELECT id FROM "TH_Customers" WHERE phone = $1',
      [phone]
    );

    if (existing.length > 0) {
      // Cập nhật thông tin khách hàng
      const result = await query(`
        UPDATE "TH_Customers"
        SET
          "fullName" = $1,
          "pickupType" = $2,
          "pickupLocation" = $3,
          "dropoffType" = $4,
          "dropoffLocation" = $5,
          notes = $6,
          "totalBookings" = "totalBookings" + 1,
          "lastBookingDate" = NOW(),
          "updatedAt" = NOW()
        WHERE phone = $7
        RETURNING *
      `, [fullName, pickupType || null, pickupLocation || null, dropoffType || null, dropoffLocation || null, notes || null, phone]);

      res.json({
        message: 'Đã cập nhật thông tin khách hàng',
        customer: result[0]
      });
    } else {
      // Tạo khách hàng mới
      const result = await query(`
        INSERT INTO "TH_Customers" (phone, "fullName", "pickupType", "pickupLocation", "dropoffType", "dropoffLocation", notes, "totalBookings", "lastBookingDate")
        VALUES ($1, $2, $3, $4, $5, $6, $7, 1, NOW())
        RETURNING *
      `, [phone, fullName, pickupType || null, pickupLocation || null, dropoffType || null, dropoffLocation || null, notes || null]);

      res.status(201).json({
        message: 'Đã tạo khách hàng mới',
        customer: result[0]
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

    const result = await query(`
      SELECT
        b.*,
        t.time,
        t.date,
        t.route,
        t.type as "vehicleType"
      FROM "TH_Bookings" b
      LEFT JOIN "TH_TimeSlots" t ON b."timeSlotId" = t.id
      WHERE b.phone = $1
      ORDER BY b."createdAt" DESC
    `, [phone]);

    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy lịch sử:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy danh sách tất cả khách hàng
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT *
      FROM "TH_Customers"
      ORDER BY "lastBookingDate" DESC, "fullName"
    `);

    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách khách hàng:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
