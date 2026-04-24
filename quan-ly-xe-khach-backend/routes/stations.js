const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// GET - Lấy tất cả địa điểm
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM "TH_Stations" ORDER BY "StationID"');
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách Stations:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một địa điểm theo ID
router.get('/:id', async (req, res) => {
  try {
    const result = await queryOne(
      'SELECT * FROM "TH_Stations" WHERE "StationID" = $1',
      [req.params.id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy Station:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Tạo địa điểm mới
router.post('/', async (req, res) => {
  try {
    const { StationID, StationName } = req.body;

    if (!StationID || !StationName) {
      return res.status(400).json({ error: 'Mã địa điểm và tên địa điểm là bắt buộc' });
    }

    const result = await query(`
      INSERT INTO "TH_Stations" ("StationID", "StationName")
      VALUES ($1, $2)
      RETURNING *
    `, [StationID, StationName]);

    res.status(201).json(result[0]);
  } catch (err) {
    console.error('Lỗi tạo Station:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Cập nhật địa điểm
router.put('/:id', async (req, res) => {
  try {
    const { StationName } = req.body;

    if (!StationName) {
      return res.status(400).json({ error: 'Tên địa điểm là bắt buộc' });
    }

    const result = await query(`
      UPDATE "TH_Stations"
      SET "StationName" = $1, "UpdatedAt" = NOW()
      WHERE "StationID" = $2
      RETURNING *
    `, [StationName, req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Station:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa địa điểm
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM "TH_Stations" WHERE "StationID" = $1 RETURNING "StationID"',
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.json({ message: 'Đã xóa địa điểm thành công' });
  } catch (err) {
    console.error('Lỗi xóa Station:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
