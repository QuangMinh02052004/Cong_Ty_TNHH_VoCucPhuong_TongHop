-- =============================================
-- SCRIPT HOÀN CHỈNH: Reset Database và Tạo Dữ Liệu Mới
-- Hệ Thống Quản Lý Xe Khách - Võ Cúc Phương
-- Ngày cập nhật: 04-12-2025
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🗑️  BƯỚC 1: XÓA TẤT CẢ DỮ LIỆU CŨ';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Tắt kiểm tra foreign key
ALTER TABLE Bookings NOCHECK CONSTRAINT ALL;
GO

-- Xóa dữ liệu cũ
DELETE FROM Bookings;
PRINT '✅ Đã xóa tất cả bookings';

DELETE FROM TimeSlots;
PRINT '✅ Đã xóa tất cả timeslots';

DELETE FROM Drivers;
PRINT '✅ Đã xóa tất cả drivers';

DELETE FROM Vehicles;
PRINT '✅ Đã xóa tất cả vehicles';

DELETE FROM Users;
PRINT '✅ Đã xóa tất cả users';

DELETE FROM Customers;
PRINT '✅ Đã xóa tất cả customers';
GO

-- Bật lại kiểm tra foreign key
ALTER TABLE Bookings CHECK CONSTRAINT ALL;
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🔧 BƯỚC 2: CẬP NHẬT CẤU TRÚC BẢNG';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Thêm cột dropoffAddress vào Bookings nếu chưa có
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'dropoffAddress'
)
BEGIN
    ALTER TABLE Bookings ADD dropoffAddress NVARCHAR(500);
    PRINT '✅ Đã thêm cột dropoffAddress vào bảng Bookings';
END
ELSE
BEGIN
    PRINT '⚠️ Cột dropoffAddress đã tồn tại';
END
GO

-- Thêm cột route vào TimeSlots nếu chưa có
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'TimeSlots' AND COLUMN_NAME = 'route'
)
BEGIN
    ALTER TABLE TimeSlots ADD route NVARCHAR(100);
    PRINT '✅ Đã thêm cột route vào bảng TimeSlots';
END
ELSE
BEGIN
    PRINT '⚠️ Cột route đã tồn tại';
END
GO

-- Thêm cột route vào Bookings nếu chưa có
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'route'
)
BEGIN
    ALTER TABLE Bookings ADD route NVARCHAR(100);
    PRINT '✅ Đã thêm cột route vào bảng Bookings';
END
ELSE
BEGIN
    PRINT '⚠️ Cột route đã tồn tại';
END
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '👥 BƯỚC 3: THÊM DỮ LIỆU DRIVERS';
PRINT '═══════════════════════════════════════════════════════════════';
GO

INSERT INTO Drivers (name, phone) VALUES
    (N'TX Thanh Bắc', '0918026316'),
    (N'TX. Phong M X', '0912345678'),
    (N'TX. Minh', '0987654321'),
    (N'TX. Hùng', '0909123456'),
    (N'TX. Tuấn', '0901234567'),
    (N'TX. Dũng', '0923456789');
GO

PRINT '✅ Đã thêm 6 tài xế';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🚌 BƯỚC 4: THÊM DỮ LIỆU VEHICLES';
PRINT '═══════════════════════════════════════════════════════════════';
GO

INSERT INTO Vehicles (code, type) VALUES
    ('60BO5307', N'Xe 28G'),
    ('51B26542', N'Xe 28G'),
    ('51B12345', N'Xe 16G'),
    ('60BO1234', N'Xe 28G'),
    ('51B11111', N'Xe 28G'),
    ('60BO9999', N'Xe 16G');
GO

PRINT '✅ Đã thêm 6 xe';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '👤 BƯỚC 5: THÊM DỮ LIỆU USERS (Tài khoản hệ thống)';
PRINT '═══════════════════════════════════════════════════════════════';
GO

