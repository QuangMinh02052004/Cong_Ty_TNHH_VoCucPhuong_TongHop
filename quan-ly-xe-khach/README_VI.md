# 🚌 HỆ THỐNG QUẢN LÝ XE KHÁCH - TỔNG HỢP

Dự án này được xây dựng dựa trên giao diện của trang web **quantri.phanmemnhaxe.com**, nhằm tạo ra một hệ thống quản lý xe khách hiện đại và tổng hợp.

## 📋 MÔ TẢ DỰ ÁN

Hệ thống quản lý xe khách với các tính năng:
- 🎫 Đặt vé xe khách theo khung giờ
- 👤 Quản lý thông tin hành khách
- 💳 Quản lý thanh toán
- 🪑 Sơ đồ ghế ngồi
- 📊 Thống kê chuyến đi
- 🔄 Tích hợp với hệ thống nhập hàng và đặt vé online

## 🏗️ CẤU TRÚC DỰ ÁN

```
quan-ly-xe-khach/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Header với logo và menu
│   │   ├── RouteFilter.jsx         # Bộ lọc chuyến đi (ngày, tuyến, trạm)
│   │   ├── TimeSlots.jsx           # Lịch khởi hành (khung giờ)
│   │   ├── PassengerForm.jsx       # Form thông tin hành khách
│   │   ├── PaymentInfo.jsx         # Thông tin thanh toán
│   │   ├── SeatMap.jsx             # Sơ đồ ghế và danh sách hành khách
│   │   └── Timeline.jsx            # Timeline chuyến đi
│   ├── App.js                      # Component chính
│   └── index.css                   # Tailwind CSS config
├── tailwind.config.js              # Cấu hình Tailwind
└── package.json
```

## 🎨 GIAO DIỆN ĐÃ XÂY DỰNG

### 1. **Header/Navigation**
- Logo công ty với icon xe buýt
- Menu: Hành khách, Hàng hóa, Điều hành, CSKH
- Thông tin tổng đài và số dư tài khoản
- Icons thông báo, người dùng, cài đặt

### 2. **Bộ lọc chuyến đi** (RouteFilter)
- Chọn ngày (với nút prev/next)
- Dropdown loại xe
- Chọn tuyến đường
- Chọn trạm đi/đến với icon đổi chiều

### 3. **Lịch khởi hành** (TimeSlots)
- Grid hiển thị các khung giờ từ 05:30 - 20:00
- Mỗi ô hiển thị: Giờ, Ngày, Loại xe
- Trạng thái: Đã đặt (màu xanh) / Còn trống
- Hiển thị mã vé đã đặt (VD: 60BO5307)
- Click để chọn chuyến xe

### 4. **Form thông tin hành khách** (PassengerForm)
- Điện thoại (với icon tìm kiếm)
- Họ tên
- Giới tính (dropdown)
- Quốc tịch
- **Cách đón** (Dọc đường / Tại bến) - Quan trọng cho tích hợp
- Địa chỉ đón
- Cách trả
- Ghi chú
- Checkboxes: Ghế ưu đãi, Gửi SMS, In vé, In tem, Email, Zalo
- Tự động điền cho tất cả

### 5. **Thông tin thanh toán** (PaymentInfo)
- Thực thu
- Thu cọc/Thu tiếp
- Đã thu & Còn lại (tự động tính)
- Hình thức thanh toán (dropdown)
- Thông tin vé tổng hợp
- Buttons: Thu tiền, Giữ chỗ

### 6. **Sơ đồ ghế & Danh sách** (SeatMap)
- Tabs: Sơ đồ ghế, Danh sách vé, Phân tài, Hàng trên xe
- Grid ghế số 3-28 (có thể chọn)
- Cards hiển thị thông tin hành khách:
  - Số ghế
  - Tên và địa chỉ
  - Số điện thoại
  - Điểm đón/trả
  - Ghi chú
  - Nút gọi điện
- Bảng danh sách hành khách chi tiết

### 7. **Timeline chuyến đi** (Timeline)
- Thông tin chuyến: Biển số, Tài xế, SĐT
- Thanh tiến trình từ trạm đi → trạm đến
- Hiển thị giờ khởi hành và dự kiến đến
- Thống kê: Xe hợp đồng, Đón tại nhà, Dọc đường, Tại bến, Trung chuyển

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

### Yêu cầu
- Node.js (v14 trở lên)
- npm hoặc yarn

### Cài đặt

