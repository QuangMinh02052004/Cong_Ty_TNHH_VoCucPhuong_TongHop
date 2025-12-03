# Hướng dẫn tích hợp danh sách Stations (Địa điểm)

## Tổng quan
Hệ thống đã được cập nhật với danh sách đầy đủ 94 địa điểm đón/trả khách trên tuyến Sài Gòn - Long Khánh.

## Các thay đổi đã thực hiện

### 1. Frontend (React)
**File:** [quan-ly-xe-khach/src/components/RouteFilter.jsx](quan-ly-xe-khach/src/components/RouteFilter.jsx)

- Đã thêm danh sách 94 địa điểm vào component
- Hai dropdown "Địa điểm đón" và "Địa điểm trả" hiển thị tất cả các địa điểm
- Dữ liệu hiện đang được hardcode trong component (có thể chuyển sang lấy từ API sau)

### 2. Backend (Node.js + SQL Server)

#### Script SQL
**File:** [quan-ly-xe-khach-backend/database/stations.sql](quan-ly-xe-khach-backend/database/stations.sql)

Script tạo bảng `Stations` với cấu trúc:
- `StationID` (DECIMAL(5,1)): Mã địa điểm
- `StationName` (NVARCHAR(255)): Tên địa điểm
- `CreatedAt` (DATETIME): Thời gian tạo
- `UpdatedAt` (DATETIME): Thời gian cập nhật

#### API Endpoint
**File:** [quan-ly-xe-khach-backend/routes/stations.js](quan-ly-xe-khach-backend/routes/stations.js)

Endpoint: `http://localhost:5000/api/stations`

**Các API có sẵn:**
- `GET /api/stations` - Lấy tất cả địa điểm
- `GET /api/stations/:id` - Lấy một địa điểm theo ID
- `POST /api/stations` - Tạo địa điểm mới
- `PUT /api/stations/:id` - Cập nhật địa điểm
- `DELETE /api/stations/:id` - Xóa địa điểm

## Hướng dẫn sử dụng

### Bước 1: Chạy SQL Script

Có 3 cách để chạy script SQL:

#### Cách 1: SQL Server Management Studio (SSMS)
1. Mở SSMS và kết nối đến SQL Server
2. Mở file `quan-ly-xe-khach-backend/database/stations.sql`
3. Chọn database bạn đang sử dụng
4. Nhấn F5 hoặc Execute

#### Cách 2: Azure Data Studio
1. Mở Azure Data Studio
2. Kết nối đến SQL Server
3. Mở file `stations.sql`
4. Nhấn Run

#### Cách 3: Command Line
```bash
sqlcmd -S localhost -d TenDatabase -i quan-ly-xe-khach-backend/database/stations.sql
```

### Bước 2: Kiểm tra dữ liệu

Sau khi chạy script, kiểm tra bằng query:

```sql
-- Xem tất cả địa điểm
SELECT * FROM Stations ORDER BY StationID;

-- Đếm số lượng
SELECT COUNT(*) AS TotalStations FROM Stations;
-- Kết quả mong đợi: 94 địa điểm
```

### Bước 3: Test API

Khởi động backend server:
```bash
cd quan-ly-xe-khach-backend
npm start
```

Test API bằng browser hoặc Postman:
```
GET http://localhost:5000/api/stations
```

Kết quả trả về:
```json
[
  {
    "StationID": 1,
    "StationName": "An Đông",
    "CreatedAt": "2025-12-03T...",
    "UpdatedAt": "2025-12-03T..."
  },
  ...
]
```

### Bước 4: Tích hợp Frontend với API (Tùy chọn)

Nếu muốn lấy dữ liệu từ API thay vì hardcode, cập nhật RouteFilter.jsx:

```jsx
import React, { useState, useEffect } from 'react';

const RouteFilter = () => {
  const [stations, setStations] = useState([]);
  const [stationFrom, setStationFrom] = useState('');
  const [stationTo, setStationTo] = useState('');

  // Lấy danh sách stations từ API
  useEffect(() => {
    fetch('http://localhost:5000/api/stations')
      .then(res => res.json())
      .then(data => {
        setStations(data);
        // Set giá trị mặc định
        if (data.length > 0) {
          setStationFrom(data[0].StationName);
          setStationTo(data[data.length - 1].StationName);
        }
      })
      .catch(err => console.error('Lỗi lấy danh sách stations:', err));
  }, []);

  return (
    // ... JSX code giữ nguyên ...
  );
};
```

## Danh sách đầy đủ 94 địa điểm

1. An Đông
2. Ngã 4 Trần Phú-Lê Hồng Phong
3. Ngã 4 Trần Phú-Trần Bình Trọng
... (xem chi tiết trong file SQL)
94. Bến xe Long Khánh

## Lưu ý quan trọng

1. **StationID sử dụng DECIMAL(5,1)** vì có một số ID là số thập phân (7.1, 14.1, 44.1, v.v.)
2. **NVARCHAR** được sử dụng cho StationName để hỗ trợ tiếng Việt
3. Database hiện tại là **SQL Server** (kiểm tra file `.env` để xem connection string)
4. Frontend hiện đang sử dụng dữ liệu hardcode, có thể chuyển sang API sau

## Troubleshooting

### Lỗi: "Bảng Stations đã tồn tại"
- Script tự động kiểm tra và không tạo lại nếu bảng đã tồn tại
- Nếu muốn reset, uncomment dòng `DELETE FROM Stations;` trong script

### Lỗi: "Cannot connect to database"
- Kiểm tra file `.env` trong backend
- Đảm bảo SQL Server đang chạy
- Kiểm tra connection string

### API trả về lỗi 500
- Kiểm tra database đã có bảng Stations chưa
- Xem log trong terminal backend để biết chi tiết lỗi

## Liên hệ hỗ trợ

Nếu có vấn đề, vui lòng kiểm tra:
1. Logs trong terminal backend
2. Database connection trong file `.env`
3. Bảng Stations đã được tạo và có dữ liệu chưa
