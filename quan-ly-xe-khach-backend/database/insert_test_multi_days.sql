-- =============================================
-- Script tạo timeslots cho NHIỀU NGÀY để test
-- Tạo cho ngày 03-12-2025 và 04-12-2025
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

-- Function helper để tạo timeslots cho một ngày
DECLARE @DaysToCreate TABLE (DateStr VARCHAR(20))

-- Thêm các ngày cần tạo (format DD-MM-YYYY)
INSERT INTO @DaysToCreate VALUES ('03-12-2025')
INSERT INTO @DaysToCreate VALUES ('04-12-2025')

DECLARE @CurrentDate VARCHAR(20)
DECLARE DateCursor CURSOR FOR SELECT DateStr FROM @DaysToCreate

OPEN DateCursor
FETCH NEXT FROM DateCursor INTO @CurrentDate

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    PRINT '📅 Đang tạo timeslots cho ngày: ' + @CurrentDate
    PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

    DECLARE @CurrentHour INT = 5
    DECLARE @CurrentMinute INT = 30
    DECLARE @EndHour INT = 20
    DECLARE @Counter INT = 1

    -- Tạo timeslots từ 05:30 đến 20:00
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
            @TimeString,     -- HH:mm format
            @CurrentDate,    -- DD-MM-YYYY format
            'Xe 28G',
            NULL,
            NULL,
            NULL,
            GETDATE(),
            GETDATE()
        )

        SET @CurrentMinute = @CurrentMinute + 30
        IF @CurrentMinute >= 60
        BEGIN
            SET @CurrentHour = @CurrentHour + 1
            SET @CurrentMinute = 0
        END

        SET @Counter = @Counter + 1
    END

    PRINT '✅ Đã tạo ' + CAST(@Counter - 1 AS VARCHAR(10)) + ' timeslots cho ngày ' + @CurrentDate

    FETCH NEXT FROM DateCursor INTO @CurrentDate
END

CLOSE DateCursor
DEALLOCATE DateCursor

PRINT ''
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
PRINT '✅ HOÀN TẤT!'
PRINT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- Kiểm tra kết quả
SELECT
    [date],
    COUNT(*) AS TotalSlots
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
GROUP BY [date]
ORDER BY [date]

PRINT ''
PRINT 'Chi tiết timeslots cho từng ngày:'
PRINT '================================='

-- Hiển thị 5 timeslots đầu tiên của mỗi ngày
SELECT TOP 5
    [date],
    [time],
    [type]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [date] = '03-12-2025'
ORDER BY [time]

PRINT ''

SELECT TOP 5
    [date],
    [time],
    [type]
FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots]
WHERE [date] = '04-12-2025'
ORDER BY [time]
