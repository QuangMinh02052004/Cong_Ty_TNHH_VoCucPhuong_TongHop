-- =============================================
-- Script xóa dữ liệu cũ trong database
-- Hệ Thống Quản Lý Xe Khách - Võ Cúc Phương
-- =============================================

USE [quan_ly_xe_khach]; -- Thay tên database của bạn ở đây
GO

-- Tắt kiểm tra foreign key để xóa an toàn
ALTER TABLE Bookings NOCHECK CONSTRAINT ALL;
GO

-- 1. Xóa tất cả bookings
DELETE FROM Bookings;
PRINT '✅ Đã xóa tất cả bookings';
GO

-- 2. Xóa tất cả timeslots
DELETE FROM TimeSlots;
PRINT '✅ Đã xóa tất cả timeslots';
GO

-- Bật lại kiểm tra foreign key
ALTER TABLE Bookings CHECK CONSTRAINT ALL;
GO

-- 3. Reset identity seed (nếu bảng có cột IDENTITY)
-- Uncomment các dòng dưới nếu bạn muốn reset ID về 1
-- DBCC CHECKIDENT ('TimeSlots', RESEED, 0);
-- DBCC CHECKIDENT ('Bookings', RESEED, 0);
-- PRINT '✅ Đã reset ID về 0';
-- GO

-- 4. Kiểm tra kết quả
SELECT COUNT(*) AS TotalTimeSlots FROM TimeSlots;
SELECT COUNT(*) AS TotalBookings FROM Bookings;
GO

PRINT '====================================';
PRINT 'Hoàn tất xóa dữ liệu!';
PRINT 'TimeSlots và Bookings đã được xóa sạch';
PRINT '====================================';
