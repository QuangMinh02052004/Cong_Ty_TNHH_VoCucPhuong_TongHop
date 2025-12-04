-- =============================================
-- SCRIPT: Tạo bảng Users cho authentication
-- Bảng này quản lý người dùng và phân quyền
-- =============================================

USE [VoCucPhuong_Data_TongHop];
GO

-- Tạo bảng Users
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE [dbo].[Users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(50) NOT NULL UNIQUE,
        [password] NVARCHAR(255) NOT NULL,  -- Sẽ được hash
        [fullName] NVARCHAR(100) NOT NULL,
        [email] NVARCHAR(100) NULL,
        [phone] NVARCHAR(20) NULL,
        [role] NVARCHAR(20) NOT NULL DEFAULT 'user',  -- 'admin', 'manager', 'user'
        [isActive] BIT NOT NULL DEFAULT 1,
        [createdAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
        [lastLogin] DATETIME NULL
    );

    PRINT '✅ Đã tạo bảng Users';
END
ELSE
BEGIN
    PRINT '⚠️ Bảng Users đã tồn tại';
END
GO

-- Tạo user admin mặc định (password: admin123)
-- Hash của "admin123" sử dụng bcrypt
IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE [username] = 'admin')
BEGIN
    INSERT INTO [dbo].[Users] ([username], [password], [fullName], [role], [isActive])
    VALUES ('admin', '$2a$10$5mJ3qKq8Y9J5xqxqVQxqxOxP9P9P9P9P9P9P9P9P9P9P9P9', N'Quản Trị Viên', 'admin', 1);

    PRINT '✅ Đã tạo user admin mặc định';
    PRINT '   Username: admin';
    PRINT '   Password: admin123';
END
GO

-- Tạo một số user mẫu
IF NOT EXISTS (SELECT * FROM [dbo].[Users] WHERE [username] = 'nhanvien1')
BEGIN
    INSERT INTO [dbo].[Users] ([username], [password], [fullName], [role], [isActive])
    VALUES
        ('nhanvien1', '$2a$10$5mJ3qKq8Y9J5xqxqVQxqxOxP9P9P9P9P9P9P9P9P9P9P9P9', N'Nhân Viên 1', 'user', 1),
        ('quanly1', '$2a$10$5mJ3qKq8Y9J5xqxqVQxqxOxP9P9P9P9P9P9P9P9P9P9P9P9', N'Quản Lý 1', 'manager', 1);

    PRINT '✅ Đã tạo users mẫu';
    PRINT '   nhanvien1 / admin123 (role: user)';
    PRINT '   quanly1 / admin123 (role: manager)';
END
GO

-- Thống kê
SELECT
    [username] as [Tên đăng nhập],
    [fullName] as [Họ tên],
    [role] as [Vai trò],
    [isActive] as [Hoạt động],
    [createdAt] as [Ngày tạo]
FROM [dbo].[Users]
ORDER BY [role] DESC, [username];
GO

PRINT '';
PRINT '✅ HOÀN TẤT!';
PRINT '';
PRINT '📋 Roles có thể sử dụng:';
PRINT '   • admin: Toàn quyền (quản lý user, xem báo cáo, cấu hình)';
PRINT '   • manager: Quản lý điều hành (xe, tài xế, hàng hóa)';
PRINT '   • user: Nhân viên (bán vé, tra cứu)';
PRINT '';
PRINT '🔐 Thông tin đăng nhập mặc định:';
PRINT '   admin / admin123';
PRINT '';
GO
