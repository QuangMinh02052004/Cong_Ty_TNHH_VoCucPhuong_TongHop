import { useBooking } from '../context/BookingContext';
import { findStationWithNumber } from '../data/stations';

const PrintBookingList = ({ onClose, sortedBookings }) => {
  const { selectedTrip, selectedDate, selectedRoute } = useBooking();

  // Lấy địa chỉ giao (ưu tiên dropoffAddress, nếu không có thì dùng dropoffMethod)
  const getDeliveryAddress = (booking) => {
    if (booking.dropoffAddress && booking.dropoffAddress.trim()) {
      const withNumber = findStationWithNumber(booking.dropoffAddress);
      return withNumber || booking.dropoffAddress;
    }
    return booking.dropoffMethod || 'Tại bến';
  };

  // Hàm in - dùng iframe không mở tab mới
  const handlePrint = () => {
    // Tạo iframe ẩn
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
            size: A4 landscape;
            margin: 10mm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 10px;
          }

          .header {
            text-align: center;
            margin-bottom: 15px;
          }

          .header h1 {
            font-size: 20px;
            margin-bottom: 5px;
          }

          .header p {
            font-size: 11px;
            margin: 2px 0;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            border: 1px solid #666;
            padding: 4px 6px;
            font-size: 10px;
          }

          th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
          }

          td {
            vertical-align: top;
          }

          .stt {
            text-align: center;
            font-weight: bold;
          }

          .footer {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
          }

          .signature {
            text-align: center;
          }

          .signature p {
            margin: 5px 0;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>DANH SÁCH HÀNH KHÁCH</h1>
          <p><strong>Tuyến:</strong> ${selectedRoute}</p>
          <p><strong>Giờ chạy:</strong> ${selectedTrip?.time} | <strong>Ngày:</strong> ${selectedDate}</p>
          <p><strong>Biển số:</strong> ${selectedTrip?.code || 'N/A'} | <strong>Tài xế:</strong> ${selectedTrip?.driver || 'N/A'}</p>
          <p><strong>Số vé:</strong> ${sortedBookings.length} | <strong>Dọc đường:</strong> ${sortedBookings.filter(b => b.pickupMethod === 'Dọc đường' || b.dropoffMethod === 'Dọc đường').length} | <strong>Tại bến:</strong> ${sortedBookings.filter(b => (b.pickupMethod === 'Tại bến' || !b.pickupAddress) && (b.dropoffMethod === 'Tại bến' || !b.dropoffAddress)).length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px">STT</th>
              <th style="width: 150px">Họ tên</th>
              <th style="width: 100px">Điện thoại</th>
              <th style="width: 250px">Điểm trả</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            ${sortedBookings.map((booking, index) => `
              <tr>
                <td class="stt">${index + 1}</td>
                <td><strong>${booking.name}</strong></td>
                <td style="text-align: center">${booking.phone}</td>
                <td><strong>${getDeliveryAddress(booking)}</strong></td>
                <td style="font-size: 9px">${booking.note || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="signature">
            <p><strong>Lái xe:</strong> ___________________________</p>
            <p style="margin-top: 5px; color: #666;">(Ký và ghi rõ họ tên)</p>
          </div>
          <div class="signature">
            <p><strong>Người lập:</strong> ___________________________</p>
            <p style="margin-top: 5px; color: #666;">(Ký và ghi rõ họ tên)</p>
          </div>
          <div class="signature">
            <p><strong>Quản lý:</strong> ___________________________</p>
            <p style="margin-top: 5px; color: #666;">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Ghi nội dung vào iframe
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(printContent);
    doc.close();

    // Đợi load xong rồi in
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Xóa iframe sau khi in xong
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

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 print:p-0">
          {/* Phần in ra giấy - Hiển thị trực tiếp */}
          <div className="print:m-0 print:p-0">
            {/* Header thông tin chuyến */}
            <div className="text-center mb-6 print:mb-4">
              <h1 className="text-2xl font-bold mb-2 print:mb-1">DANH SÁCH HÀNH KHÁCH</h1>
              <div className="text-sm space-y-1">
                <p><strong>Tuyến:</strong> {selectedRoute}</p>
                <p><strong>Giờ chạy:</strong> {selectedTrip?.time} | <strong>Ngày:</strong> {selectedDate}</p>
                <p><strong>Biển số:</strong> {selectedTrip?.code || 'N/A'} | <strong>Tài xế:</strong> {selectedTrip?.driver || 'N/A'}</p>
                <p><strong>Số vé:</strong> {sortedBookings.length} | <strong>Dọc đường:</strong> {sortedBookings.filter(b => b.pickupMethod === 'Dọc đường' || b.dropoffMethod === 'Dọc đường').length} | <strong>Tại bến:</strong> {sortedBookings.filter(b => (b.pickupMethod === 'Tại bến' || !b.pickupAddress) && (b.dropoffMethod === 'Tại bến' || !b.dropoffAddress)).length}</p>
              </div>
            </div>

            {/* Bảng danh sách - Dạng Excel */}
            <table className="w-full border-collapse" style={{ fontSize: '10px' }}>
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-1 font-bold" style={{ width: '30px' }}>STT</th>
                  <th className="border border-gray-400 p-1 font-bold" style={{ width: '150px' }}>Họ tên</th>
                  <th className="border border-gray-400 p-1 font-bold" style={{ width: '100px' }}>Điện thoại</th>
                  <th className="border border-gray-400 p-1 font-bold" style={{ width: '250px' }}>Điểm trả</th>
                  <th className="border border-gray-400 p-1 font-bold">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.map((booking, index) => (
                  <tr key={booking.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-400 p-1 text-center font-semibold">{index + 1}</td>
                    <td className="border border-gray-400 p-1 font-semibold">{booking.name}</td>
                    <td className="border border-gray-400 p-1 text-center">{booking.phone}</td>
                    <td className="border border-gray-400 p-1 font-semibold" style={{ fontSize: '9px' }}>{getDeliveryAddress(booking)}</td>
                    <td className="border border-gray-400 p-1" style={{ fontSize: '8px' }}>{booking.note || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="mt-6 flex justify-between text-xs">
              <div>
                <p><strong>Lái xe:</strong> ___________________________</p>
                <p className="mt-2 text-gray-600">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p><strong>Người lập:</strong> ___________________________</p>
                <p className="mt-2 text-gray-600">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p><strong>Quản lý:</strong> ___________________________</p>
                <p className="mt-2 text-gray-600">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          /* Ẩn tất cả */
          body * {
            visibility: hidden !important;
          }

          /* Hiển thị modal và content */
          .fixed, .fixed * {
            visibility: visible !important;
          }

          /* Reset modal */
          .fixed {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            z-index: 9999 !important;
          }

          /* Ẩn nút, overlay */
          .print\\:hidden,
          .bg-black,
          button {
            display: none !important;
          }

          /* Reset containers */
          .rounded-lg,
          .max-w-7xl {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          /* Content */
          .overflow-y-auto {
            overflow: visible !important;
            max-height: none !important;
          }

          /* Typography */
          h1 {
            font-size: 18px !important;
            margin-bottom: 8px !important;
          }

          p {
            font-size: 10px !important;
            margin: 2px 0 !important;
          }

          /* Table */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }

          th, td {
            border: 1px solid #333 !important;
            padding: 4px !important;
            font-size: 10px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          th {
            background-color: #e0e0e0 !important;
            font-weight: bold !important;
          }

          tr {
            page-break-inside: avoid !important;
          }

          thead {
            display: table-header-group !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintBookingList;
