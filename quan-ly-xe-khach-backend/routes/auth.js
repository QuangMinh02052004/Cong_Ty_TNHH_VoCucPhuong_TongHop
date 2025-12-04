const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT (nên đưa vào .env)
const JWT_SECRET = process.env.JWT_SECRET || 'vocucphuong_secret_key_2025';

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Không có token xác thực' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token không hợp lệ' });
    }
    req.user = user;
    next();
  });
};

// Middleware kiểm tra role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    next();
  };
};

// POST /api/auth/register - Đăng ký user mới (chỉ admin)
router.post('/register', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;

    // Validate
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Check username đã tồn tại
    const pool = await getConnection();
    const existingUser = await pool.request()
      .input('username', sql.NVarChar(50), username)
      .query('SELECT id FROM Users WHERE username = @username');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const result = await pool.request()
      .input('username', sql.NVarChar(50), username)
      .input('password', sql.NVarChar(255), hashedPassword)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('email', sql.NVarChar(100), email || null)
      .input('phone', sql.NVarChar(20), phone || null)
      .input('role', sql.NVarChar(20), role || 'user')
      .query(`
        INSERT INTO Users (username, password, fullName, email, phone, role)
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.fullName, INSERTED.email, INSERTED.phone, INSERTED.role, INSERTED.isActive, INSERTED.createdAt
        VALUES (@username, @password, @fullName, @email, @phone, @role)
      `);

    res.status(201).json({
      message: 'Tạo user thành công',
      user: result.recordset[0]
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate
    if (!username || !password) {
      return res.status(400).json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' });
    }

    // Tìm user
    const pool = await getConnection();
    const result = await pool.request()
      .input('username', sql.NVarChar(50), username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const user = result.recordset[0];

    // Kiểm tra tài khoản có hoạt động không
    if (!user.isActive) {
      return res.status(401).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // Kiểm tra password (tạm thời so sánh trực tiếp vì chưa hash)
    // Sau này sẽ dùng: const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === 'admin123'; // Tạm thời

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Cập nhật lastLogin
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE Users SET lastLogin = GETDATE() WHERE id = @id');

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Trả về thông tin user (không trả password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - Lấy thông tin user hiện tại
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.user.id)
      .query('SELECT id, username, fullName, email, phone, role, isActive, createdAt, lastLogin FROM Users WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi lấy thông tin user:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users - Lấy danh sách users (chỉ admin)
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT id, username, fullName, email, phone, role, isActive, createdAt, lastLogin FROM Users ORDER BY role DESC, username');

    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách users:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id - Cập nhật user (chỉ admin)
router.put('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { fullName, email, phone, role, isActive } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('email', sql.NVarChar(100), email || null)
      .input('phone', sql.NVarChar(20), phone || null)
      .input('role', sql.NVarChar(20), role)
      .input('isActive', sql.Bit, isActive)
      .query(`
        UPDATE Users
        SET fullName = @fullName, email = @email, phone = @phone, role = @role, isActive = @isActive, updatedAt = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json({ message: 'Cập nhật user thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật user:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id - Xóa user (chỉ admin)
router.delete('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Users WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json({ message: 'Xóa user thành công' });
  } catch (err) {
    console.error('Lỗi xóa user:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile - Cập nhật thông tin cá nhân (user tự cập nhật)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user.id;

    // Validate
    if (!fullName) {
      return res.status(400).json({ error: 'Họ tên không được để trống' });
    }

    const pool = await getConnection();

    // Cập nhật thông tin (không cho phép sửa role và isActive)
    const result = await pool.request()
      .input('id', sql.Int, userId)
      .input('fullName', sql.NVarChar(100), fullName)
      .input('email', sql.NVarChar(100), email || null)
      .input('phone', sql.NVarChar(20), phone || null)
      .query(`
        UPDATE Users
        SET fullName = @fullName, email = @email, phone = @phone, updatedAt = GETDATE()
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.fullName, INSERTED.email, INSERTED.phone, INSERTED.role, INSERTED.isActive
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    res.json({
      message: 'Cập nhật thông tin thành công',
      user: result.recordset[0]
    });
  } catch (err) {
    console.error('Lỗi cập nhật profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export middleware để dùng ở routes khác
module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireRole = requireRole;
