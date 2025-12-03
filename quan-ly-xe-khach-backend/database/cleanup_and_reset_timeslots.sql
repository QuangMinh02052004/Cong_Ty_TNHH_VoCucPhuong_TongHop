-- =============================================
-- Script XÓA TẤT CẢ TIMESLOTS VÀ ĐỂ HỆ THỐNG TỰ TẠO LẠI
-- Hoặc tạo lại timeslots cho ngày cụ thể
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🗑️  XÓA TẤT CẢ TIMESLOTS TRONG DATABASE';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Xóa tất cả timeslots
DELETE FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

PRINT '✅ Đã xóa tất cả timeslots';
PRINT '';
GO

-- Kiểm tra
SELECT COUNT(*) as [Tổng số timeslots còn lại]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🎯  TÙY CHỌN: Tạo lại timeslots cho ngày 03-12-2025';
PRINT '     (Hoặc bỏ qua và để hệ thống tự động tạo khi bạn chọn ngày)';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- OPTION 1: Không tạo gì cả - Để hệ thống tự động tạo khi bạn chọn ngày
-- → Uncomment dòng dưới và comment toàn bộ phần INSERT bên dưới
-- PRINT '⏭️  Bỏ qua - Để hệ thống tự động tạo timeslots';
-- GO

-- OPTION 2: Tạo sẵn cho ngày 03-12-2025
PRINT '';
PRINT '➕ Đang tạo timeslots cho ngày 03-12-2025...';
GO

-- Tạo cho tuyến Sài Gòn- Long Khánh (05:30 - 20:00)
INSERT INTO [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots] ([time], [date], [route], [type], [code], [driver], [phone])
VALUES
    ('05:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('06:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('06:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('07:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('07:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('08:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('08:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('09:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('09:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('10:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('10:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('11:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('11:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('12:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('12:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('13:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('13:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('14:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('14:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('15:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('15:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('16:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('16:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('17:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('17:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('18:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('18:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('19:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('19:30', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
    ('20:00', '03-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL);
GO

PRINT '✅ Đã tạo 30 timeslots cho Sài Gòn- Long Khánh';
GO

-- Tạo cho tuyến Long Khánh - Sài Gòn (03:30 - 18:00)
INSERT INTO [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots] ([time], [date], [route], [type], [code], [driver], [phone])
VALUES
    ('03:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('04:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('04:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('05:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('05:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('06:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('06:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('07:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('07:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('08:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('08:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('09:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('09:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('10:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('10:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('11:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('11:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('12:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('12:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('13:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('13:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('14:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('14:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('15:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('15:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('16:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('16:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('17:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('17:30', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
    ('18:00', '03-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL);
GO

PRINT '✅ Đã tạo 30 timeslots cho Long Khánh - Sài Gòn';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📊  KẾT QUẢ CUỐI CÙNG';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Thống kê theo tuyến
SELECT
    [route] as [Tuyến],
    [date] as [Ngày],
    COUNT(*) as [Số timeslots],
    MIN([time]) as [Giờ đầu],
    MAX([time]) as [Giờ cuối]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
GROUP BY [route], [date]
ORDER BY [date], [route];
GO

-- Tổng số
SELECT COUNT(*) as [Tổng số timeslots trong database]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

PRINT '';
PRINT '✅ ✅ ✅ HOÀN TẤT! ✅ ✅ ✅';
PRINT '';
PRINT '🎯 Các bước tiếp theo:';
PRINT '   1. Reload lại trang web';
PRINT '   2. Nếu không có timeslots, hệ thống sẽ tự động tạo';
PRINT '   3. Chọn ngày mới → Tự động tạo timeslots';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
GO
