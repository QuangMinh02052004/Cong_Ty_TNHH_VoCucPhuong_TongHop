const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET - Lấy tất cả booking
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Bookings ORDER BY id');
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách Bookings:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy booking theo timeSlotId
router.get('/timeslot/:timeSlotId', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('timeSlotId', sql.Int, req.params.timeSlotId)
      .query('SELECT * FROM Bookings WHERE timeSlotId = @timeSlotId ORDER BY seatNumber');
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy Bookings theo timeSlotId:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một booking theo ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Bookings WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json(result.recordset[0]);
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
      pickupAddress, dropoffMethod, note, seatNumber, amount, paid,
      timeSlot, date, route
    } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('timeSlotId', sql.Int, timeSlotId)
      .input('phone', sql.VarChar(20), phone || '')
      .input('name', sql.NVarChar(200), name || '')
      .input('gender', sql.VarChar(10), gender || '')
      .input('nationality', sql.NVarChar(100), nationality || '')
      .input('pickupMethod', sql.NVarChar(50), pickupMethod || '')
      .input('pickupAddress', sql.NVarChar(500), pickupAddress || '')
      .input('dropoffMethod', sql.NVarChar(50), dropoffMethod || '')
      .input('note', sql.NVarChar(1000), note || '')
      .input('seatNumber', sql.Int, seatNumber || 0)
      .input('amount', sql.Decimal(18, 2), amount || 0)
      .input('paid', sql.Decimal(18, 2), paid || 0)
      .input('timeSlot', sql.VarChar(10), timeSlot || '')
      .input('date', sql.VarChar(20), date || '')
      .input('route', sql.NVarChar(100), route || '')
      .query(`
        INSERT INTO Bookings (
          timeSlotId, phone, name, gender, nationality, pickupMethod,
          pickupAddress, dropoffMethod, note, seatNumber, amount, paid,
          timeSlot, date, route
        )
        OUTPUT INSERTED.*
        VALUES (
          @timeSlotId, @phone, @name, @gender, @nationality, @pickupMethod,
          @pickupAddress, @dropoffMethod, @note, @seatNumber, @amount, @paid,
          @timeSlot, @date, @route
        )
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi tạo Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Cập nhật booking
router.put('/:id', async (req, res) => {
  try {
    const {
      timeSlotId, phone, name, gender, nationality, pickupMethod,
      pickupAddress, dropoffMethod, note, seatNumber, amount, paid,
      timeSlot, date, route
    } = req.body;

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('timeSlotId', sql.Int, timeSlotId)
      .input('phone', sql.VarChar(20), phone || '')
      .input('name', sql.NVarChar(200), name || '')
      .input('gender', sql.VarChar(10), gender || '')
      .input('nationality', sql.NVarChar(100), nationality || '')
      .input('pickupMethod', sql.NVarChar(50), pickupMethod || '')
      .input('pickupAddress', sql.NVarChar(500), pickupAddress || '')
      .input('dropoffMethod', sql.NVarChar(50), dropoffMethod || '')
      .input('note', sql.NVarChar(1000), note || '')
      .input('seatNumber', sql.Int, seatNumber || 0)
      .input('amount', sql.Decimal(18, 2), amount || 0)
      .input('paid', sql.Decimal(18, 2), paid || 0)
      .input('timeSlot', sql.VarChar(10), timeSlot || '')
      .input('date', sql.VarChar(20), date || '')
      .input('route', sql.NVarChar(100), route || '')
      .query(`
        UPDATE Bookings
        SET
          timeSlotId = @timeSlotId,
          phone = @phone,
          name = @name,
          gender = @gender,
          nationality = @nationality,
          pickupMethod = @pickupMethod,
          pickupAddress = @pickupAddress,
          dropoffMethod = @dropoffMethod,
          note = @note,
          seatNumber = @seatNumber,
          amount = @amount,
          paid = @paid,
          timeSlot = @timeSlot,
          date = @date,
          route = @route,
          updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Cập nhật một phần thông tin booking
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const pool = await getConnection();

    // Xây dựng câu lệnh UPDATE động
    const updateFields = [];
    const request = pool.request().input('id', sql.Int, req.params.id);

    const fieldMapping = {
      timeSlotId: { type: sql.Int },
      phone: { type: sql.VarChar(20) },
      name: { type: sql.NVarChar(200) },
      gender: { type: sql.VarChar(10) },
      nationality: { type: sql.NVarChar(100) },
      pickupMethod: { type: sql.NVarChar(50) },
      pickupAddress: { type: sql.NVarChar(500) },
      dropoffMethod: { type: sql.NVarChar(50) },
      note: { type: sql.NVarChar(1000) },
      seatNumber: { type: sql.Int },
      amount: { type: sql.Decimal(18, 2) },
      paid: { type: sql.Decimal(18, 2) },
      timeSlot: { type: sql.VarChar(10) },
      date: { type: sql.VarChar(20) },
      route: { type: sql.NVarChar(100) }
    };

    Object.keys(updates).forEach(field => {
      if (fieldMapping[field]) {
        updateFields.push(`${field} = @${field}`);
        request.input(field, fieldMapping[field].type, updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    updateFields.push('updatedAt = GETDATE()');
    const query = `UPDATE Bookings SET ${updateFields.join(', ')} OUTPUT INSERTED.* WHERE id = @id`;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa booking
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Bookings WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Không tìm thấy booking' });
    }
    res.json({ message: 'Đã xóa booking thành công' });
  } catch (err) {
    console.error('Lỗi xóa Booking:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
