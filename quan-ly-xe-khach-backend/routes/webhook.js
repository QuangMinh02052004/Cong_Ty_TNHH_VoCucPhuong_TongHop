const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../config/database');

// ===========================================
// WEBHOOK: NHAN BOOKING TU HE THONG DAT VE
// ===========================================
// POST /api/webhook/datve

router.post('/datve', async (req, res) => {
  try {
    console.log('[Webhook] Nhan booking tu Dat Ve:', req.body);

    const {
      bookingCode,
      customerName,
      customerPhone,
      date,
      departureTime,    // Khung gio (vi du: "9:30")
      seats,
      totalPrice,
      route,            // Tuyen (vi du: "Sai Gon -> Long Khanh")
      notes,
      source = 'DATVE'
    } = req.body;

    // Validate
    if (!customerName || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Thieu thong tin bat buoc',
        details: 'Can co customerName va customerPhone'
      });
    }

    // Convert date format: YYYY-MM-DD -> DD-MM-YYYY (format TongHop dung)
    let formattedDate = date || '';
    if (date && date.includes('-') && date.split('-')[0].length === 4) {
      // Date is YYYY-MM-DD, convert to DD-MM-YYYY
      const [year, month, day] = date.split('-');
      formattedDate = `${day}-${month}-${year}`;
      console.log('[Webhook] Converted date:', date, '->', formattedDate);
    }

    // Xac dinh tuyen tu route string
    let routeName = route || '';
    let pickupAddress = '';
    let dropoffAddress = '';

    // Parse route de xac dinh tuyen (diem tra mac dinh "Tai ben" cho tuyen co dinh)
    if (route) {
      if (route.includes('Sai Gon') && route.includes('Long Khanh')) {
        if (route.indexOf('Sai Gon') < route.indexOf('Long Khanh')) {
          // Sai Gon -> Long Khanh
          routeName = 'Sai Gon- Long Khanh';
        } else {
          // Long Khanh -> Sai Gon
          routeName = 'Long Khanh - Sai Gon';
        }
        // Tuyen co dinh: diem tra tai ben
        pickupAddress = '';
        dropoffAddress = '';
      }
    }

    // Tim TimeSlot phu hop theo khung gio va ngay
    let timeSlotId = null;
    if (departureTime && formattedDate) {
      console.log('[Webhook] Tim TimeSlot voi time:', departureTime, 'date:', formattedDate, 'route:', routeName);

      // Tim TimeSlot khop voi time, date va route (neu co)
      let timeSlotResult = null;

      if (routeName) {
        // Tim theo time, date va route
        timeSlotResult = await query(`
          SELECT id, route FROM "TH_TimeSlots"
          WHERE time = $1 AND date = $2 AND route = $3
          ORDER BY id
          LIMIT 1
        `, [departureTime, formattedDate, routeName]);
      }

      // Neu khong tim thay voi route, thu tim chi theo time va date
      if (!timeSlotResult || timeSlotResult.length === 0) {
        timeSlotResult = await query(`
          SELECT id, route FROM "TH_TimeSlots"
          WHERE time = $1 AND date = $2
          ORDER BY id
          LIMIT 1
        `, [departureTime, formattedDate]);
      }

      if (timeSlotResult && timeSlotResult.length > 0) {
        timeSlotId = timeSlotResult[0].id;
        console.log('[Webhook] Tim thay TimeSlot:', timeSlotId, '| Route:', timeSlotResult[0].route);
      } else {
        console.log('[Webhook] Khong tim thay TimeSlot cho time:', departureTime, 'date:', formattedDate);
      }
    }

    // Insert booking vao database
    const result = await query(`
      INSERT INTO "TH_Bookings" (
        "timeSlotId", phone, name, gender, nationality, "pickupMethod",
        "pickupAddress", "dropoffMethod", "dropoffAddress", note, "seatNumber", amount, paid,
        "timeSlot", date, route
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      timeSlotId,
      customerPhone || '',
      customerName || '',
      '',
      '',
      '',
      pickupAddress,
      '',
      dropoffAddress,
      `${bookingCode || ''} - ${customerName} - ${seats || 1} ghe${notes ? ' | ' + notes : ''}`,
      seats || 1,
      totalPrice || 0,
      0,
      departureTime || '',
      formattedDate || '',
      routeName
    ]);

    const newBooking = result[0];
    console.log('[Webhook] Da tao booking tu Dat Ve:', newBooking.id);

    res.status(201).json({
      success: true,
      message: 'Da nhan booking tu Dat Ve',
      data: {
        id: newBooking.id,
        customerName: newBooking.name,
        customerPhone: newBooking.phone,
        timeSlot: newBooking.timeSlot,
        date: newBooking.date,
        route: newBooking.route,
        seatNumber: newBooking.seatNumber
      }
    });

  } catch (err) {
    console.error('[Webhook] Loi nhan booking tu Dat Ve:', err);
    res.status(500).json({
      success: false,
      error: 'Loi server',
      message: err.message
    });
  }
});

// GET - Health check
router.get('/datve', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook Dat Ve endpoint is active',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
