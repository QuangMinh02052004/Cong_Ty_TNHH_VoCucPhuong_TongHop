-- =============================================
-- Script xóa TẤT CẢ timeslots
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

-- Xóa tất cả timeslots
DELETE FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO

PRINT '✅ Đã xóa tất cả timeslots';
PRINT '📊 Số lượng timeslots còn lại: ';
SELECT COUNT(*) as TotalTimeslots FROM [VoCucPhuong_Data_TongHop].[dbo].[TimeSlots];
GO
