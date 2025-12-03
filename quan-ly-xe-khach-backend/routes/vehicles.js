const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');

// GET - Lấy tất cả xe
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Vehicles ORDER BY code');
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách Vehicles:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET - Lấy một xe theo ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Vehicles WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy xe' });
    }
    res.json(result.recordset[0]);
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

    const pool = await getConnection();

    const result = await pool.request()
      .input('code', sql.VarChar(20), code)
      .input('type', sql.NVarChar(50), type)
      .query(`
        INSERT INTO Vehicles (code, type)
        OUTPUT INSERTED.*
        VALUES (@code, @type)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi tạo Vehicle:', err);
    if (err.message.includes('duplicate') || err.number === 2627) {
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

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('code', sql.VarChar(20), code)
      .input('type', sql.NVarChar(50), type)
      .query(`
        UPDATE Vehicles
        SET code = @code, type = @type, updatedAt = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy xe' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi cập nhật Vehicle:', err);
    if (err.message.includes('duplicate') || err.number === 2627) {
      return res.status(400).json({ error: 'Biển số xe đã tồn tại' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Xóa xe
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Vehicles WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Không tìm thấy xe' });
    }
    res.json({ message: 'Đã xóa xe thành công' });
  } catch (err) {
    console.error('Lỗi xóa Vehicle:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
