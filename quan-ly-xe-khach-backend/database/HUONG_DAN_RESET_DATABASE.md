# HƯỚNG DẪN RESET VÀ CÀI ĐẶT LẠI DATABASE

## 📋 Mô tả

Script `complete_reset_and_setup.sql` sẽ:
- ✅ Xóa toàn bộ dữ liệu cũ (Bookings, TimeSlots, Drivers, Vehicles, Users, Customers)
- ✅ Cập nhật cấu trúc bảng (thêm cột `dropoffAddress`, `route`)
- ✅ Thêm dữ liệu mẫu mới cho ngày hôm nay (04-12-2025)

## ⚠️ CẢNH BÁO

**Script này sẽ XÓA TOÀN BỘ dữ liệu cũ!** Hãy backup database trước khi chạy.

## 🚀 Cách sử dụng

### Bước 1: Mở SQL Server Management Studio (SSMS)

1. Kết nối tới SQL Server
2. Chọn database: `VoCucPhuong_Data_TongHop`

### Bước 2: Chạy Script

1. Mở file: `complete_reset_and_setup.sql`
2. Nhấn **F5** hoặc click **Execute**
3. Đợi script chạy xong (khoảng 5-10 giây)

### Bước 3: Kiểm tra kết quả

Script sẽ hiển thị thông tin:
```
✅ Đã xóa tất cả bookings
✅ Đã xóa tất cả timeslots
✅ Đã thêm 6 tài xế
✅ Đã thêm 6 xe
✅ Đã thêm 4 user
✅ Đã tạo 60 timeslots cho ngày 04-12-2025
✅ Đã thêm 5 booking mẫu
```

### Bước 4: Khởi động lại Server Backend

```bash
# Trong terminal, tắt server cũ (Ctrl+C) rồi chạy:
cd quan-ly-xe-khach-backend
node server.js
```

### Bước 5: Reload trang web

1. Mở trình duyệt
2. Nhấn **Ctrl+Shift+R** (Windows) hoặc **Cmd+Shift+R** (Mac) để hard reload
3. Chọn ngày **04-12-2025** để xem dữ liệu mẫu

## 📊 Dữ liệu sau khi reset

### 1. Tài khoản Users (Đăng nhập hệ thống)

| Username   | Password  | Role    | Mô tả           |
|-----------|-----------|---------|-----------------|
| admin     | admin123  | admin   | Quản trị viên   |
| quanly1   | admin123  | manager | Quản lý         |
| nhanvien1 | admin123  | user    | Nhân viên 1     |
| nhanvien2 | admin123  | user    | Nhân viên 2     |

### 2. Drivers (Tài xế)

- TX Thanh Bắc (0918026316)
- TX. Phong M X (0912345678)
- TX. Minh (0987654321)
- TX. Hùng (0909123456)
- TX. Tuấn (0901234567)
- TX. Dũng (0923456789)

### 3. Vehicles (Xe)

- 60BO5307 - Xe 28G
- 51B26542 - Xe 28G
- 51B12345 - Xe 16G
- 60BO1234 - Xe 28G
- 51B11111 - Xe 28G
- 60BO9999 - Xe 16G

### 4. TimeSlots (Khung giờ)

**Ngày: 04-12-2025**

- **Tuyến Sài Gòn - Long Khánh**: 30 chuyến (05:30 - 20:00)
  - Chuyến đầu có tài xế: TX Thanh Bắc, xe 60BO5307
- **Tuyến Long Khánh - Sài Gòn**: 30 chuyến (03:30 - 18:00)
  - Chuyến đầu có tài xế: TX. Phong M X, xe 51B26542

### 5. Bookings (Vé mẫu)

**Chuyến 05:30 Sài Gòn → Long Khánh (3 vé)**
1. Nguyễn Văn An - 0376670275
   - Điểm trả: **BV Từ Dũ - Nguyễn Thị Minh Khai** ✨ (hiển thị địa chỉ cụ thể)
2. Trần Thị Bình - 0989347425
   - Điểm trả: **Ngã 4 Bình Thái** ✨ (hiển thị địa chỉ cụ thể)
3. Lê Văn Cường - 0912345678
   - Điểm đón: Nhà thọ Tân Bắc
   - Điểm trả: Tại bến

**Chuyến 03:30 Long Khánh → Sài Gòn (2 vé)**
1. Phạm Thị Duyên - 0901234567
   - Điểm trả: **Trường Chinh - Ngã 4 Bảy Hiền** ✨
2. Hoàng Văn Phong - 0923456789
   - Điểm đón: Chợ Long Khánh

## ✨ Tính năng mới

### 1. Hiển thị địa chỉ trả cụ thể

Trước đây:
```
Điểm trả: Dọc đường
```

Bây giờ:
```
Điểm trả: 5. BV Từ Dũ - Nguyễn Thị Minh Khai
```

### 2. Cột dropoffAddress trong database

Bảng `Bookings` đã có cột mới:
- `dropoffAddress NVARCHAR(500)` - Lưu địa chỉ trả cụ thể
- API đã được cập nhật để lưu và hiển thị đúng

## 🔧 Troubleshooting

### Lỗi: "Cannot drop the table because it is being referenced"

**Giải pháp**: Đảm bảo đã tắt tất cả kết nối tới database trước khi chạy script.

### Lỗi: "Database 'VoCucPhuong_Data_TongHop' does not exist"

**Giải pháp**:
1. Tạo database mới:
```sql
CREATE DATABASE [VoCucPhuong_Data_TongHop];
```
2. Chạy lại script

### Lỗi: "Invalid column name 'dropoffAddress'"

**Giải pháp**: Chạy lại phần BƯỚC 2 của script để thêm cột.

## 📝 Ghi chú

- Script tự động thêm các cột mới nếu chưa có
- Các ngày sau (05, 06, 07...) sẽ tự động tạo timeslots khi người dùng chọn
- Dữ liệu mẫu có thể xóa sau khi test xong

## 🎯 Bước tiếp theo

1. ✅ Test tính năng tạo booking mới
2. ✅ Kiểm tra hiển thị địa chỉ trả
3. ✅ Test chức năng sắp xếp theo địa chỉ
4. ✅ Test in danh sách hành khách
5. ✅ Test kéo thả sắp xếp thủ công

---

**Lưu ý**: Backup database trước khi chạy script trong môi trường production!
