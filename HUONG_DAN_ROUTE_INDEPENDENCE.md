# Hướng dẫn: Tính năng Độc lập dữ liệu theo Tuyến đường

## 📋 Tổng quan

Tính năng này giúp tách biệt hoàn toàn dữ liệu giữa 2 tuyến đường:
- **Sài Gòn- Long Khánh**
- **Long Khánh - Sài Gòn**

Mỗi tuyến sẽ có:
- ✅ Timeslots riêng biệt
- ✅ Bookings riêng biệt
- ✅ Dữ liệu độc lập (giống như độc lập theo ngày)

## 🔧 Các thay đổi đã thực hiện

### 1. **BookingContext.js**
- ➕ Thêm state `selectedRoute` (mặc định: 'Sài Gòn- Long Khánh')
- 🔄 Cập nhật `currentDayTimeSlots` để lọc theo cả **ngày** và **tuyến**
- 🔄 Cập nhật `currentDayBookings` để lọc theo cả **ngày** và **tuyến**
- 🔄 useEffect theo dõi cả `selectedDate` và `selectedRoute`
- 🔄 `createTimeSlotsForDate()` nhận thêm tham số `route`
- 🔄 `addBooking()` tự động thêm `route` vào booking mới

### 2. **RouteFilter.jsx**
- 🔄 Sử dụng `selectedRoute` và `setSelectedRoute` từ context
- 🔄 Dropdown tuyến đường cập nhật state global

### 3. **Database Migration**
- 📄 Tạo file: `add_route_column.sql`
- Thêm cột `route` vào bảng `TimeSlots`
- Thêm cột `route` vào bảng `Bookings`

## 🚀 Cách chạy Migration

### Bước 1: Chạy SQL Script
```sql
-- Mở SQL Server Management Studio (SSMS)
-- Mở file: quan-ly-xe-khach-backend/database/add_route_column.sql
-- Chạy toàn bộ script (F5)
```

### Bước 2: Xác nhận kết quả
Script sẽ:
1. Thêm cột `route NVARCHAR(100)` vào bảng `TimeSlots`
2. Thêm cột `route NVARCHAR(100)` vào bảng `Bookings`
3. Cập nhật giá trị mặc định `'Sài Gòn- Long Khánh'` cho các record hiện tại
4. Hiển thị cấu trúc bảng sau khi migration

### Bước 3: Khởi động lại Backend
```bash
# Dừng backend hiện tại (Ctrl+C)
cd quan-ly-xe-khach-backend
node server.js
```

### Bước 4: Khởi động lại Frontend
```bash
# Dừng frontend hiện tại (Ctrl+C)
cd quan-ly-xe-khach
npm start
```

## 🎯 Cách hoạt động

### Khi chuyển tuyến đường:
1. **User chọn tuyến** → Cập nhật `selectedRoute` trong context
2. **useEffect kích hoạt** → Reset toàn bộ state (ghế, form, trip)
3. **Kiểm tra timeslots** → Lọc theo `date` + `route`
4. **Nếu chưa có timeslots** → Tự động tạo 30 khung giờ mới cho tuyến đó
5. **Hiển thị dữ liệu** → Chỉ hiển thị timeslots + bookings của tuyến được chọn

### Ví dụ:
```
Ngày: 03-12-2025
Tuyến: Sài Gòn- Long Khánh
→ Hiển thị: 30 timeslots + bookings của "Sài Gòn- Long Khánh" ngày 03-12-2025

[User chuyển tuyến]

Ngày: 03-12-2025
Tuyến: Long Khánh - Sài Gòn
→ Hiển thị: 30 timeslots + bookings của "Long Khánh - Sài Gòn" ngày 03-12-2025
```

## 📊 Cấu trúc dữ liệu mới

### TimeSlots Table
```
id | time  | date       | route                  | type    | code | driver | phone
1  | 05:30 | 03-12-2025 | Sài Gòn- Long Khánh   | Xe 28G  | ...  | ...    | ...
2  | 06:00 | 03-12-2025 | Sài Gòn- Long Khánh   | Xe 28G  | ...  | ...    | ...
3  | 05:30 | 03-12-2025 | Long Khánh - Sài Gòn  | Xe 28G  | ...  | ...    | ...
4  | 06:00 | 03-12-2025 | Long Khánh - Sài Gòn  | Xe 28G  | ...  | ...    | ...
```

### Bookings Table
```
id | name      | phone       | seatNumber | timeSlot | date       | route                  | timeSlotId
1  | Nguyễn A  | 0901234567  | 1          | 05:30    | 03-12-2025 | Sài Gòn- Long Khánh   | 1
2  | Trần B    | 0912345678  | 2          | 05:30    | 03-12-2025 | Long Khánh - Sài Gòn  | 3
```

## ✅ Kiểm tra tính năng

1. **Test chuyển tuyến cùng ngày:**
   - Chọn ngày 03-12-2025, tuyến "Sài Gòn- Long Khánh"
   - Đặt vài vé
   - Chuyển sang tuyến "Long Khánh - Sài Gòn"
   - ✅ Các vé trước đó không còn hiển thị
   - ✅ Ghế đều trống

2. **Test tạo timeslots tự động:**
   - Chọn tuyến "Long Khánh - Sài Gòn"
   - Chọn ngày mới chưa có timeslots
   - ✅ Tự động tạo 30 timeslots cho tuyến đó

3. **Test độc lập dữ liệu:**
   - Tạo booking ở tuyến "Sài Gòn- Long Khánh", ghế 5, giờ 06:00
   - Chuyển sang tuyến "Long Khánh - Sài Gòn"
   - Tạo booking ở giờ 06:00, ghế 5
   - ✅ Cả 2 booking đều tồn tại độc lập

## ⚠️ Lưu ý quan trọng

1. **Phải chạy migration trước** khi sử dụng tính năng này
2. **Dữ liệu cũ** sẽ được gán mặc định vào tuyến "Sài Gòn- Long Khánh"
3. **Backend phải hỗ trợ** cột `route` trong API (timeSlotAPI, bookingAPI)
4. **Tên tuyến phải khớp chính xác** (bao gồm cả khoảng trắng và dấu gạch ngang)

## 🐛 Troubleshooting

### Lỗi: "Cannot read property 'route' of undefined"
**Nguyên nhân:** Chưa chạy migration
**Giải pháp:** Chạy file `add_route_column.sql`

### Lỗi: Timeslots không hiển thị
**Nguyên nhân:** Dữ liệu cũ chưa có cột `route`
**Giải pháp:**
1. Xóa tất cả timeslots cũ: chạy `delete_all_timeslots.sql`
2. Để hệ thống tự động tạo lại timeslots mới

### Lỗi: Bookings bị mất
**Nguyên nhân:** Bookings cũ chưa có giá trị `route`
**Giải pháp:**
```sql
UPDATE [dbo].[Bookings]
SET [route] = N'Sài Gòn- Long Khánh'
WHERE [route] IS NULL;
```

## 📝 Changelog

**Version 2.0** (03-12-2025)
- ✅ Thêm độc lập dữ liệu theo tuyến đường
- ✅ Tự động tạo timeslots cho từng tuyến
- ✅ Reset state khi chuyển tuyến
- ✅ Lọc bookings theo tuyến

**Version 1.0** (Trước đó)
- ✅ Độc lập dữ liệu theo ngày
- ✅ Lịch âm dương
- ✅ Tự động tạo timeslots
