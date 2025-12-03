-- Script tạo bảng STATIONS và thêm dữ liệu địa điểm
-- Database: Microsoft SQL Server

-- Tạo bảng STATIONS nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Stations')
BEGIN
    CREATE TABLE Stations (
        StationID DECIMAL(5,1) PRIMARY KEY,
        StationName NVARCHAR(255) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
    PRINT 'Bảng Stations đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT 'Bảng Stations đã tồn tại!';
END
GO

-- Xóa dữ liệu cũ nếu có (tùy chọn - bỏ comment nếu muốn reset dữ liệu)
-- DELETE FROM Stations;
-- GO

-- Thêm dữ liệu địa điểm vào bảng
INSERT INTO Stations (StationID, StationName) VALUES
(1, N'An Đông'),
(2, N'Ngã 4 Trần Phú-Lê Hồng Phong'),
(3, N'Ngã 4 Trần Phú-Trần Bình Trọng'),
(4, N'Nhà Sách Nguyễn Thị Minh Khai'),
(5, N'BV Từ Dũ - Nguyễn Thị Minh Khai'),
(6, N'Sở Y Tế - Nguyễn Thị Minh Khai'),
(7, N'CV Tao Đàn - Nguyễn Thị Minh Khai'),
(7.1, N'Trương Định - Nguyễn Thị Minh Khai'),
(8, N'Cung VH Lao Động - Nguyễn Thị Minh Khai'),
(9, N'N4 Nam Ki - Nguyễn Thị Minh Khai'),
(10, N'Ngã 4 Pastuer - Nguyễn Thị Minh Khai'),
(11, N'Nhà VH Thanh Niên  - Nguyễn Thị Minh Khai'),
(12, N'Ngã 3 PK.Khoan - Nguyễn Thị Minh Khai'),
(13, N'Ngã 4 M.Đ.Chi - Nguyễn Thị Minh Khai'),
(14, N'Sân VD Hoa Lư - Nguyễn Thị Minh Khai'),
(14.1, N'Ngã 4.Đinh Tiên Hoàng - Nguyễn Thị Minh Khai'),
(15, N'Cầu Đen'),
(16, N'Cầu Trắng'),
(17, N'Metro'),
(18, N'Cantavil'),
(21, N'Ngã 4 MK'),
(22, N'Ngã 4 Bình Thái'),
(23, N'Ngã 4 Thủ Đức'),
(24, N'Khu Công Nghệ Cao'),
(25, N'Suối Tiên'),
(26, N'Ngã 4 621'),
(27, N'Tân Vạn'),
(28, N'Ngã 3 Vũng Tàu'),
(29, N'Bồn Nước'),
(30, N'Tam Hiệp'),
(31, N'Amata'),
(32, N'BV Nhi Đồng Nai'),
(33, N'Cầu Sập'),
(34, N'Bến xe Hố Nai'),
(35, N'Chợ Sặt'),
(36, N'Công Viên 30/4'),
(37, N'Bệnh Viện Thánh Tâm'),
(38, N'Nhà thờ Thánh Tâm'),
(39, N'Cây Xăng Lộ Đức'),
(40, N'Nhà thờ Tiên Chu'),
(41, N'Chợ Thái Bình'),
(42, N'Nhà thờ Ngọc Đồng'),
(43, N'Nhà thờ Ngô Xá'),
(44, N'Nhà thờ Sài Quất'),
(44.1, N'Ngũ Phúc'),
(45, N'Nhà thờ Thái Hoà'),
(45.1, N'Yên Thế'),
(46, N'Chợ chiều Thanh Hoá'),
(46.1, N'Nhà thờ Thanh Hoá'),
(47, N'Ngã 3 Trị An'),
(47.1, N'Nhà thờ Bùi Chu'),
(48, N'Bắc Sơn'),
(49, N'Phú Sơn'),
(50, N'Nhà thờ Tân Thành'),
(51, N'Nhà thờ Tân Bắc'),
(52, N'Suối Đĩa'),
(53, N'Nhà thờ Tân Bình'),
(54, N'Trà Cổ'),
(54.1, N'Bar Romance'),
(55, N'Nhà thờ Quảng Biên'),
(56, N'Chợ Quảng Biên'),
(57, N'Sân Golf Trảng Bom'),
(58, N'Bưu điện Trảng Bom'),
(59, N'Bờ hồ Trảng Bom'),
(60, N'Cây xăng Thành Thái'),
(61, N'Trạm cân'),
(62, N'KCN Bầu Xéo'),
(63, N'Song Thạch'),
(64, N'Chợ Lộc Hoà'),
(65, N'Thu phí Bầu Cá'),
(66, N'Nhà thờ Tâm An'),
(67, N'Chợ Bầu Cá'),
(68, N'Cây xăng Minh Trí'),
(69, N'Ba cây Xoài Bầu Cá'),
(70, N'Cổng vàng Hưng Long'),
(71, N'Cây xăng Hưng Thịnh'),
(72, N'Sông Thao'),
(73, N'Chùa Vạn Thọ'),
(74, N'Chợ Hưng Nghĩa'),
(75, N'Trạm Giữa'),
(76, N'Cây xăng Tam Hoàng'),
(77, N'Đại Phát Đạt'),
(78, N'Chợ Hưng Lộc'),
(79, N'Nhà thờ Hưng Lộc'),
(80, N'Cây xăng Hưng Lộc'),
(81, N'Mì Quảng Thủy Tiên'),
(82, N'Ngô Quyền Dầu Giây'),
(83, N'Cây xăng Đặng Văn Bích'),
(84, N'Bưu điện Dầu Giây'),
(85, N'xã Xuân Thạnh Dầu Giây'),
(86, N'Trung tâm Hành chính Dầu Giây'),
(87, N'Bến xe Dầu Giây'),
(88, N'Trạm 97'),
(89, N'Cáp Rang'),
(90, N'Bệnh viện Long Khánh'),
(91, N'Cây Xăng Suối Tre'),
(92, N'Dốc Lê Lợi'),
(93, N'Cây xăng 222'),
(94, N'Bến xe Long Khánh');
GO

-- Kiểm tra dữ liệu đã được thêm
SELECT COUNT(*) AS TotalStations FROM Stations;
GO

PRINT 'Đã thêm dữ liệu thành công!';
GO
