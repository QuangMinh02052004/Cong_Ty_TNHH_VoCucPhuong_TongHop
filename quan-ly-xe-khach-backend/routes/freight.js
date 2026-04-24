const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');
const { authenticateToken, requireRole } = require('./auth');

// GET /api/freight - Lấy danh sách hàng hóa
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, timeSlotId, fromDate, toDate } = req.query;

    let sqlQuery = `
      SELECT
        f.*,
        ts.departure_time, ts.arrival_time, ts.route,
        ts.vehicle_plate, ts.driver_name,
        st1.station_name as pickup_station_name,
        st2.station_name as delivery_station_name,
        c.customer_name as sender_name, c.phone as sender_phone
      FROM "TH_Freight" f
      LEFT JOIN "TH_TimeSlots" ts ON f.time_slot_id = ts.id
      LEFT JOIN "TH_Stations" st1 ON f.pickup_station_id = st1.id
      LEFT JOIN "TH_Stations" st2 ON f.delivery_station_id = st2.id
      LEFT JOIN "TH_Customers" c ON f.sender_customer_id = c.id
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (status) {
      sqlQuery += ` AND f.status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (timeSlotId) {
      sqlQuery += ` AND f.time_slot_id = $${paramIndex}`;
      values.push(parseInt(timeSlotId));
      paramIndex++;
    }

    if (fromDate) {
      sqlQuery += ` AND ts.departure_time >= $${paramIndex}`;
      values.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      sqlQuery += ` AND ts.departure_time <= $${paramIndex}`;
      values.push(toDate);
      paramIndex++;
    }

    sqlQuery += ' ORDER BY ts.departure_time DESC, f.created_at DESC';

    const result = await query(sqlQuery, values);
    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy danh sách hàng hóa:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freight/:id - Lấy chi tiết hàng hóa
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await queryOne(`
      SELECT
        f.*,
        ts.departure_time, ts.arrival_time, ts.route,
        ts.vehicle_plate, ts.driver_name,
        st1.station_name as pickup_station_name,
        st2.station_name as delivery_station_name,
        c1.customer_name as sender_name, c1.phone as sender_phone, c1.address as sender_address,
        c2.customer_name as receiver_name, c2.phone as receiver_phone, c2.address as receiver_address
      FROM "TH_Freight" f
      LEFT JOIN "TH_TimeSlots" ts ON f.time_slot_id = ts.id
      LEFT JOIN "TH_Stations" st1 ON f.pickup_station_id = st1.id
      LEFT JOIN "TH_Stations" st2 ON f.delivery_station_id = st2.id
      LEFT JOIN "TH_Customers" c1 ON f.sender_customer_id = c1.id
      LEFT JOIN "TH_Customers" c2 ON f.receiver_customer_id = c2.id
      WHERE f.id = $1
    `, [req.params.id]);

    if (!result) {
      return res.status(404).json({ error: 'Không tìm thấy hàng hóa' });
    }

    res.json(result);
  } catch (err) {
    console.error('Lỗi lấy chi tiết hàng hóa:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/freight - Tạo đơn hàng mới
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      time_slot_id,
      sender_customer_id,
      receiver_customer_id,
      pickup_station_id,
      delivery_station_id,
      description,
      weight,
      size_length,
      size_width,
      size_height,
      quantity,
      freight_charge,
      cod_amount,
      special_instructions,
      receiver_name,
      receiver_phone,
      receiver_address
    } = req.body;

    // Validate required fields
    if (!time_slot_id || !sender_customer_id || !description) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra time slot còn tồn tại không
    const timeSlotCheck = await query(
      'SELECT id FROM "TH_TimeSlots" WHERE id = $1',
      [time_slot_id]
    );

    if (timeSlotCheck.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chuyến xe' });
    }

    const result = await query(`
      INSERT INTO "TH_Freight" (
        time_slot_id, sender_customer_id, receiver_customer_id,
        pickup_station_id, delivery_station_id, description,
        weight, size_length, size_width, size_height,
        quantity, freight_charge, cod_amount, special_instructions,
        receiver_name, receiver_phone, receiver_address,
        status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'pending', $18)
      RETURNING *
    `, [
      time_slot_id,
      sender_customer_id,
      receiver_customer_id || null,
      pickup_station_id || null,
      delivery_station_id || null,
      description,
      weight || null,
      size_length || null,
      size_width || null,
      size_height || null,
      quantity || 1,
      freight_charge || 0,
      cod_amount || 0,
      special_instructions || null,
      receiver_name || null,
      receiver_phone || null,
      receiver_address || null,
      req.user.id
    ]);

    res.status(201).json({
      message: 'Tạo đơn hàng thành công',
      freight: result[0]
    });
  } catch (err) {
    console.error('Lỗi tạo đơn hàng:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/freight/:id - Cập nhật thông tin hàng hóa
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      description,
      weight,
      size_length,
      size_width,
      size_height,
      quantity,
      freight_charge,
      cod_amount,
      special_instructions,
      receiver_name,
      receiver_phone,
      receiver_address,
      pickup_station_id,
      delivery_station_id
    } = req.body;

    const result = await query(`
      UPDATE "TH_Freight"
      SET
        description = $1,
        weight = $2,
        size_length = $3,
        size_width = $4,
        size_height = $5,
        quantity = $6,
        freight_charge = $7,
        cod_amount = $8,
        special_instructions = $9,
        receiver_name = $10,
        receiver_phone = $11,
        receiver_address = $12,
        pickup_station_id = $13,
        delivery_station_id = $14,
        updated_by = $15,
        updated_at = NOW()
      WHERE id = $16
      RETURNING id
    `, [
      description,
      weight || null,
      size_length || null,
      size_width || null,
      size_height || null,
      quantity,
      freight_charge,
      cod_amount || 0,
      special_instructions || null,
      receiver_name || null,
      receiver_phone || null,
      receiver_address || null,
      pickup_station_id || null,
      delivery_station_id || null,
      req.user.id,
      req.params.id
    ]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hàng hóa' });
    }

    res.json({ message: 'Cập nhật thông tin hàng hóa thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật hàng hóa:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/freight/:id/status - Cập nhật trạng thái hàng hóa
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    // Build dynamic query based on status
    let sqlQuery = `
      UPDATE "TH_Freight"
      SET
        status = $1,
        ${status === 'picked_up' ? 'pickup_time = NOW(),' : ''}
        ${status === 'delivered' ? 'delivery_time = NOW(),' : ''}
        updated_by = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING id
    `;

    const result = await query(sqlQuery, [status, req.user.id, req.params.id]);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hàng hóa' });
    }

    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/freight/:id - Xóa đơn hàng
router.delete('/:id', authenticateToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    // Kiểm tra trạng thái trước khi xóa
    const check = await queryOne(
      'SELECT status FROM "TH_Freight" WHERE id = $1',
      [req.params.id]
    );

    if (!check) {
      return res.status(404).json({ error: 'Không tìm thấy hàng hóa' });
    }

    if (check.status !== 'pending' && check.status !== 'cancelled') {
      return res.status(400).json({ error: 'Chỉ có thể xóa hàng hóa ở trạng thái chờ xử lý hoặc đã hủy' });
    }

    await query('DELETE FROM "TH_Freight" WHERE id = $1', [req.params.id]);

    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    console.error('Lỗi xóa hàng hóa:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freight/stats/summary - Thống kê tổng quan
router.get('/stats/summary', authenticateToken, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    let sqlQuery = `
      SELECT
        COUNT(*) as total_freight,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'picked_up' THEN 1 ELSE 0 END) as picked_up,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(freight_charge) as total_revenue,
        SUM(cod_amount) as total_cod
      FROM "TH_Freight" f
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (fromDate && toDate) {
      sqlQuery += ` AND f.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      values.push(fromDate, toDate);
    }

    const result = await query(sqlQuery, values);
    res.json(result[0]);
  } catch (err) {
    console.error('Lỗi thống kê:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
