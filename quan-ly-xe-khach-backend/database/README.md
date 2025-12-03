# Hướng dẫn sử dụng Database Scripts

## Cấu trúc Database

### Bảng Stations
Bảng lưu trữ thông tin các địa điểm đón/trả khách

**Cấu trúc:**
- `StationID` (DECIMAL(5,1), PRIMARY KEY): Mã địa điểm
- `StationName` (NVARCHAR(255)): Tên địa điểm
- `CreatedAt` (DATETIME): Thời gian tạo
- `UpdatedAt` (DATETIME): Thời gian cập nhật

## Cách chạy script

### 1. Sử dụng SQL Server Management Studio (SSMS)
1. Mở SSMS và kết nối đến SQL Server
2. Mở file `stations.sql`
3. Chọn database bạn muốn sử dụng
4. Nhấn F5 hoặc Execute để chạy script

### 2. Sử dụng Command Line
```bash
sqlcmd -S localhost -d TenDatabase -i stations.sql
```

### 3. Sử dụng Azure Data Studio
1. Mở Azure Data Studio
2. Kết nối đến SQL Server
3. Mở file `stations.sql`
4. Nhấn Run để thực thi

## Kiểm tra dữ liệu

Sau khi chạy script, bạn có thể kiểm tra bằng câu lệnh:

```sql
-- Xem tất cả địa điểm
SELECT * FROM Stations ORDER BY StationID;

-- Đếm số lượng địa điểm
SELECT COUNT(*) AS TotalStations FROM Stations;

-- Tìm kiếm địa điểm theo tên
SELECT * FROM Stations WHERE StationName LIKE N'%Long Khánh%';
```

## Cập nhật dữ liệu

Nếu cần cập nhật hoặc xóa dữ liệu cũ trước khi chạy lại script, bỏ comment dòng sau trong file SQL:

```sql
DELETE FROM Stations;
```

## Lưu ý
- Script sử dụng `N` prefix cho các string có tiếng Việt để đảm bảo encoding đúng
- StationID sử dụng kiểu DECIMAL(5,1) để hỗ trợ các ID thập phân như 7.1, 14.1, etc.
- Script có kiểm tra bảng đã tồn tại trước khi tạo mới
