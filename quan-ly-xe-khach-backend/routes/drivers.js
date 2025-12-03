const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET - Lấy tất cả tài xế
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Drivers ORDER BY name');
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách Drivers:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một tài xế theo ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Drivers WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }
    res.json(result.recordset[0]);
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

    const pool = await getConnection();

    const result = await pool.request()
      .input('name', sql.NVarChar(100), name)
      .input('phone', sql.VarChar(20), phone)
      .query(`
        INSERT INTO Drivers (name, phone)
        OUTPUT INSERTED.*
        VALUES (@name, @phone)
      `);

    res.status(201).json(result.recordset[0]);
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

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('name', sql.NVarChar(100), name)
      .input('phone', sql.VarChar(20), phone)
      .query(`
        UPDATE Drivers
        SET name = @name, phone = @phone, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Driver:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa tài xế
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Drivers WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế' });
    }
    res.json({ message: 'Đã xóa tài xế thành công' });
  } catch (err) {
    console.error('Lỗi xóa Driver:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
