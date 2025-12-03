-- =============================================
-- SCRIPT HOÀN CHỈNH: Thêm cột route + Xóa cũ + Tạo mới
-- Tạo timeslots cho ngày 03-12-2025 và 04-12-2025
-- Các ngày sau sẽ tự động tạo khi bạn chọn
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📋 BƯỚC 1: THÊM CỘT ROUTE VÀO DATABASE';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Thêm cột route vào bảng TimeSlots
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[TimeSlots]')
    AND name = 'route'
)
BEGIN
    ALTER TABLE [dbo].[TimeSlots]
    ADD [route] NVARCHAR(100) NULL;
    PRINT '✅ Đã thêm cột route vào bảng TimeSlots';
END
ELSE
BEGIN
    PRINT '⚠️ Cột route đã tồn tại trong bảng TimeSlots';
END
GO

-- Thêm cột route vào bảng Bookings
IF NOT EXISTS (
    SELECT * FROM sys.columns
    WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]')
    AND name = 'route'
)
BEGIN
    ALTER TABLE [dbo].[Bookings]
    ADD [route] NVARCHAR(100) NULL;
    PRINT '✅ Đã thêm cột route vào bảng Bookings';
END
ELSE
BEGIN
    PRINT '⚠️ Cột route đã tồn tại trong bảng Bookings';
END
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🗑️  BƯỚC 2: XÓA TẤT CẢ TIMESLOTS CŨ (Tránh trùng lặp)';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Xóa tất cả timeslots
DELETE FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

PRINT '✅ Đã xóa tất cả timeslots cũ';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '➕ BƯỚC 3: TẠO TIMESLOTS CHO NGÀY 03-12-2025';
PRINT '═══════════════════════════════════════════════════════════════';
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

PRINT '✅ Đã tạo 60 timeslots cho ngày 03-12-2025';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '➕ BƯỚC 4: TẠO TIMESLOTS CHO NGÀY 04-12-2025';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Tạo cho tuyến Sài Gòn- Long Khánh (05:30 - 20:00)
INSERT INTO [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots] ([time], [date], [route], [type], [code], [driver], [phone])
VALUES
    ('05:30', '04-12-2025', N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
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
INSERT INTO [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots] ([time], [date], [route], [type], [code], [driver], [phone])
VALUES
    ('03:30', '04-12-2025', N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
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

PRINT '✅ Đã tạo 60 timeslots cho ngày 04-12-2025';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📊 KẾT QUẢ CUỐI CÙNG';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Thống kê
SELECT
    [date] as [Ngày],
    [route] as [Tuyến],
    COUNT(*) as [Số timeslots],
    MIN([time]) as [Giờ đầu],
    MAX([time]) as [Giờ cuối]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
GROUP BY [date], [route]
ORDER BY [date], [route];
GO

SELECT COUNT(*) as [Tổng số timeslots]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

PRINT '';
PRINT '✅ ✅ ✅ HOÀN TẤT! ✅ ✅ ✅';
PRINT '';
PRINT '📌 Đã tạo timeslots cho:';
PRINT '   • Ngày 03-12-2025: 60 timeslots (30 mỗi tuyến)';
PRINT '   • Ngày 04-12-2025: 60 timeslots (30 mỗi tuyến)';
PRINT '';
PRINT '🚀 Các ngày sau (05, 06, 07...) sẽ TỰ ĐỘNG TẠO khi bạn chọn!';
PRINT '';
PRINT '🎯 Bước tiếp theo:';
PRINT '   1. Reload trang web (Ctrl+Shift+R)';
PRINT '   2. Chọn ngày 03 hoặc 04 → Sẽ thấy 30 timeslots';
PRINT '   3. Chọn ngày 05 → Tự động tạo 30 timeslots mới';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
GO