1. Di chuyển vào thư mục dự án:
```bash
cd quan-ly-xe-khach
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm start
```

Ứng dụng sẽ mở tại: `http://localhost:3000`

### Build cho Production
```bash
npm run build
```

## 🔗 TÍCH HỢP VỚI CÁC HỆ THỐNG KHÁC

### 1. Tích hợp với Hệ thống Nhập Hàng
**Luồng dữ liệu:**
- Khi khách hàng chọn **"Cách đón = Dọc đường"** trong hệ thống Nhập Hàng
- Thông tin sẽ được gửi qua API đến hệ thống Tổng Hợp này
- Tự động điền vào ô có khung giờ tương ứng trong `TimeSlots`

**API Endpoint (cần xây dựng sau):**
```
POST /api/bookings/from-nhaphang
Body: {
  passengerName: string,
  phone: string,
  pickupAddress: string,
  timeSlot: string,
  note: string
}
```

### 2. Tích hợp với Hệ thống Đặt Vé Online
**Luồng dữ liệu:**
- Khi khách đặt vé online
- Thông tin tự động chuyển sang hệ thống Tổng Hợp
- Điền vào khung giờ tương ứng

**API Endpoint (cần xây dựng sau):**
```
POST /api/bookings/from-online
Body: {
  passengerName: string,
  phone: string,
  email: string,
  timeSlot: string,
  seatNumber: number,
  paymentStatus: string
}
```

## 💾 DATABASE (SQL SERVER)

### Thông tin kết nối:
- **Server:** localhost:1433
- **Tool:** Azure Data Studio
- **Database:** QLXK_TongHop (cần tạo)

### Các bảng cần thiết (Sẽ thiết kế sau):

1. **Trips** (Chuyến xe)
   - TripID
   - DepartureTime
   - Route
   - VehicleNumber
   - DriverID
   - Status

2. **Bookings** (Đặt vé)
   - BookingID
   - TripID
   - PassengerName
   - Phone
   - PickupMethod (Dọc đường/Tại bến)
   - PickupAddress
   - SeatNumber
   - Amount
   - PaymentStatus
   - Source (NhapHang/Online/Direct)

3. **Passengers** (Hành khách)
   - PassengerID
   - Name
   - Phone
   - Email
   - Address

4. **Payments** (Thanh toán)
   - PaymentID
   - BookingID
   - Amount
   - PaymentMethod
   - Status

## 📦 CÔNG NGHỆ SỬ DỤNG

- **Frontend:** React 18
- **Styling:** Tailwind CSS
- **Icons:** React Icons
- **Date Handling:** date-fns
- **Backend (Tương lai):** Node.js + Express
- **Database:** Microsoft SQL Server
- **ORM (Tương lai):** Sequelize hoặc TypeORM

## 📝 TÍNH NĂNG ĐÃ HOÀN THÀNH

- ✅ Giao diện Header với navigation
- ✅ Bộ lọc chuyến đi (ngày, tuyến, trạm)
- ✅ Lịch khởi hành với grid khung giờ
- ✅ Form thông tin hành khách đầy đủ
- ✅ Thông tin thanh toán với tính toán tự động
- ✅ Sơ đồ ghế và danh sách hành khách
- ✅ Timeline chuyến đi với thống kê
- ✅ Responsive design (desktop, tablet, mobile)

## 🔜 TÍNH NĂNG CẦN PHÁT TRIỂN TIẾP

1. **Backend API**
   - Xây dựng REST API với Node.js + Express
   - Kết nối SQL Server
   - Authentication & Authorization

2. **Database**
   - Thiết kế schema chi tiết
   - Tạo stored procedures
   - Setup migrations

3. **Tích hợp**
   - API nhận dữ liệu từ Hệ thống Nhập Hàng
   - API nhận dữ liệu từ Hệ thống Đặt Vé Online
   - WebSocket cho real-time updates

4. **Tính năng nâng cao**
   - In vé PDF
   - Gửi SMS/Email tự động
   - Báo cáo thống kê
   - Quản lý tài xế và phụ xe
   - Quản lý hàng hóa

## 👨‍💻 PHÁT TRIỂN BỞI

Lê Quang Minh - Công Ty TNHH Võ Cúc Phương

## 📞 LIÊN HỆ

- Hotline: 1900 7034
- Email: support@nhaxe.com

---

**Lưu ý:** Đây mới chỉ là giao diện frontend. Cần phát triển thêm backend, database và tích hợp API để hệ thống hoạt động đầy đủ.
