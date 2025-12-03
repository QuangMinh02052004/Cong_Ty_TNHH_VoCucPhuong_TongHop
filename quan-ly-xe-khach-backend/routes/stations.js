const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET - Lấy tất cả địa điểm
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Stations ORDER BY StationID');
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách Stations:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một địa điểm theo ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Decimal(5, 1), req.params.id)
      .query('SELECT * FROM Stations WHERE StationID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.json(result.recordset[0]);
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

    const pool = await getConnection();

    const result = await pool.request()
      .input('StationID', sql.Decimal(5, 1), StationID)
      .input('StationName', sql.NVarChar(255), StationName)
      .query(`
        INSERT INTO Stations (StationID, StationName)
        OUTPUT INSERTED.*
        VALUES (@StationID, @StationName)
      `);

    res.status(201).json(result.recordset[0]);
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

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Decimal(5, 1), req.params.id)
      .input('StationName', sql.NVarChar(255), StationName)
      .query(`
        UPDATE Stations
        SET StationName = @StationName, UpdatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE StationID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Station:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa địa điểm
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Decimal(5, 1), req.params.id)
      .query('DELETE FROM Stations WHERE StationID = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Không tìm thấy địa điểm' });
    }
    res.json({ message: 'Đã xóa địa điểm thành công' });
  } catch (err) {
    console.error('Lỗi xóa Station:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
