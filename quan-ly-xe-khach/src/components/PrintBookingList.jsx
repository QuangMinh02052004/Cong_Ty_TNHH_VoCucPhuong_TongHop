import { useBooking } from '../context/BookingContext';
import { findStationWithNumber } from '../data/stations';

const PrintBookingList = ({ onClose, sortedBookings, onPrinted }) => {
  const { selectedTrip, selectedDate, selectedRoute, updateBooking } = useBooking();

  // Lấy điểm lên (ưu tiên dropoffAddress với số trạm)
  const getPickupPoint = (booking) => {
    if (booking.dropoffAddress && booking.dropoffAddress.trim()) {
      const withNumber = findStationWithNumber(booking.dropoffAddress);
      return withNumber || booking.dropoffAddress;
    }
    return booking.dropoffMethod || 'Tại bến';
  };

  // Format ngày DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Hàm in - dùng iframe không mở tab mới
  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Danh Sách Hành Khách</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 15px;
          }

          .title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 12px;
          }

          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 0 30px;
          }

          .info-left, .info-right {
            display: table;
            font-size: 15px;
          }

          .info-row {
            display: table-row;
          }

          .info-label {
            display: table-cell;
            text-align: right;
            padding-right: 15px;
            padding-bottom: 4px;
            font-style: italic;
            color: #555;
            white-space: nowrap;
          }

          .info-value {
            display: table-cell;
            font-weight: bold;
            padding-bottom: 4px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
          }

          th, td {
            border: 1px solid #333;
            padding: 7px 10px;
            font-size: 16px;
            letter-spacing: 0.3px;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: left;
          }

          td {
            vertical-align: top;
          }

          .col-stt {
            text-align: center;
            font-weight: bold;
            width: 50px;
          }

          .col-diem-len {
            font-weight: bold;
            font-size: 17px;
            letter-spacing: 0.3px;
          }

          .col-phone {
            font-weight: bold;
            font-size: 17px;
            white-space: nowrap;
            letter-spacing: 0.5px;
          }

          .col-note {
            font-weight: bold;
            font-size: 16px;
            letter-spacing: 0.3px;
          }

          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="title">DANH SÁCH HÀNH KHÁCH</div>

        <div class="info-section">
          <div class="info-left">
            <div class="info-row">
              <span class="info-label">Tuyến</span>
              <span class="info-value">${selectedRoute || ''}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Giờ chạy</span>
              <span class="info-value">${selectedTrip?.time || ''} ${formatDate(selectedDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Biển số</span>
              <span class="info-value">${selectedTrip?.type || selectedTrip?.code || 'Xe 28G'}</span>
            </div>
          </div>
          <div class="info-right">
            <div class="info-row">
              <span class="info-label">Tài xế</span>
              <span class="info-value">${selectedTrip?.driver || ''}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phụ xe</span>
              <span class="info-value"></span>
            </div>
            <div class="info-row">
              <span class="info-label">Số vé</span>
              <span class="info-value">${sortedBookings.length}</span>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="col-stt">STT</th>
              <th>Điểm lên</th>
              <th>Số Điện Thoại</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${sortedBookings.map((booking) => `
              <tr>
                <td class="col-stt">${booking.seatNumber || ''}</td>
                <td class="col-diem-len">${getPickupPoint(booking)}</td>
                <td class="col-phone">${booking.phone || ''}</td>
                <td class="col-note">${booking.note || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // Đánh dấu đã in — gọi API để lưu vào DB (đồng bộ mọi máy)
      sortedBookings.forEach(b => {
        updateBooking(b.id, { printed: true }).catch(() => {});
      });
      if (onPrinted) {
        onPrinted(sortedBookings.map(b => b.id));
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Không in */}
        <div className="p-4 border-b flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold text-gray-800">In Danh Sách Hành Khách</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In danh sách
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-6 print:p-0">
          <div className="print:m-0 print:p-0">
            {/* Title */}
            <div className="text-center mb-3">
              <h1 className="text-xl font-bold">DANH SÁCH HÀNH KHÁCH</h1>
            </div>

            {/* Info 2 cột */}
            <div className="flex justify-between mb-4 px-8 text-sm">
              <div>
                <table className="border-0">
                  <tbody>
                    <tr>
                      <td className="pr-4 text-right italic text-gray-500 border-0 py-0.5">Tuyến</td>
                      <td className="font-bold border-0 py-0.5">{selectedRoute}</td>
                    </tr>
                    <tr>
                      <td className="pr-4 text-right italic text-gray-500 border-0 py-0.5">Giờ chạy</td>
                      <td className="font-bold border-0 py-0.5">{selectedTrip?.time} {formatDate(selectedDate)}</td>
                    </tr>
                    <tr>
                      <td className="pr-4 text-right italic text-gray-500 border-0 py-0.5">Biển số</td>
                      <td className="font-bold border-0 py-0.5">{selectedTrip?.type || selectedTrip?.code || 'Xe 28G'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="border-0">
                  <tbody>
                    <tr>
                      <td className="pr-4 text-right italic text-gray-500 border-0 py-0.5">Tài xế</td>
                      <td className="font-bold border-0 py-0.5">{selectedTrip?.driver || ''}</td>
                    </tr>
                    <tr>
                      <td className="pr-4 text-right italic text-gray-500 border-0 py-0.5">Phụ xe</td>
                      <td className="font-bold border-0 py-0.5"></td>
                    </tr>
                    <tr>
                      <td className="pr-4 text-right italic text-gray-500 border-0 py-0.5">Số vé</td>
                      <td className="font-bold border-0 py-0.5">{sortedBookings.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bảng */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-1.5 font-bold text-left text-base" style={{ width: '50px' }}>STT</th>
                  <th className="border border-gray-400 px-2 py-1.5 font-bold text-left text-base">Điểm lên</th>
                  <th className="border border-gray-400 px-2 py-1.5 font-bold text-left text-base" style={{ width: '170px' }}>Số Điện Thoại</th>
                  <th className="border border-gray-400 px-2 py-1.5 font-bold text-left text-base">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="border border-gray-400 px-2 py-1.5 text-center font-bold text-base">{booking.seatNumber || ''}</td>
                    <td className="border border-gray-400 px-2 py-1.5 font-bold text-base">{getPickupPoint(booking)}</td>
                    <td className="border border-gray-400 px-2 py-1.5 font-bold text-base">{booking.phone || ''}</td>
                    <td className="border border-gray-400 px-2 py-1.5 font-bold text-base">{booking.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body * { visibility: hidden !important; }
          .fixed, .fixed * { visibility: visible !important; }
          .fixed {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important;
            background: white !important;
            z-index: 9999 !important;
          }
          .print\\:hidden, .bg-black, button { display: none !important; }
          .rounded-lg, .max-w-7xl {
            max-width: 100% !important; width: 100% !important;
            margin: 0 !important; padding: 0 !important;
            border-radius: 0 !important; box-shadow: none !important;
          }
          .overflow-y-auto { overflow: visible !important; max-height: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PrintBookingList;
