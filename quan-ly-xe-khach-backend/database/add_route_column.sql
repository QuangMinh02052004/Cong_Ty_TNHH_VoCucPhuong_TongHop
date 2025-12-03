-- =============================================
-- Script thêm cột route vào bảng TimeSlots và Bookings
-- =============================================

USE [VoCucPhuong_Data_TongHop];
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

-- Cập nhật giá trị mặc định cho các record hiện tại (nếu có)
UPDATE [dbo].[TimeSlots]
SET [route] = N'Sài Gòn- Long Khánh'
WHERE [route] IS NULL;
GO

PRINT '✅ Đã cập nhật route mặc định cho TimeSlots hiện tại';
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

-- Cập nhật giá trị mặc định cho các record hiện tại (nếu có)
UPDATE [dbo].[Bookings]
SET [route] = N'Sài Gòn- Long Khánh'
WHERE [route] IS NULL;
GO

PRINT '✅ Đã cập nhật route mặc định cho Bookings hiện tại';
GO

-- Kiểm tra kết quả
PRINT '📊 Cấu trúc bảng TimeSlots:';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TimeSlots';
GO

PRINT '📊 Cấu trúc bảng Bookings:';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Bookings';
GO

PRINT '✅ Hoàn tất migration - đã thêm cột route vào cả 2 bảng!';
GO
