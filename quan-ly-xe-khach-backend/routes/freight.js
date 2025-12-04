const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const { authenticateToken, requireRole } = require('./auth');

// GET /api/freight - Lấy danh sách hàng hóa
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, timeSlotId, fromDate, toDate } = req.query;
    const pool = await getConnection();

    let query = `
      SELECT
        f.*,
        ts.departure_time, ts.arrival_time, ts.route,
        ts.vehicle_plate, ts.driver_name,
        st1.station_name as pickup_station_name,
        st2.station_name as delivery_station_name,
        c.customer_name as sender_name, c.phone as sender_phone
      FROM Freight f
      LEFT JOIN TimeSlots ts ON f.time_slot_id = ts.id
      LEFT JOIN Stations st1 ON f.pickup_station_id = st1.id
      LEFT JOIN Stations st2 ON f.delivery_station_id = st2.id
      LEFT JOIN Customers c ON f.sender_customer_id = c.id
      WHERE 1=1
    `;

    const request = pool.request();

    if (status) {
      query += ' AND f.status = @status';
      request.input('status', sql.NVarChar(20), status);
    }

    if (timeSlotId) {
      query += ' AND f.time_slot_id = @timeSlotId';
      request.input('timeSlotId', sql.Int, parseInt(timeSlotId));
    }

    if (fromDate) {
      query += ' AND ts.departure_time >= @fromDate';
      request.input('fromDate', sql.DateTime, fromDate);
    }

    if (toDate) {
      query += ' AND ts.departure_time <= @toDate';
      request.input('toDate', sql.DateTime, toDate);
    }

    query += ' ORDER BY ts.departure_time DESC, f.created_at DESC';

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi lấy danh sách hàng hóa:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/freight/:id - Lấy chi tiết hàng hóa
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT
          f.*,
          ts.departure_time, ts.arrival_time, ts.route,
          ts.vehicle_plate, ts.driver_name,
          st1.station_name as pickup_station_name,
          st2.station_name as delivery_station_name,
          c1.customer_name as sender_name, c1.phone as sender_phone, c1.address as sender_address,
          c2.customer_name as receiver_name, c2.phone as receiver_phone, c2.address as receiver_address
        FROM Freight f
        LEFT JOIN TimeSlots ts ON f.time_slot_id = ts.id
        LEFT JOIN Stations st1 ON f.pickup_station_id = st1.id
        LEFT JOIN Stations st2 ON f.delivery_station_id = st2.id
        LEFT JOIN Customers c1 ON f.sender_customer_id = c1.id
        LEFT JOIN Customers c2 ON f.receiver_customer_id = c2.id
        WHERE f.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hàng hóa' });
    }

    res.json(result.recordset[0]);
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

    const pool = await getConnection();

    // Kiểm tra time slot còn tồn tại không
    const timeSlotCheck = await pool.request()
      .input('timeSlotId', sql.Int, time_slot_id)
      .query('SELECT id FROM TimeSlots WHERE id = @timeSlotId');

    if (timeSlotCheck.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chuyến xe' });
    }

    const result = await pool.request()
      .input('time_slot_id', sql.Int, time_slot_id)
      .input('sender_customer_id', sql.Int, sender_customer_id)
      .input('receiver_customer_id', sql.Int, receiver_customer_id || null)
      .input('pickup_station_id', sql.Int, pickup_station_id || null)
      .input('delivery_station_id', sql.Int, delivery_station_id || null)
      .input('description', sql.NVarChar(500), description)
      .input('weight', sql.Decimal(10, 2), weight || null)
      .input('size_length', sql.Decimal(10, 2), size_length || null)
      .input('size_width', sql.Decimal(10, 2), size_width || null)
      .input('size_height', sql.Decimal(10, 2), size_height || null)
      .input('quantity', sql.Int, quantity || 1)
      .input('freight_charge', sql.Decimal(10, 2), freight_charge || 0)
      .input('cod_amount', sql.Decimal(10, 2), cod_amount || 0)
      .input('special_instructions', sql.NVarChar(500), special_instructions || null)
      .input('receiver_name', sql.NVarChar(100), receiver_name || null)
      .input('receiver_phone', sql.NVarChar(20), receiver_phone || null)
      .input('receiver_address', sql.NVarChar(255), receiver_address || null)
      .input('created_by', sql.Int, req.user.id)
      .query(`
        INSERT INTO Freight (
          time_slot_id, sender_customer_id, receiver_customer_id,
          pickup_station_id, delivery_station_id, description,
          weight, size_length, size_width, size_height,
          quantity, freight_charge, cod_amount, special_instructions,
          receiver_name, receiver_phone, receiver_address,
          status, created_by
        )
        OUTPUT INSERTED.*
        VALUES (
          @time_slot_id, @sender_customer_id, @receiver_customer_id,
          @pickup_station_id, @delivery_station_id, @description,
          @weight, @size_length, @size_width, @size_height,
          @quantity, @freight_charge, @cod_amount, @special_instructions,
          @receiver_name, @receiver_phone, @receiver_address,
          'pending', @created_by
        )
      `);

    res.status(201).json({
      message: 'Tạo đơn hàng thành công',
      freight: result.recordset[0]
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

    const pool = await getConnection();

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('description', sql.NVarChar(500), description)
      .input('weight', sql.Decimal(10, 2), weight || null)
      .input('size_length', sql.Decimal(10, 2), size_length || null)
      .input('size_width', sql.Decimal(10, 2), size_width || null)
      .input('size_height', sql.Decimal(10, 2), size_height || null)
      .input('quantity', sql.Int, quantity)
      .input('freight_charge', sql.Decimal(10, 2), freight_charge)
      .input('cod_amount', sql.Decimal(10, 2), cod_amount || 0)
      .input('special_instructions', sql.NVarChar(500), special_instructions || null)
      .input('receiver_name', sql.NVarChar(100), receiver_name || null)
      .input('receiver_phone', sql.NVarChar(20), receiver_phone || null)
      .input('receiver_address', sql.NVarChar(255), receiver_address || null)
      .input('pickup_station_id', sql.Int, pickup_station_id || null)
      .input('delivery_station_id', sql.Int, delivery_station_id || null)
      .input('updated_by', sql.Int, req.user.id)
      .query(`
        UPDATE Freight
        SET
          description = @description,
          weight = @weight,
          size_length = @size_length,
          size_width = @size_width,
          size_height = @size_height,
          quantity = @quantity,
          freight_charge = @freight_charge,
          cod_amount = @cod_amount,
          special_instructions = @special_instructions,
          receiver_name = @receiver_name,
          receiver_phone = @receiver_phone,
          receiver_address = @receiver_address,
          pickup_station_id = @pickup_station_id,
          delivery_station_id = @delivery_station_id,
          updated_by = @updated_by,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
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

    const pool = await getConnection();

    // Cập nhật trạng thái
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.NVarChar(20), status)
      .input('updated_by', sql.Int, req.user.id)
      .query(`
        UPDATE Freight
        SET
          status = @status,
          ${status === 'picked_up' ? 'pickup_time = GETDATE(),' : ''}
          ${status === 'delivered' ? 'delivery_time = GETDATE(),' : ''}
          updated_by = @updated_by,
          updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
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
    const pool = await getConnection();

    // Kiểm tra trạng thái trước khi xóa
    const check = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT status FROM Freight WHERE id = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hàng hóa' });
    }

    const freight = check.recordset[0];
    if (freight.status !== 'pending' && freight.status !== 'cancelled') {
      return res.status(400).json({ error: 'Chỉ có thể xóa hàng hóa ở trạng thái chờ xử lý hoặc đã hủy' });
    }

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Freight WHERE id = @id');

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
    const pool = await getConnection();

    const request = pool.request();
    let dateFilter = '';

    if (fromDate && toDate) {
      dateFilter = 'AND f.created_at BETWEEN @fromDate AND @toDate';
      request.input('fromDate', sql.DateTime, fromDate);
      request.input('toDate', sql.DateTime, toDate);
    }

    const result = await request.query(`
      SELECT
        COUNT(*) as total_freight,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'picked_up' THEN 1 ELSE 0 END) as picked_up,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(freight_charge) as total_revenue,
        SUM(cod_amount) as total_cod
      FROM Freight f
      WHERE 1=1 ${dateFilter}
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi thống kê:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
