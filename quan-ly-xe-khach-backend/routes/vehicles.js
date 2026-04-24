const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// GET - Lấy tất cả xe
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "TH_Vehicles" ORDER BY code');
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách Vehicles:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một xe theo ID
router.get('/:id', async (req, res) => {
  try {
    const result = await queryOne(
      'SELECT * FROM "TH_Vehicles" WHERE id = $1',
      [req.params.id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy xe' });
    }
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy Vehicle:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Tạo xe mới
router.post('/', async (req, res) => {
  try {
    const { code, type } = req.body;

    if (!code || !type) {
      return res.status(400).json({ error: 'Biển số và loại xe là bắt buộc' });
    }

    const result = await query(`
      INSERT INTO "TH_Vehicles" (code, type)
      VALUES ($1, $2)
      RETURNING *
    `, [code, type]);

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Lỗi tạo Vehicle:', err);
    if (err.message.includes('duplicate') || err.code === '23505') {
      return res.status(400).json({ error: 'Biển số xe đã tồn tại' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT - Cập nhật xe
router.put('/:id', async (req, res) => {
  try {
    const { code, type } = req.body;

    if (!code || !type) {
      return res.status(400).json({ error: 'Biển số và loại xe là bắt buộc' });
    }

    const result = await query(`
      UPDATE "TH_Vehicles"
      SET code = $1, type = $2, "updatedAt" = NOW()
      WHERE id = $3
      RETURNING *
    `, [code, type, req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy xe' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Vehicle:', err);
    if (err.message.includes('duplicate') || err.code === '23505') {
      return res.status(400).json({ error: 'Biển số xe đã tồn tại' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa xe
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM "TH_Vehicles" WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy xe' });
    }
    res.json({ message: 'Đã xóa xe thành công' });
  } catch (err) {
    console.error('Lỗi xóa Vehicle:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
