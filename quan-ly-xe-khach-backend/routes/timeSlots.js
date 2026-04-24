const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// GET - Lấy tất cả khung giờ
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "TH_TimeSlots" ORDER BY time');
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách TimeSlots:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một khung giờ theo ID
router.get('/:id', async (req, res) => {
  try {
    const result = await queryOne(
      'SELECT * FROM "TH_TimeSlots" WHERE id = $1',
      [req.params.id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Tạo khung giờ mới (có kiểm tra trùng lặp)
router.post('/', async (req, res) => {
  try {
    const { time, date, route, type, code, driver, phone } = req.body;

    // Kiểm tra xem time slot đã tồn tại chưa
    const existingCheck = await query(
      'SELECT id FROM "TH_TimeSlots" WHERE time = $1 AND date = $2 AND route = $3',
      [time, date, route || '']
    );

    if (existingCheck.length > 0) {
      // Đã tồn tại, trả về slot hiện có thay vì tạo mới
      const existing = await queryOne(
        'SELECT * FROM "TH_TimeSlots" WHERE id = $1',
        [existingCheck[0].id]
      );
      console.log(`TimeSlot ${time} ${date} ${route} đã tồn tại, trả về slot hiện có`);
      return res.status(200).json(existing);
    }

    const result = await query(`
      INSERT INTO "TH_TimeSlots" (time, date, route, type, code, driver, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [time, date, route || '', type, code || '', driver || '', phone || '']);

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Lỗi tạo TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Cập nhật khung giờ
router.put('/:id', async (req, res) => {
  try {
    const { time, date, route, type, code, driver, phone } = req.body;

    const result = await query(`
      UPDATE "TH_TimeSlots"
      SET time = $1, date = $2, route = $3, type = $4, code = $5, driver = $6, phone = $7, "updatedAt" = NOW()
      WHERE id = $8
      RETURNING *
    `, [time, date, route || '', type, code || '', driver || '', phone || '', req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi cập nhật TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Cập nhật một phần thông tin khung giờ
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = ['time', 'date', 'route', 'type', 'code', 'driver', 'phone'];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(updates[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Không có trường nào để cập nhật' });
    }

    updateFields.push(`"updatedAt" = NOW()`);
    values.push(req.params.id);

    const sqlQuery = `UPDATE "TH_TimeSlots" SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query(sqlQuery, values);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi cập nhật TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa các time slots trùng lặp (giữ lại 1 bản)
router.delete('/cleanup-duplicates', async (req, res) => {
  try {
    // Tìm và xóa các bản trùng lặp, giữ lại bản có ID nhỏ nhất
    const result = await query(`
      DELETE FROM "TH_TimeSlots"
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM "TH_TimeSlots"
        GROUP BY time, date, route
      )
    `);

    const deletedCount = result.rowCount || 0;
    console.log(`Đã xóa ${deletedCount} time slots trùng lặp`);
    res.json({
      success: true,
      message: `Đã xóa ${deletedCount} time slots trùng lặp`
    });
  } catch (err) {
    console.error('Lỗi xóa duplicates:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa khung giờ
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM "TH_TimeSlots" WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    }
    res.json({ message: 'Đã xóa khung giờ thành công' });
  } catch (err) {
    console.error('Lỗi xóa TimeSlot:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
