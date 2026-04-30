const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// Thoi gian khoa ghe (10 phut = 600000ms)
const LOCK_DURATION_MINUTES = 10;

// GET - Lay tat ca locks hien tai (chua het han)
router.get('/', async (req, res) => {
  try {
    // Xoa cac lock het han truoc
    await query('DELETE FROM "TH_SeatLocks" WHERE "expiresAt" < NOW()');

    // Lay cac lock con hieu luc
    const result = await query(`
      SELECT * FROM "TH_SeatLocks" WHERE "expiresAt" > NOW()
      ORDER BY "lockedAt" DESC
    `);

    res.json(result);
  } catch (err) {
    console.error('Loi lay seat locks:', err);
    res.status(500).json({ error: 'Loi server', message: err.message });
  }
});

// GET - Lay locks theo ngay va tuyen
router.get('/by-date-route', async (req, res) => {
  try {
    const { date, route } = req.query;

    if (!date || !route) {
      return res.status(400).json({ error: 'Thieu thong tin date hoac route' });
    }

    // Xoa cac lock het han truoc
    await query('DELETE FROM "TH_SeatLocks" WHERE "expiresAt" < NOW()');

    // Lay cac lock con hieu luc cho ngay va tuyen cu the
    const result = await query(`
      SELECT * FROM "TH_SeatLocks"
      WHERE date = $1 AND route = $2 AND "expiresAt" > NOW()
    `, [date, route]);

    res.json(result);
  } catch (err) {
    console.error('Loi lay seat locks:', err);
    res.status(500).json({ error: 'Loi server', message: err.message });
  }
});

// DEV ONLY: Xoa tat ca locks (dung de test) - PHAI dat TRUOC route /:id
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await query('DELETE FROM "TH_SeatLocks" RETURNING id');
    res.json({
      success: true,
      message: `Da xoa ${result.length} locks`
    });
  } catch (err) {
    console.error('Loi xoa tat ca locks:', err);
    res.status(500).json({ error: 'Loi server', message: err.message });
  }
});

// DELETE - Xoa lock theo thong tin ghe (dung khi dong form hoac booking thanh cong)
// PHAI dat TRUOC route /:id
router.delete('/by-seat', async (req, res) => {
  try {
    const { timeSlotId, seatNumber, date, route, lockedBy } = req.body;

    console.log('Yeu cau xoa lock:', { timeSlotId, seatNumber, date, route, lockedBy });

    if (!timeSlotId || !seatNumber || !date || !route) {
      return res.status(400).json({ error: 'Thieu thong tin bat buoc' });
    }

    let sqlQuery = `
      DELETE FROM "TH_SeatLocks"
      WHERE "timeSlotId" = $1
      AND "seatNumber" = $2
      AND date = $3
      AND route = $4
    `;

    const values = [timeSlotId, seatNumber, date, route];

    // Neu co lockedBy, chi xoa lock cua nguoi do
    if (lockedBy) {
      sqlQuery += ' AND "lockedBy" = $5';
      values.push(lockedBy);
    }

    sqlQuery += ' RETURNING id';

    const result = await query(sqlQuery, values);

    console.log(`Da xoa ${result.length} lock cho ghe ${seatNumber}`);

    res.json({
      success: true,
      message: 'Da xoa lock',
      deleted: result.length
    });
  } catch (err) {
    console.error('Loi xoa seat lock:', err);
    res.status(500).json({ error: 'Loi server', message: err.message });
  }
});

// POST - Tao lock moi cho ghe
router.post('/', async (req, res) => {
  try {
    const { timeSlotId, seatNumber, lockedBy, lockedByUserId, date, route } = req.body;

    if (!timeSlotId || !seatNumber || !lockedBy || !date || !route) {
      return res.status(400).json({
        error: 'Thieu thong tin bat buoc',
        required: ['timeSlotId', 'seatNumber', 'lockedBy', 'date', 'route']
      });
    }

    // Xoa cac lock het han truoc
    await query('DELETE FROM "TH_SeatLocks" WHERE "expiresAt" < NOW()');

    // Kiem tra xem ghe da bi khoa chua
    const existingLock = await queryOne(`
      SELECT * FROM "TH_SeatLocks"
      WHERE "timeSlotId" = $1
      AND "seatNumber" = $2
      AND date = $3
      AND route = $4
      AND "expiresAt" > NOW()
    `, [timeSlotId, seatNumber, date, route]);

    if (existingLock) {
      // Neu cung nguoi khoa, gia han lock
      if (existingLock.lockedBy === lockedBy) {
        const newExpiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        await query(
          'UPDATE "TH_SeatLocks" SET "expiresAt" = $1 WHERE id = $2',
          [newExpiresAt, existingLock.id]
        );

        return res.json({
          success: true,
          message: 'Da gia han lock',
          lock: { ...existingLock, expiresAt: newExpiresAt }
        });
      }

      // Ghe da bi nguoi khac khoa
      return res.status(409).json({
        error: 'Ghe da bi khoa',
        lockedBy: existingLock.lockedBy,
        expiresAt: existingLock.expiresAt,
        message: `Ghe ${seatNumber} dang duoc ${existingLock.lockedBy} dien thong tin. Vui long chon ghe khac.`
      });
    }

    // Tao lock moi
    const expiresAt = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);

    const result = await query(`
      INSERT INTO "TH_SeatLocks" ("timeSlotId", "seatNumber", "lockedBy", "lockedByUserId", "expiresAt", date, route)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [timeSlotId, seatNumber, lockedBy, lockedByUserId || null, expiresAt, date, route]);

    res.status(201).json({
      success: true,
      message: `Da khoa ghe ${seatNumber} trong ${LOCK_DURATION_MINUTES} phut`,
      lock: result[0]
    });

  } catch (err) {
    console.error('Loi tao seat lock:', err);
    res.status(500).json({ error: 'Loi server', message: err.message });
  }
});

// DELETE - Xoa lock (khi huy hoac hoan tat booking)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await query('DELETE FROM "TH_SeatLocks" WHERE id = $1', [id]);

    res.json({ success: true, message: 'Da xoa lock' });
  } catch (err) {
    console.error('Loi xoa seat lock:', err);
    res.status(500).json({ error: 'Loi server', message: err.message });
  }
});

// POST - Xoa tat ca lock cua mot user (dung khi user logout hoac dong tab)
router.post('/release-all', async (req, res) => {
  try {
    const { lockedBy } = req.body;

    if (!lockedBy) {
      return res.status(400).json({ error: 'Thieu thong tin lockedBy' });
    }

    const result = await query(
      'DELETE FROM "TH_SeatLocks" WHERE "lockedBy" = $1 RETURNING id',
      [lockedBy]
    );

    res.json({
      success: true,
      message: `Da xoa ${result.length} lock cua ${lockedBy}`
    });
  } catch (err) {
    console.error('Loi xoa seat locks:', err);
    res.status(500).json({ error: 'Loi server', message: err.message });
  }
});

module.exports = router;
