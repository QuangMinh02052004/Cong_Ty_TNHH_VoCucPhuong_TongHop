-- =============================================
-- SCRIPT: Tạo bảng Customers để lưu thông tin khách hàng
-- Bảng này lưu thông tin cơ bản của khách hàng
-- Khi đặt vé, sẽ tự động lưu/cập nhật thông tin khách hàng
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

-- Tạo bảng Customers
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
    CREATE TABLE [dbo].[Customers] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [phone] NVARCHAR(20) NOT NULL UNIQUE,
        [fullName] NVARCHAR(100) NOT NULL,
        [pickupType] NVARCHAR(50) NULL,  -- 'Tại bến' hoặc 'Dọc đường'
        [pickupLocation] NVARCHAR(200) NULL,
        [dropoffType] NVARCHAR(50) NULL,  -- 'Tại bến' hoặc 'Dọc đường'
        [dropoffLocation] NVARCHAR(200) NULL,
        [notes] NVARCHAR(500) NULL,
        [totalBookings] INT NOT NULL DEFAULT 0,  -- Số lần đặt vé
        [lastBookingDate] DATETIME NULL,  -- Lần đặt vé gần nhất
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE()
    );

    PRINT '✅ Đã tạo bảng Customers';

    -- Tạo index cho phone để tìm kiếm nhanh
    CREATE INDEX IX_Customers_Phone ON Customers(phone);
    PRINT '✅ Đã tạo index cho cột phone';
END
ELSE
BEGIN
    PRINT '⚠️ Bảng Customers đã tồn tại';
END
GO

PRINT '';
PRINT '✅ HOÀN TẤT!';
PRINT '';
PRINT '📋 Bảng Customers đã sẵn sàng:';
PRINT '   • Lưu thông tin khách hàng theo SĐT';
PRINT '   • Tự động điền khi đặt vé lần 2+';
PRINT '   • Theo dõi số lần đặt vé';
PRINT '';
GO
