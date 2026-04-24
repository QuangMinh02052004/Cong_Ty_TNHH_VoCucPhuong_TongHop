const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// GET - Lấy tất cả tài xế
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "TH_Drivers" ORDER BY name');
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách Drivers:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một tài xế theo ID
router.get('/:id', async (req, res) => {
  try {
    const result = await queryOne(
      'SELECT * FROM "TH_Drivers" WHERE id = $1',
      [req.params.id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy Driver:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Tạo tài xế mới
router.post('/', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Tên và số điện thoại là bắt buộc' });
    }

    const result = await query(`
      INSERT INTO "TH_Drivers" (name, phone)
      VALUES ($1, $2)
      RETURNING *
    `, [name, phone]);

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Lỗi tạo Driver:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Cập nhật tài xế
router.put('/:id', async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Tên và số điện thoại là bắt buộc' });
    }

    const result = await query(`
      UPDATE "TH_Drivers"
      SET name = $1, phone = $2, "updatedAt" = NOW()
      WHERE id = $3
      RETURNING *
    `, [name, phone, req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Driver:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa tài xế
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM "TH_Drivers" WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }
    res.json({ message: 'Đã xóa tài xế thành công' });
  } catch (err) {
    console.error('Lỗi xóa Driver:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
