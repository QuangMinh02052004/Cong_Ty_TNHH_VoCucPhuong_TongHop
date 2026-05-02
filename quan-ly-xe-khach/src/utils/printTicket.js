// Print 1 vé khách: HTML A6, QR code via api.qrserver.com (free, no auth)
const fmtVND = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0));

export function printTicketWithQR(booking, opts = {}) {
  const id = booking.id;
  const qrPayload = JSON.stringify({
    id, route: booking.route, date: booking.date, ts: booking.timeSlot, seat: booking.seatNumber,
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrPayload)}`;
  const totalDebt = (Number(booking.amount) || 0) - (Number(booking.paid) || 0);

  const html = `
<!DOCTYPE html>
<html lang="vi"><head><meta charset="utf-8"><title>Vé ${id}</title>
<style>
  @page { size: 100mm 150mm; margin: 5mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #1f2937; padding: 0; margin: 0; }
  .ticket { border: 2px dashed #94a3b8; padding: 12px 14px; border-radius: 8px; }
  h1 { margin: 0 0 4px; font-size: 16px; color: #0369a1; text-align: center; }
  .sub { font-size: 10px; color: #64748b; text-align: center; margin-bottom: 8px; }
  .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; border-bottom: 1px dotted #e2e8f0; }
  .row b { color: #0f172a; font-weight: 600; }
  .seat { font-size: 28px; font-weight: 700; color: #0ea5e9; text-align: center; margin: 6px 0; }
  .qr { text-align: center; margin: 8px 0 4px; }
  .qr img { width: 110px; height: 110px; }
  .total { background: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 8px; margin: 6px 0; font-size: 12px; }
  .debt { background: #fef2f2; border-left: 3px solid #ef4444; padding: 6px 8px; font-size: 11px; color: #b91c1c; }
  .footer { font-size: 9px; color: #94a3b8; text-align: center; margin-top: 6px; }
  @media print { body { padding: 0; } }
</style></head>
<body>
  <div class="ticket">
    <h1>VÕ CÚC PHƯƠNG</h1>
    <div class="sub">Vé khách — ${booking.date} · ${booking.timeSlot || ''}</div>
    <div class="seat">GHẾ ${booking.seatNumber}</div>
    <div class="row"><span>Tuyến</span><b>${booking.route || ''}</b></div>
    <div class="row"><span>Hành khách</span><b>${booking.name || ''}</b></div>
    <div class="row"><span>SĐT</span><b>${booking.phone || ''}</b></div>
    ${booking.dropoffAddress ? `<div class="row"><span>Điểm trả</span><b>${booking.dropoffAddress}</b></div>` : ''}
    ${booking.note ? `<div class="row"><span>Ghi chú</span><b>${booking.note}</b></div>` : ''}
    <div class="total"><b>${fmtVND(booking.amount)}đ</b> &nbsp;·&nbsp; Đã thu: <b>${fmtVND(booking.paid)}đ</b></div>
    ${totalDebt > 0 ? `<div class="debt">Còn nợ: <b>${fmtVND(totalDebt)}đ</b></div>` : ''}
    <div class="qr"><img src="${qrUrl}" alt="QR" onerror="this.style.display='none'"/></div>
    <div class="footer">Mã: ${id} · ${new Date().toLocaleString('vi-VN')}</div>
  </div>
  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); ${opts.closeAfter !== false ? "setTimeout(() => window.close(), 500);" : ""} }, 400);
    });
  </script>
</body></html>`;

  const win = window.open('', '_blank', 'width=420,height=640');
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}
