const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET - Lấy tất cả khung giờ
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM TimeSlots ORDER BY time');
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách TimeSlots:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một khung giờ theo ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM TimeSlots WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi lấy TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Tạo khung giờ mới
router.post('/', async (req, res) => {
  try {
    const { time, date, type, code, driver, phone } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
      .input('time', sql.VarChar(10), time)
      .input('date', sql.VarChar(20), date)
      .input('type', sql.NVarChar(50), type)
      .input('code', sql.VarChar(20), code || '')
      .input('driver', sql.NVarChar(100), driver || '')
      .input('phone', sql.VarChar(20), phone || '')
      .query(`
        INSERT INTO TimeSlots (time, date, type, code, driver, phone)
        OUTPUT INSERTED.*
        VALUES (@time, @date, @type, @code, @driver, @phone)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi tạo TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Cập nhật khung giờ
router.put('/:id', async (req, res) => {
  try {
    const { time, date, type, code, driver, phone } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('time', sql.VarChar(10), time)
      .input('date', sql.VarChar(20), date)
      .input('type', sql.NVarChar(50), type)
      .input('code', sql.VarChar(20), code || '')
      .input('driver', sql.NVarChar(100), driver || '')
      .input('phone', sql.VarChar(20), phone || '')
      .query(`
        UPDATE TimeSlots
        SET time = @time, date = @date, type = @type, code = @code, driver = @driver, phone = @phone, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi cập nhật TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Cập nhật một phần thông tin khung giờ
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const pool = await getConnection();

    // Xây dựng câu lệnh UPDATE động
    const updateFields = [];
    const request = pool.request().input('id', sql.Int, req.params.id);

    if (updates.time !== undefined) {
      updateFields.push('time = @time');
      request.input('time', sql.VarChar(10), updates.time);
    }
    if (updates.date !== undefined) {
      updateFields.push('date = @date');
      request.input('date', sql.VarChar(20), updates.date);
    }
    if (updates.type !== undefined) {
      updateFields.push('type = @type');
      request.input('type', sql.NVarChar(50), updates.type);
    }
    if (updates.code !== undefined) {
      updateFields.push('code = @code');
      request.input('code', sql.VarChar(20), updates.code);
    }
    if (updates.driver !== undefined) {
      updateFields.push('driver = @driver');
      request.input('driver', sql.NVarChar(100), updates.driver);
    }
    if (updates.phone !== undefined) {
      updateFields.push('phone = @phone');
      request.input('phone', sql.VarChar(20), updates.phone);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    updateFields.push('updatedAt = GETDATE()');
    const query = `UPDATE TimeSlots SET ${updateFields.join(', ')} OUTPUT INSERTED.* WHERE id = @id`;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi cập nhật TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa khung giờ
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM TimeSlots WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json({ message: 'Đã xóa khung giờ thành công' });
  } catch (err) {
    console.error('Lỗi xóa TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
