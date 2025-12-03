# CÁC BƯỚC THỰC HIỆN ĐỂ HOÀN TẤT SETUP

## 📋 Tóm tắt vấn đề đã fix:
- ✅ Đã tạo script SQL để tạo timeslots cho nhiều ngày
- ✅ Đã sửa lỗi hàm `addNewTimeSlot` thiếu trường `route`
- ✅ Logic auto-create đã hoàn thiện

---

## 🚀 CÁC BƯỚC THỰC HIỆN (QUAN TRỌNG):

### BƯỚC 1: Chạy Script SQL

Chọn 1 trong 2 script:

**Option A - Tháng 12/2025 (nhanh, cho test):**
```sql
-- Chạy file: quan-ly-xe-khach-backend/database/create_timeslots_full_month.sql
-- Tạo timeslots từ 03-12-2025 đến 31-12-2025 (29 ngày)
-- Tổng: 1,740 timeslots
-- Thời gian: ~30 giây
```

**Option B - Cả năm 2025-2026 (cho production):**
```sql
-- Chạy file: quan-ly-xe-khach-backend/database/create_timeslots_full_year.sql
-- Tạo timeslots từ 03-12-2025 đến 30-11-2026 (~365 ngày)
-- Tổng: ~21,900 timeslots
-- Thời gian: ~2-3 phút
```

**Cách chạy:**
1. Mở SQL Server Management Studio
2. Connect vào database `VoCucPhuong_Data_TongHop`
3. File → Open → File → Chọn script
4. Execute (F5)
5. Đợi đến khi thấy "✅ HOÀN TẤT!"

---

### BƯỚC 2: Restart Backend Server

```bash
# Terminal đang chạy backend:
# Bấm Ctrl+C để tắt

# Sau đó khởi động lại:
cd quan-ly-xe-khach-backend
node server.js
```

**Kết quả mong đợi:**
```
Server running on port 5000
```

---

### BƯỚC 3: Reload Frontend

```bash
# Trong trình duyệt:
1. Mở DevTools (F12)
2. Console tab → Xóa console (Clear)
3. Bấm Ctrl+Shift+R (Hard Reload)
```

---

### BƯỚC 4: Kiểm tra kết quả

Sau khi reload, trong Console bạn sẽ thấy:

```
✅ Đã load dữ liệu từ database:
   timeSlots: 1740 (hoặc 21900 nếu chạy full year)
   bookings: ...
   drivers: ...
   vehicles: ...

📅 Các ngày có timeslots trong database: ['03-12-2025', '04-12-2025', ...]
```

**Thử chọn ngày:**
1. Chọn tuyến: "Sài Gòn- Long Khánh"
2. Chọn ngày: 03-12-2025
3. Kết quả: Sẽ thấy **30 timeslots** xuất hiện ngay lập tức

**Console sẽ hiển thị:**
```
✅ Đã chuyển sang ngày 03-12-2025, tuyến Sài Gòn- Long Khánh, có 30 timeslots
```

---

### BƯỚC 5: Test tính năng tự động tạo (nếu chọn ngày mới)

Nếu bạn chạy script tháng 12, thử chọn ngày **01-01-2026** (chưa có trong database):

**Console sẽ hiển thị:**
```
⚠️ Ngày 01-01-2026, tuyến Sài Gòn- Long Khánh chưa có timeslots, đang tạo...
📋 Sử dụng template Sài Gòn- Long Khánh (05:30 - 20:00)
✅ Đã tạo 30 timeslots cho ngày 01-01-2026, tuyến Sài Gòn- Long Khánh
```

→ Timeslots sẽ **TỰ ĐỘNG TẠO** cho ngày mới!

---

## 🎯 KẾT QUẢ CUỐI CÙNG:

✅ **Database có sẵn timeslots cho nhiều ngày**
- Không cần đợi khi chọn ngày đã có sẵn
- Load tức thì, trải nghiệm mượt mà

✅ **Tự động tạo cho ngày mới**
- Khi chọn ngày chưa có trong database
- Tự động tạo 30 timeslots với khung giờ phù hợp cho từng tuyến

✅ **Có thể thêm timeslot thủ công**
- Hàm addNewTimeSlot đã được sửa
- Tự động lấy date và route hiện tại đang chọn

---

## ❗ NẾU VẪN GẶP LỖI:

### Lỗi: "Column 'route' does not exist"
→ Chưa chạy migration, hãy chạy script ở BƯỚC 1

### Lỗi: "Cannot insert duplicate key"
→ Database đã có timeslots rồi, không cần chạy lại script

### Lỗi: "Cannot insert NULL"
→ Check backend logs để xem trường nào bị NULL

### Lỗi: Console không hiển thị gì
→ Check Network tab (F12) xem API có gọi thành công không

---

## 📝 GHI CHÚ:

- Script SQL có phần **DELETE** để xóa timeslots cũ trước khi tạo mới
- Nếu đã có booking cho ngày đó, **KHÔNG NÊN XÓA** timeslots
- Để tạo thêm cho năm sau, chạy lại script và sửa ngày bắt đầu/kết thúc

---

## 🔍 DEBUG:

Nếu cần debug, check các file log:

1. **Backend logs:** Terminal đang chạy `node server.js`
2. **Frontend logs:** Browser Console (F12 → Console)
3. **Database logs:** SQL Server Management Studio → Query Results

---

## ✅ CHECKLIST:

- [ ] Đã chạy script SQL thành công
- [ ] Đã restart backend server
- [ ] Đã reload frontend (Ctrl+Shift+R)
- [ ] Console hiển thị số lượng timeslots đúng
- [ ] Chọn ngày có sẵn → Timeslots hiển thị ngay
- [ ] Chọn ngày mới → Tự động tạo timeslots
- [ ] Có thể thêm booking bình thường

---

**Nếu tất cả đều OK → HOÀN TẤT! 🎉**
