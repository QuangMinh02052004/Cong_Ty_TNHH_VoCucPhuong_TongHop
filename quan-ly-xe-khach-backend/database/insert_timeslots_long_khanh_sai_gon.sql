-- =============================================
-- Script tạo timeslots cho tuyến Long Khánh - Sài Gòn
-- Khung giờ: 03:30 - 18:00 (cách nhau 30 phút)
-- Ngày: 03-12-2025
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

-- Xóa các timeslots cũ của tuyến Long Khánh - Sài Gòn (nếu có)
DELETE FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [route] = N'Long Khánh - Sài Gòn' AND [date] = '03-12-2025';
GO

PRINT '🗑️ Đã xóa timeslots cũ của tuyến Long Khánh - Sài Gòn';
GO

-- Tạo timeslots mới cho tuyến Long Khánh - Sài Gòn
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

PRINT '✅ Đã tạo 30 timeslots cho tuyến Long Khánh - Sài Gòn (03:30 - 18:00)';
GO

-- Kiểm tra kết quả
SELECT COUNT(*) as TotalTimeslots
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [route] = N'Long Khánh - Sài Gòn' AND [date] = '03-12-2025';
GO

PRINT '📊 Danh sách timeslots vừa tạo:';
SELECT [id], [time], [date], [route], [type], [code], [driver], [phone]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [route] = N'Long Khánh - Sài Gòn' AND [date] = '03-12-2025'
ORDER BY [time];
GO

PRINT '✅ Hoàn tất!';
GO