INSERT INTO Users (username, password, fullName, email, phone, role, isActive) VALUES
    ('admin', 'admin123', N'Quản Trị Viên', 'admin@vocucphuong.com', '0900000000', 'admin', 1),
    ('quanly1', 'admin123', N'Nguyễn Văn A', 'quanly1@vocucphuong.com', '0900000001', 'manager', 1),
    ('nhanvien1', 'admin123', N'Trần Thị B', 'nhanvien1@vocucphuong.com', '0900000002', 'user', 1),
    ('nhanvien2', 'admin123', N'Lê Văn C', 'nhanvien2@vocucphuong.com', '0900000003', 'user', 1);
GO

PRINT '✅ Đã thêm 4 user (admin/quanly1/nhanvien1/nhanvien2 - password: admin123)';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📅 BƯỚC 6: TẠO TIMESLOTS CHO NGÀY 04-12-2025';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Tạo cho tuyến Sài Gòn- Long Khánh (05:30 - 20:00)
INSERT INTO TimeSlots ([time], [date], [route], [type], [code], [driver], [phone]) VALUES
    ('05:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', '60BO5307', N'TX Thanh Bắc', '0918026316'),
    ('06:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('06:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('07:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('07:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('08:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('08:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('09:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('09:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('10:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('10:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('11:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('11:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('12:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('12:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('13:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('13:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('14:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('14:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('15:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('15:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('16:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('16:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('17:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('17:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('18:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('18:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('19:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('19:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('20:00', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL);
GO

-- Tạo cho tuyến Long Khánh - Sài Gòn (03:30 - 18:00)
INSERT INTO TimeSlots ([time], [date], [route], [type], [code], [driver], [phone]) VALUES
    ('03:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', '51B26542', N'TX. Phong M X', '0912345678'),
    ('04:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('04:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('05:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('05:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('06:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('06:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('07:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('07:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('08:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('08:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('09:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('09:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('10:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('10:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('11:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('11:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('12:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('12:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('13:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('13:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('14:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('14:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('15:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('15:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('16:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('16:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('17:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('17:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('18:00', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL);
GO

PRINT '✅ Đã tạo 60 timeslots cho ngày 04-12-2025 (30 mỗi tuyến)';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🎫 BƯỚC 7: THÊM DỮ LIỆU MẪU BOOKINGS';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Lấy timeSlotId của chuyến 05:30 Sài Gòn - Long Khánh
DECLARE @timeSlotId1 INT;
SELECT @timeSlotId1 = id FROM TimeSlots WHERE [time] = '05:30' AND [date] = '04-12-2025' AND [route] = N'Sài Gòn- Long Khánh';

-- Thêm 3 booking mẫu cho chuyến này
INSERT INTO Bookings (
    timeSlotId, phone, name, gender, nationality,
    pickupMethod, pickupAddress,
    dropoffMethod, dropoffAddress,
    note, seatNumber, amount, paid,
    timeSlot, date, route
) VALUES
(
    @timeSlotId1, '0376670275', N'Nguyễn Văn An', 'male', N'Việt Nam',
    N'Tại bến', N'',
    N'Dọc đường', N'BV Từ Dũ - Nguyễn Thị Minh Khai',
    N'Giao loan 1 thùng bông', 1, 150000, 150000,
    '05:30', '04-12-2025', N'Sài Gòn- Long Khánh'
),
(
    @timeSlotId1, '0989347425', N'Trần Thị Bình', 'female', N'Việt Nam',
    N'Tại bến', N'',
    N'Dọc đường', N'Ngã 4 Bình Thái',
    N'', 2, 150000, 100000,
    '05:30', '04-12-2025', N'Sài Gòn- Long Khánh'
),
(
    @timeSlotId1, '0912345678', N'Lê Văn Cường', 'male', N'Việt Nam',
    N'Dọc đường', N'Nhà thọ Tân Bắc',
    N'Tại bến', N'',
    N'Khách VIP', 3, 150000, 150000,
    '05:30', '04-12-2025', N'Sài Gòn- Long Khánh'
);
GO

-- Lấy timeSlotId của chuyến 03:30 Long Khánh - Sài Gòn
DECLARE @timeSlotId2 INT;
SELECT @timeSlotId2 = id FROM TimeSlots WHERE [time] = '03:30' AND [date] = '04-12-2025' AND [route] = N'Long Khánh - Sài Gòn';

-- Thêm 2 booking mẫu cho chuyến này
INSERT INTO Bookings (
    timeSlotId, phone, name, gender, nationality,
    pickupMethod, pickupAddress,
    dropoffMethod, dropoffAddress,
    note, seatNumber, amount, paid,
    timeSlot, date, route
) VALUES
(
    @timeSlotId2, '0901234567', N'Phạm Thị Duyên', 'female', N'Việt Nam',
    N'Tại bến', N'',
    N'Dọc đường', N'Trường Chinh - Ngã 4 Bảy Hiền',
    N'', 1, 150000, 150000,
    '03:30', '04-12-2025', N'Long Khánh - Sài Gòn'
),
(
    @timeSlotId2, '0923456789', N'Hoàng Văn Phong', 'male', N'Việt Nam',
    N'Dọc đường', N'Chợ Long Khánh',
    N'Tại bến', N'',
    N'Gọi trước 10 phút', 2, 150000, 50000,
    '03:30', '04-12-2025', N'Long Khánh - Sài Gòn'
);
GO

PRINT '✅ Đã thêm 5 booking mẫu';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📊 BƯỚC 8: THỐNG KÊ KẾT QUẢ';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Thống kê tổng quan
SELECT 'Drivers' as [Bảng], COUNT(*) as [Số lượng] FROM Drivers
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM Vehicles
UNION ALL
SELECT 'Users', COUNT(*) FROM Users
UNION ALL
SELECT 'TimeSlots', COUNT(*) FROM TimeSlots
UNION ALL
SELECT 'Bookings', COUNT(*) FROM Bookings;
GO

-- Thống kê timeslots theo tuyến
SELECT
    [route] as [Tuyến đường],
    COUNT(*) as [Số chuyến],
    MIN([time]) as [Giờ đầu],
    MAX([time]) as [Giờ cuối]
FROM TimeSlots
WHERE [date] = '04-12-2025'
GROUP BY [route];
GO

-- Thống kê bookings
SELECT
    [route] as [Tuyến đường],
    [timeSlot] as [Giờ],
    COUNT(*) as [Số vé],
    SUM([amount]) as [Tổng tiền],
    SUM([paid]) as [Đã thu]
FROM Bookings
WHERE [date] = '04-12-2025'
GROUP BY [route], [timeSlot]
ORDER BY [route], [timeSlot];
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '✅ ✅ ✅ HOÀN TẤT RESET VÀ SETUP DATABASE! ✅ ✅ ✅';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '';
PRINT '📋 Đã tạo:';
PRINT '   • 6 Drivers (Tài xế)';
PRINT '   • 6 Vehicles (Xe)';
PRINT '   • 4 Users (Tài khoản: admin, quanly1, nhanvien1, nhanvien2)';
PRINT '   • 60 TimeSlots cho ngày 04-12-2025';
PRINT '   • 5 Bookings mẫu';
PRINT '';
PRINT '🔐 Tài khoản đăng nhập:';
PRINT '   • Username: admin     | Password: admin123 | Role: admin';
PRINT '   • Username: quanly1   | Password: admin123 | Role: manager';
PRINT '   • Username: nhanvien1 | Password: admin123 | Role: user';
PRINT '';
PRINT '🎯 Các tính năng mới:';
PRINT '   • ✅ Đã có cột dropoffAddress trong Bookings';
PRINT '   • ✅ Hiển thị địa chỉ trả cụ thể thay vì "Dọc đường"';
PRINT '   • ✅ Hỗ trợ 2 tuyến: Sài Gòn-Long Khánh & Long Khánh-Sài Gòn';
PRINT '';
PRINT '🚀 Bước tiếp theo:';
PRINT '   1. Khởi động lại backend server (đã có sẵn)';
PRINT '   2. Reload trang web (Ctrl+Shift+R)';
PRINT '   3. Chọn ngày 04-12-2025 để xem dữ liệu mẫu';
PRINT '   4. Tạo booking mới và kiểm tra hiển thị địa chỉ trả';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
GO
