-- =============================================
-- Script tạo timeslots với định dạng ngày ĐÚNG
-- Format: DD-MM-YYYY
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

-- Tạo dữ liệu khung giờ từ 5:30 đến 20:00
-- Mỗi khung giờ cách nhau 30 phút

-- Tạo ngày theo format DD-MM-YYYY
DECLARE @Day VARCHAR(2) = RIGHT('0' + CAST(DAY(GETDATE()) AS VARCHAR(2)), 2)
DECLARE @Month VARCHAR(2) = RIGHT('0' + CAST(MONTH(GETDATE()) AS VARCHAR(2)), 2)
DECLARE @Year VARCHAR(4) = CAST(YEAR(GETDATE()) AS VARCHAR(4))
DECLARE @Date VARCHAR(20) = @Day + '-' + @Month + '-' + @Year

DECLARE @CurrentHour INT = 5
DECLARE @CurrentMinute INT = 30
DECLARE @EndHour INT = 20
DECLARE @Counter INT = 1

PRINT '📅 Tạo timeslots cho ngày: ' + @Date

-- Bắt đầu tạo dữ liệu
WHILE (@CurrentHour < @EndHour) OR (@CurrentHour = @EndHour AND @CurrentMinute = 0)
BEGIN
    DECLARE @TimeString VARCHAR(5)
    SET @TimeString = RIGHT('0' + CAST(@CurrentHour AS VARCHAR(2)), 2) + ':' +
                      RIGHT('0' + CAST(@CurrentMinute AS VARCHAR(2)), 2)

    INSERT INTO [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
    (
        [time],
        [date],
        [type],
        [code],
        [driver],
        [phone],
        [createdAt],
        [updatedAt]
    )
    VALUES
    (
        @TimeString,    -- Định dạng giờ: HH:mm (24h format)
        @Date,          -- ✅ Ngày format DD-MM-YYYY
        'Xe 28G',       -- Loại xe mặc định
        NULL,           -- Biển số xe (chưa có)
        NULL,           -- Tài xế (chưa có)
        NULL,           -- Số điện thoại (chưa có)
        GETDATE(),      -- Thời gian tạo
        GETDATE()       -- Thời gian cập nhật
    )

    -- Tăng thêm 30 phút
    SET @CurrentMinute = @CurrentMinute + 30
    IF @CurrentMinute >= 60
    BEGIN
        SET @CurrentHour = @CurrentHour + 1
        SET @CurrentMinute = 0
    END

    SET @Counter = @Counter + 1
END

-- Kiểm tra kết quả
SELECT
    [id],
    [time],
    [date],
    [type],
    [code],
    [driver],
    [phone]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [date] = @Date
ORDER BY [time]

PRINT '✅ Đã tạo ' + CAST(@Counter - 1 AS VARCHAR(10)) + ' khung giờ từ 05:30 đến 20:00'
PRINT '✅ Ngày: ' + @Date
