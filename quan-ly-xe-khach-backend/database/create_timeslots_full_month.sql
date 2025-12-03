-- =============================================
-- SCRIPT: Tạo timeslots cho TOÀN BỘ THÁNG 12/2025
-- Tạo sẵn timeslots cho tất cả các ngày
-- Khi bạn chọn ngày nào cũng đã có sẵn!
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📋 BƯỚC 1: THÊM CỘT ROUTE (nếu chưa có)';
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
PRINT '🗑️  BƯỚC 2: XÓA TẤT CẢ TIMESLOTS CŨ';
PRINT '═══════════════════════════════════════════════════════════════';
GO

DELETE FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
PRINT '✅ Đã xóa tất cả timeslots cũ';
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '➕ BƯỚC 3: TẠO TIMESLOTS CHO TOÀN BỘ THÁNG 12/2025';
PRINT '   (Từ ngày 03-12-2025 đến 31-12-2025 = 29 ngày)';
PRINT '   Mỗi ngày 60 timeslots = 1,740 timeslots tổng cộng';
PRINT '═══════════════════════════════════════════════════════════════';
GO

DECLARE @CurrentDay INT = 3;
DECLARE @EndDay INT = 31;
DECLARE @DateString NVARCHAR(20);
DECLARE @Counter INT = 0;

WHILE @CurrentDay <= @EndDay
BEGIN
    -- Format ngày: DD-MM-YYYY
    SET @DateString = RIGHT('0' + CAST(@CurrentDay AS NVARCHAR), 2) + '-12-2025';

    PRINT '📅 Đang tạo cho ngày: ' + @DateString;

    -- ==========================================
    -- Tạo 30 timeslots cho tuyến: Sài Gòn- Long Khánh (05:30 - 20:00)
    -- ==========================================
    INSERT INTO [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots] ([time], [date], [route], [type], [code], [driver], [phone])
    VALUES
        ('05:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('06:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('06:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('07:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('07:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('08:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('08:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('09:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('09:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('10:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('10:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('11:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('11:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('12:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('12:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('13:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('13:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('14:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('14:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('15:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('15:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('16:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('16:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('17:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('17:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('18:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('18:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('19:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('19:30', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL),
        ('20:00', @DateString, N'Sài Gòn- Long Khánh', N'Xe 28G', NULL, NULL, NULL);

    -- ==========================================
    -- Tạo 30 timeslots cho tuyến: Long Khánh - Sài Gòn (03:30 - 18:00)
    -- ==========================================
    INSERT INTO [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots] ([time], [date], [route], [type], [code], [driver], [phone])
    VALUES
        ('03:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('04:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('04:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('05:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('05:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('06:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('06:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('07:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('07:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('08:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('08:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('09:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('09:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('10:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('10:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('11:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('11:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('12:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('12:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('13:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('13:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('14:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('14:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('15:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('15:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('16:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('16:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('17:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('17:30', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL),
        ('18:00', @DateString, N'Long Khánh - Sài Gòn', N'Xe 28G', NULL, NULL, NULL);

    SET @Counter = @Counter + 60;
    PRINT '   ✅ Đã tạo 60 timeslots cho ngày ' + @DateString + ' (Tổng: ' + CAST(@Counter AS NVARCHAR) + ')';

    SET @CurrentDay = @CurrentDay + 1;
END
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📊 THỐNG KÊ KẾT QUẢ';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Thống kê theo ngày và tuyến
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

-- Tổng số timeslots
SELECT
    COUNT(*) as [Tổng số timeslots],
    COUNT(DISTINCT [date]) as [Số ngày có dữ liệu],
    COUNT(DISTINCT [route]) as [Số tuyến]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

PRINT '';
PRINT '✅ ✅ ✅ HOÀN TẤT! ✅ ✅ ✅';
PRINT '';
PRINT '📌 Đã tạo timeslots cho TOÀN BỘ tháng 12/2025:';
PRINT '   • Từ ngày 03-12-2025 đến 31-12-2025 (29 ngày)';
PRINT '   • Mỗi ngày: 60 timeslots (30 mỗi tuyến)';
PRINT '   • Tổng cộng: 1,740 timeslots';
PRINT '';
PRINT '🚀 Bây giờ bạn có thể:';
PRINT '   1. Reload trang web (Ctrl+Shift+R)';
PRINT '   2. Chọn BẤT KỲ NGÀY NÀO từ 03 đến 31/12';
PRINT '   3. Timeslots đã có sẵn, không cần đợi!';
PRINT '';
PRINT '💡 Nếu cần tạo cho tháng 1/2026:';
PRINT '   • Sửa @EndDay thành ngày cuối tháng 1';
PRINT '   • Sửa @DateString thành "01-2026"';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
GO
