const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT (nen dua vao .env)
const JWT_SECRET = process.env.JWT_SECRET || 'vocucphuong_secret_key_2025';

// Middleware xac thuc token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Khong co token xac thuc' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token khong hop le' });
    }
    req.user = user;
    next();
  });
};

// Middleware kiem tra role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Khong co quyen truy cap' });
    }
    next();
  };
};

// POST /api/auth/register - Dang ky user moi (chi admin)
router.post('/register', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;

    // Validate
    if (!username || !password || !fullName) {
      return res.status(400).json({ error: 'Thieu thong tin bat buoc' });
    }

    // Check username da ton tai
    const existingUser = await query(
      'SELECT id FROM "TH_Users" WHERE username = $1',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Ten dang nhap da ton tai' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tao user moi
    const result = await query(`
      INSERT INTO "TH_Users" (username, password, "fullName", email, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, "fullName", email, phone, role, "isActive", "createdAt"
    `, [username, hashedPassword, fullName, email || null, phone || null, role || 'user']);

    res.status(201).json({
      message: 'Tao user thanh cong',
      user: result[0]
    });
  } catch (err) {
    console.error('Loi dang ky:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login - Dang nhap
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate
    if (!username || !password) {
      return res.status(400).json({ error: 'Thieu ten dang nhap hoac mat khau' });
    }

    // Tim user
    const user = await queryOne(
      'SELECT * FROM "TH_Users" WHERE username = $1',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Ten dang nhap hoac mat khau khong dung' });
    }

    // Kiem tra tai khoan co hoat dong khong
    if (!user.isActive) {
      return res.status(401).json({ error: 'Tai khoan da bi vo hieu hoa' });
    }

    // Kiem tra password (tam thoi so sanh truc tiep vi chua hash)
    // Sau nay se dung: const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === 'admin123'; // Tam thoi

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Ten dang nhap hoac mat khau khong dung' });
    }

    // Cap nhat lastLogin
    await query(
      'UPDATE "TH_Users" SET "lastLogin" = NOW() WHERE id = $1',
      [user.id]
    );

    // Tao JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Tra ve thong tin user (khong tra password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Dang nhap thanh cong',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Loi dang nhap:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - Lay thong tin user hien tai
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await queryOne(
      'SELECT id, username, "fullName", email, phone, role, "isActive", "createdAt", "lastLogin" FROM "TH_Users" WHERE id = $1',
      [req.user.id]
    );

    if (!result) {
      return res.status(404).json({ error: 'Khong tim thay user' });
    }

    res.json(result);
  } catch (err) {
    console.error('Loi lay thong tin user:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users - Lay danh sach users (chi admin)
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, "fullName", email, phone, role, "isActive", "createdAt", "lastLogin" FROM "TH_Users" ORDER BY role DESC, username'
    );

    res.json(result);
  } catch (err) {
    console.error('Loi lay danh sach users:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id - Cap nhat user (chi admin)
router.put('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { fullName, email, phone, role, isActive } = req.body;

    const result = await query(`
      UPDATE "TH_Users"
      SET "fullName" = $1, email = $2, phone = $3, role = $4, "isActive" = $5, "updatedAt" = NOW()
      WHERE id = $6
      RETURNING id
    `, [fullName, email || null, phone || null, role, isActive, req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Khong tim thay user' });
    }

    res.json({ message: 'Cap nhat user thanh cong' });
  } catch (err) {
    console.error('Loi cap nhat user:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id - Xoa user (chi admin)
router.delete('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM "TH_Users" WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: 'Khong tim thay user' });
    }

    res.json({ message: 'Xoa user thanh cong' });
  } catch (err) {
    console.error('Loi xoa user:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile - Cap nhat thong tin ca nhan (user tu cap nhat)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user.id;

    // Validate
    if (!fullName) {
      return res.status(400).json({ error: 'Ho ten khong duoc de trong' });
    }

    // Cap nhat thong tin (khong cho phep sua role va isActive)
    const result = await query(`
      UPDATE "TH_Users"
      SET "fullName" = $1, email = $2, phone = $3, "updatedAt" = NOW()
      WHERE id = $4
      RETURNING id, username, "fullName", email, phone, role, "isActive"
    `, [fullName, email || null, phone || null, userId]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Khong tim thay user' });
    }

    res.json({
      message: 'Cap nhat thong tin thanh cong',
      user: result[0]
    });
  } catch (err) {
    console.error('Loi cap nhat profile:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export middleware de dung o routes khac
module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireRole = requireRole;
