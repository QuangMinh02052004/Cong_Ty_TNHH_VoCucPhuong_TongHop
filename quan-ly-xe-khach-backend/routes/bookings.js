const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// GET - Lấy tất cả booking
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "TH_Bookings" ORDER BY id');
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách Bookings:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy booking theo timeSlotId
router.get('/timeslot/:timeSlotId', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM "TH_Bookings" WHERE "timeSlotId" = $1 ORDER BY "seatNumber"',
      [req.params.timeSlotId]
    );
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy Bookings theo timeSlotId:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một booking theo ID
router.get('/:id', async (req, res) => {
  try {
    const result = await queryOne(
      'SELECT * FROM "TH_Bookings" WHERE id = $1',
      [req.params.id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Tạo booking mới
router.post('/', async (req, res) => {
  try {
    const {
      timeSlotId, phone, name, gender, nationality, pickupMethod,
      pickupAddress, dropoffMethod, dropoffAddress, note, seatNumber, amount, paid,
      timeSlot, date, route
    } = req.body;

    const result = await query(`
      INSERT INTO "TH_Bookings" (
        "timeSlotId", phone, name, gender, nationality, "pickupMethod",
        "pickupAddress", "dropoffMethod", "dropoffAddress", note, "seatNumber", amount, paid,
        "timeSlot", date, route
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      timeSlotId, phone || '', name || '', gender || '', nationality || '', pickupMethod || '',
      pickupAddress || '', dropoffMethod || '', dropoffAddress || '', note || '', seatNumber || 0,
      amount || 0, paid || 0, timeSlot || '', date || '', route || ''
    ]);

    const newBooking = result[0];

    // Gửi booking sang hệ thống Đặt Vé
    sendToTicketSystem({
      customerName: name,
      customerPhone: phone,
      note: `${seatNumber} vé - Ghế ${seatNumber} | ${note || ''}`,
      date: date,
      timeSlot: timeSlot,
      route: route,
      seatNumber: seatNumber,
      amount: amount,
      pickupAddress: pickupAddress,
      dropoffAddress: dropoffAddress
    }).catch(err => {
      console.error('[TongHop] Lỗi gửi sang Đặt Vé:', err.message);
    });

    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Lỗi tạo Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function để gửi booking sang hệ thống Đặt Vé
async function sendToTicketSystem(bookingData) {
  const TICKET_SYSTEM_URL = process.env.TICKET_SYSTEM_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${TICKET_SYSTEM_URL}/api/webhook/tonghop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('[TongHop] Đã gửi booking sang Đặt Vé:', data.data?.bookingCode);
    } else {
      console.error('[TongHop] Lỗi từ Đặt Vé:', data.error);
    }

    return data;
  } catch (error) {
    console.error('[TongHop] Không thể kết nối Đặt Vé:', error.message);
    throw error;
  }
}

// PUT - Cập nhật booking
router.put('/:id', async (req, res) => {
  try {
    const {
      timeSlotId, phone, name, gender, nationality, pickupMethod,
      pickupAddress, dropoffMethod, dropoffAddress, note, seatNumber, amount, paid,
      timeSlot, date, route
    } = req.body;

    const result = await query(`
      UPDATE "TH_Bookings"
      SET
        "timeSlotId" = $1,
        phone = $2,
        name = $3,
        gender = $4,
        nationality = $5,
        "pickupMethod" = $6,
        "pickupAddress" = $7,
        "dropoffMethod" = $8,
        "dropoffAddress" = $9,
        note = $10,
        "seatNumber" = $11,
        amount = $12,
        paid = $13,
        "timeSlot" = $14,
        date = $15,
        route = $16,
        "updatedAt" = NOW()
      WHERE id = $17
      RETURNING *
    `, [
      timeSlotId, phone || '', name || '', gender || '', nationality || '', pickupMethod || '',
      pickupAddress || '', dropoffMethod || '', dropoffAddress || '', note || '', seatNumber || 0,
      amount || 0, paid || 0, timeSlot || '', date || '', route || '', req.params.id
    ]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Cập nhật một phần thông tin booking
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'timeSlotId', 'phone', 'name', 'gender', 'nationality', 'pickupMethod',
      'pickupAddress', 'dropoffMethod', 'dropoffAddress', 'note', 'seatNumber',
      'amount', 'paid', 'timeSlot', 'date', 'route'
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        // Convert camelCase to quoted identifier for PostgreSQL
        const dbField = field.includes('timeSlot') || field.includes('pickup') ||
                        field.includes('dropoff') || field.includes('seat') ?
          `"${field}"` : field;
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(req.params.id);

    const sqlQuery = `UPDATE "TH_Bookings" SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query(sqlQuery, values);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa booking
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM "TH_Bookings" WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json({ message: 'Đã xóa booking thành công' });
  } catch (err) {
    console.error('Lỗi xóa Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
