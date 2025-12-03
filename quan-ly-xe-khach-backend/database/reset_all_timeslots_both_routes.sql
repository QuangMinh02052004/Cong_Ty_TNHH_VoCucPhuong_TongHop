-- =============================================
-- Script XÓA VÀ TẠO LẠI TIMESLOTS CHO CẢ 2 TUYẾN
-- Tuyến 1: Sài Gòn- Long Khánh (05:30 - 20:00)
-- Tuyến 2: Long Khánh - Sài Gòn (03:30 - 18:00)
-- Ngày: 03-12-2025
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

PRINT '═══════════════════════════════════════════════════════════════';
PRINT '🗑️  BƯỚC 1: XÓA TẤT CẢ TIMESLOTS CỦA CẢ 2 TUYẾN';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Xóa tất cả timeslots của ngày 03-12-2025
DELETE FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [date] = '03-12-2025';
GO

PRINT '✅ Đã xóa tất cả timeslots của ngày 03-12-2025';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '➕  BƯỚC 2: TẠO TIMESLOTS CHO TUYẾN SÀI GÒN - LONG KHÁNH';
PRINT '    Khung giờ: 05:30 - 20:00 (30 khung giờ)';
PRINT '═══════════════════════════════════════════════════════════════';
GO

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

PRINT '✅ Đã tạo 30 timeslots cho tuyến Sài Gòn- Long Khánh';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '➕  BƯỚC 3: TẠO TIMESLOTS CHO TUYẾN LONG KHÁNH - SÀI GÒN';
PRINT '    Khung giờ: 03:30 - 18:00 (30 khung giờ)';
PRINT '═══════════════════════════════════════════════════════════════';
GO

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

PRINT '✅ Đã tạo 30 timeslots cho tuyến Long Khánh - Sài Gòn';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📊  BƯỚC 4: KIỂM TRA KẾT QUẢ';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Đếm số timeslots của từng tuyến
SELECT
    [route] as [Tuyến],
    COUNT(*) as [Số khung giờ],
    MIN([time]) as [Giờ đầu],
    MAX([time]) as [Giờ cuối]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [date] = '03-12-2025'
GROUP BY [route]
ORDER BY [route];
GO

-- Tổng số timeslots
SELECT COUNT(*) as [Tổng số timeslots]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [date] = '03-12-2025';
GO

PRINT '';
PRINT '✅ ✅ ✅ HOÀN TẤT! ✅ ✅ ✅';
PRINT 'Đã tạo lại timeslots cho cả 2 tuyến ngày 03-12-2025';
PRINT '  • Sài Gòn- Long Khánh: 05:30 - 20:00 (30 khung)';
PRINT '  • Long Khánh - Sài Gòn: 03:30 - 18:00 (30 khung)';
PRINT '═══════════════════════════════════════════════════════════════';
GO
