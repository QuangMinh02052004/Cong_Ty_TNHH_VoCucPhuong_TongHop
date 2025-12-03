-- =============================================
-- Script sửa định dạng ngày trong database
-- Chuyển từ DATE sang VARCHAR với format DD-MM-YYYY
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

-- Bước 1: Thêm cột date_temp với kiểu VARCHAR
ALTER TABLE TimeSlots
ADD date_temp VARCHAR(20);
GO

-- Bước 2: Copy dữ liệu từ cột date sang date_temp với format DD-MM-YYYY
UPDATE TimeSlots
SET date_temp = FORMAT([date], 'dd-MM-yyyy');
GO

-- Bước 3: Xóa cột date cũ
ALTER TABLE TimeSlots
DROP COLUMN [date];
GO

-- Bước 4: Đổi tên cột date_temp thành date
EXEC sp_rename 'TimeSlots.date_temp', 'date', 'COLUMN';
GO

-- Kiểm tra kết quả
SELECT TOP 5
    id,
    [time],
    [date],  -- Bây giờ sẽ là format DD-MM-YYYY
    [type]
FROM TimeSlots;
GO

PRINT '✅ Đã chuyển đổi định dạng date sang DD-MM-YYYY';
