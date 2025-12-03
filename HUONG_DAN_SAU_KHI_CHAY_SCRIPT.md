# HƯỚNG DẪN SAU KHI CHẠY SCRIPT TẠO TIMESLOTS

## Vấn đề: "Không thể thêm được timeslot"

Sau khi chạy script SQL để tạo timeslots, bạn cần làm các bước sau:

## Bước 1: RESTART Backend Server

```bash
# Tắt server backend (Ctrl+C trong terminal đang chạy)
# Sau đó khởi động lại:
cd quan-ly-xe-khach-backend
node server.js
```

## Bước 2: Clear Cache và Reload Frontend

```bash
# Trong trình duyệt:
1. Mở DevTools (F12)
2. Bấm chuột phải vào nút Reload
3. Chọn "Empty Cache and Hard Reload"

# Hoặc:
- Ctrl + Shift + R (Windows/Linux)
- Cmd + Shift + R (Mac)
```

## Bước 3: Kiểm tra Console Log

Mở Console trong DevTools (F12) và xem:

### Nếu thấy:
```
✅ Đã chuyển sang ngày XX-XX-XXXX, tuyến YYY, có 30 timeslots
```
→ **THÀNH CÔNG!** Timeslots đã có sẵn, không cần tạo mới

### Nếu thấy:
```
⚠️ Ngày XX-XX-XXXX, tuyến YYY chưa có timeslots, đang tạo...
❌ Lỗi tạo timeslots: ...
```
→ **LỖI!** Xem lỗi cụ thể và làm theo hướng dẫn dưới

## Bước 4: Kiểm tra Database

Chạy query sau trong SQL Server Management Studio:

```sql
-- Kiểm tra số lượng timeslots
SELECT
    [date] as [Ngày],
    [route] as [Tuyến],
    COUNT(*) as [Số timeslots]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
GROUP BY [date], [route]
ORDER BY [date], [route];

-- Kiểm tra cột route có tồn tại không
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TimeSlots' AND COLUMN_NAME = 'route';
```

### Kết quả mong đợi:
- Mỗi ngày + tuyến: 30 timeslots
- Cột `route` phải tồn tại trong bảng TimeSlots

## Các lỗi thường gặp:

### Lỗi 1: "Column 'route' does not exist"
**Nguyên nhân:** Chưa chạy migration để thêm cột route

**Giải pháp:** Chạy script:
```sql
ALTER TABLE [dbo].[TimeSlots] ADD [route] NVARCHAR(100) NULL;
ALTER TABLE [dbo].[Bookings] ADD [route] NVARCHAR(100) NULL;
```

### Lỗi 2: "Duplicate key violation"
**Nguyên nhân:** Đã có timeslots cho ngày + giờ đó rồi

**Giải pháp:**
- Option 1: Xóa timeslots cũ trước khi chạy script
- Option 2: Script đã có sẵn phần DELETE ở đầu

### Lỗi 3: "Cannot insert NULL"
**Nguyên nhân:** Trường bắt buộc bị NULL

**Giải pháp:** Kiểm tra script có đầy đủ giá trị:
- time: KHÔNG NULL
- date: KHÔNG NULL
- route: KHÔNG NULL (phải có giá trị 'Sài Gòn- Long Khánh' hoặc 'Long Khánh - Sài Gòn')
- type: KHÔNG NULL

## Kiểm tra API Backend

Mở Postman hoặc trình duyệt, test API:

```
GET http://localhost:5000/api/timeslots
```

Kết quả mong đợi: Danh sách timeslots với các trường:
```json
[
  {
    "id": 1,
    "time": "05:30",
    "date": "03-12-2025",
    "route": "Sài Gòn- Long Khánh",
    "type": "Xe 28G",
    "code": null,
    "driver": null,
    "phone": null
  },
  ...
]
```

## Nếu vẫn lỗi

Gửi cho tôi:
1. Screenshot của Console (F12 → Console tab)
2. Screenshot của Network tab (F12 → Network → lọc "timeslots")
3. Lỗi cụ thể từ backend terminal

---

## Tóm tắt các bước:

1. ✅ Chạy script SQL (create_timeslots_full_month.sql hoặc create_timeslots_full_year.sql)
2. 🔄 Restart backend server
3. 🔄 Clear cache + Hard reload trang web
4. 👁️ Kiểm tra Console log
5. ✅ Test: Chọn ngày → Timeslots xuất hiện ngay lập tức

---

## Lưu ý quan trọng:

- Sau khi chạy script, timeslots đã có sẵn trong database
- Code React chỉ tạo timeslots MỚI nếu ngày đó CHƯA có timeslots
- Nếu đã có rồi, nó sẽ LOAD từ database thay vì tạo mới
- Điều này giúp tránh duplicate và tăng tốc độ load trang
