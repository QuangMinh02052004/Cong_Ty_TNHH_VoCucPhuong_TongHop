-- =============================================
-- SCRIPT: Tạo timeslots cho CẢ NĂM 2025-2026
-- Tạo sẵn timeslots cho 12 tháng từ 12/2025 đến 11/2026
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
PRINT '➕ BƯỚC 3: TẠO TIMESLOTS CHO CẢ NĂM';
PRINT '   Tháng 12/2025 + Cả năm 2026 = ~365 ngày';
PRINT '   Mỗi ngày 60 timeslots = ~21,900 timeslots';
PRINT '   ⏳ Quá trình này có thể mất 2-3 phút...';
PRINT '═══════════════════════════════════════════════════════════════';
GO

DECLARE @CurrentDate DATE = '2025-12-03';  -- Ngày bắt đầu
DECLARE @EndDate DATE = '2026-11-30';      -- Ngày kết thúc (12 tháng)
DECLARE @DateString NVARCHAR(20);
DECLARE @Counter INT = 0;
DECLARE @DayCounter INT = 0;

WHILE @CurrentDate <= @EndDate
BEGIN
    -- Format ngày: DD-MM-YYYY
    SET @DateString = FORMAT(@CurrentDate, 'dd-MM-yyyy');
    SET @DayCounter = @DayCounter + 1;

    IF @DayCounter % 10 = 0
    BEGIN
        PRINT '📅 Đang xử lý: ' + @DateString + ' (Ngày thứ ' + CAST(@DayCounter AS NVARCHAR) + ')';
    END

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
    SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
END
GO

PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
PRINT '📊 THỐNG KÊ KẾT QUẢ';
PRINT '═══════════════════════════════════════════════════════════════';
GO

-- Thống kê tổng quan
SELECT
    COUNT(*) as [Tổng số timeslots],
    COUNT(DISTINCT [date]) as [Số ngày có dữ liệu],
    COUNT(DISTINCT [route]) as [Số tuyến],
    MIN([date]) as [Ngày đầu tiên],
    MAX([date]) as [Ngày cuối cùng]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

-- Thống kê theo tháng
SELECT
    SUBSTRING([date], 4, 7) as [Tháng],
    [route] as [Tuyến],
    COUNT(*) as [Số timeslots],
    COUNT(DISTINCT [date]) as [Số ngày]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
GROUP BY SUBSTRING([date], 4, 7), [route]
ORDER BY SUBSTRING([date], 4, 7), [route];
GO

PRINT '';
PRINT '✅ ✅ ✅ HOÀN TẤT! ✅ ✅ ✅';
PRINT '';
PRINT '📌 Đã tạo timeslots cho CẢ NĂM:';
PRINT '   • Từ 03-12-2025 đến 30-11-2026 (~365 ngày)';
PRINT '   • Mỗi ngày: 60 timeslots (30 mỗi tuyến)';
PRINT '   • Tổng cộng: ~21,900 timeslots';
PRINT '';
PRINT '🚀 Bây giờ bạn có thể:';
PRINT '   1. Reload trang web (Ctrl+Shift+R)';
PRINT '   2. Chọn BẤT KỲ NGÀY NÀO trong 12 tháng tới';
PRINT '   3. Timeslots đã có sẵn, KHÔNG CẦN ĐỢI!';
PRINT '';
PRINT '💡 Để tạo cho năm tiếp theo:';
PRINT '   • Chạy lại script này vào cuối năm 2026';
PRINT '';
PRINT '═══════════════════════════════════════════════════════════════';
GO
