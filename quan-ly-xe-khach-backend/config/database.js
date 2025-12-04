const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false, // Sử dụng false cho local development
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Tạo pool connection để tái sử dụng
let pool = null;

const getConnection = async () => {
  try {
    if (pool) {
      return pool;
    }
    pool = await sql.connect(config);
    console.log('✅ Kết nối SQL Server thành công!');
    return pool;
  } catch (err) {
    console.error('❌ Lỗi kết nối SQL Server:', err);
    throw err;
  }
};

// Khởi tạo database tables nếu chưa có
const initDatabase = async () => {
  try {
    const pool = await getConnection();

    // Tạo bảng TimeSlots (Khung giờ xe chạy)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='TimeSlots' AND xtype='U')
      CREATE TABLE TimeSlots (
        id INT PRIMARY KEY IDENTITY(1,1),
        time VARCHAR(10) NOT NULL,
        date VARCHAR(20),
        type NVARCHAR(50),
        code VARCHAR(20),
        driver NVARCHAR(100),
        phone VARCHAR(20),
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);

    // Tạo bảng Bookings (Đặt vé)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bookings' AND xtype='U')
      CREATE TABLE Bookings (
        id INT PRIMARY KEY IDENTITY(1,1),
        timeSlotId INT FOREIGN KEY REFERENCES TimeSlots(id) ON DELETE CASCADE,
        phone VARCHAR(20),
        name NVARCHAR(200),
        gender VARCHAR(10),
        nationality NVARCHAR(100),
        pickupMethod NVARCHAR(50),
        pickupAddress NVARCHAR(500),
        dropoffMethod NVARCHAR(50),
        dropoffAddress NVARCHAR(500),
        note NVARCHAR(1000),
        seatNumber INT,
        amount DECIMAL(18,2),
        paid DECIMAL(18,2) DEFAULT 0,
        timeSlot VARCHAR(10),
        date VARCHAR(20),
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);

    // Tạo bảng Drivers (Danh sách tài xế)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Drivers' AND xtype='U')
      CREATE TABLE Drivers (
        id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);

    // Tạo bảng Vehicles (Danh sách xe)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Vehicles' AND xtype='U')
      CREATE TABLE Vehicles (
        id INT PRIMARY KEY IDENTITY(1,1),
        code VARCHAR(20) NOT NULL UNIQUE,
        type NVARCHAR(50) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
      )
    `);

    // Tạo bảng Stations (Trạm dừng)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Stations' AND xtype='U')
      CREATE TABLE Stations (
        id INT PRIMARY KEY IDENTITY(1,1),
        station_name NVARCHAR(200) NOT NULL,
        address NVARCHAR(500),
        station_type NVARCHAR(50),
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
      )
    `);

    // Tạo bảng Users (Người dùng hệ thống)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        id INT PRIMARY KEY IDENTITY(1,1),
        username NVARCHAR(50) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        fullName NVARCHAR(100) NOT NULL,
        email NVARCHAR(100),
        phone NVARCHAR(20),
        role NVARCHAR(20) DEFAULT 'user',
        isActive BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        lastLogin DATETIME
      )
    `);

    // Tạo bảng Customers (Khách hàng)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Customers' AND xtype='U')
      CREATE TABLE Customers (
        id INT PRIMARY KEY IDENTITY(1,1),
        phone NVARCHAR(20) NOT NULL UNIQUE,
        customer_name NVARCHAR(100),
        address NVARCHAR(255),
        email NVARCHAR(100),
        notes NVARCHAR(500),
        pickupType NVARCHAR(50),
        pickupLocation NVARCHAR(500),
        dropoffType NVARCHAR(50),
        dropoffLocation NVARCHAR(500),
        total_bookings INT DEFAULT 0,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
      )
    `);

    // Tạo bảng Freight (Hàng hóa)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Freight' AND xtype='U')
      CREATE TABLE Freight (
        id INT PRIMARY KEY IDENTITY(1,1),
        time_slot_id INT FOREIGN KEY REFERENCES TimeSlots(id) ON DELETE CASCADE,
        sender_customer_id INT,
        receiver_customer_id INT,
        receiver_name NVARCHAR(100),
        receiver_phone NVARCHAR(20),
        receiver_address NVARCHAR(255),
        pickup_station_id INT,
        delivery_station_id INT,
        description NVARCHAR(500) NOT NULL,
        weight DECIMAL(10,2),
        size_length DECIMAL(10,2),
        size_width DECIMAL(10,2),
        size_height DECIMAL(10,2),
        quantity INT DEFAULT 1,
        freight_charge DECIMAL(10,2) DEFAULT 0,
        cod_amount DECIMAL(10,2) DEFAULT 0,
        status NVARCHAR(20) DEFAULT 'pending',
        pickup_time DATETIME,
        delivery_time DATETIME,
        special_instructions NVARCHAR(500),
        created_by INT,
        updated_by INT,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
      )
    `);

    // Migration: Thêm cột dropoffAddress nếu chưa có
    await pool.request().query(`
      IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'dropoffAddress'
      )
      BEGIN
        ALTER TABLE Bookings ADD dropoffAddress NVARCHAR(500)
        PRINT 'Added dropoffAddress column to Bookings table'
      END
    `);

    console.log('✅ Database tables đã được khởi tạo!');

    // Insert dữ liệu mẫu nếu bảng trống
    await insertSampleData(pool);

  } catch (err) {
    console.error('❌ Lỗi khởi tạo database:', err);
    throw err;
  }
};

// Thêm dữ liệu mẫu
const insertSampleData = async (pool) => {
  try {
    // Kiểm tra xem đã có dữ liệu chưa
    const driverCount = await pool.request().query('SELECT COUNT(*) as count FROM Drivers');
    const vehicleCount = await pool.request().query('SELECT COUNT(*) as count FROM Vehicles');

    if (driverCount.recordset[0].count === 0) {
      // Thêm tài xế mẫu
      await pool.request().query(`
        INSERT INTO Drivers (name, phone) VALUES
        (N'TX Thanh Bắc', '0918026316'),
        (N'TX. Phong M X', '0912345678'),
        (N'TX. Minh', '0987654321'),
        (N'TX. Hùng', '0909123456')
      `);
      console.log('✅ Đã thêm dữ liệu mẫu cho Drivers');
    }

    if (vehicleCount.recordset[0].count === 0) {
      // Thêm xe mẫu
      await pool.request().query(`
        INSERT INTO Vehicles (code, type) VALUES
        ('60BO5307', N'Xe 28G'),
        ('51B26542', N'Xe 28G'),
        ('51B12345', N'Xe 16G'),
        ('60BO1234', N'Xe 28G')
      `);
      console.log('✅ Đã thêm dữ liệu mẫu cho Vehicles');
    }

    // Kiểm tra TimeSlots
    const slotCount = await pool.request().query('SELECT COUNT(*) as count FROM TimeSlots');
    if (slotCount.recordset[0].count === 0) {
      // Thêm 1 khung giờ mẫu
      const result = await pool.request().query(`
        INSERT INTO TimeSlots (time, date, type, code, driver, phone)
        OUTPUT INSERTED.id
        VALUES ('05:30', '28/26', N'Xe 28G', '60BO5307', N'TX Thanh Bắc', '0918026316')
      `);

      const timeSlotId = result.recordset[0].id;

      // Thêm 2 booking mẫu cho khung giờ này
      await pool.request().query(`
        INSERT INTO Bookings (timeSlotId, phone, name, gender, nationality, pickupMethod, pickupAddress, dropoffMethod, note, seatNumber, amount, paid, timeSlot, date)
        VALUES
        (${timeSlotId}, '0376670275', N'51. Nhà thọ Tân Bắc', 'male', N'Việt Nam', N'Dọc đường', N'Trạm Long Khánh', N'Tại bến', N'giao loan 1 thùng bông', 1, 100000, 0, '05:30', '26-11-2025'),
        (${timeSlotId}, '0989347425', N'22. Ngã 4 Bình Thái', 'female', N'Việt Nam', N'Dọc đường', N'Trạm Long Khánh', N'Tại bến', N'1 ghế', 2, 100000, 0, '05:30', '26-11-2025')
      `);
      console.log('✅ Đã thêm dữ liệu mẫu cho TimeSlots và Bookings');
    }

    // Kiểm tra Users
    const userCount = await pool.request().query('SELECT COUNT(*) as count FROM Users');
    if (userCount.recordset[0].count === 0) {
      // Thêm user admin mặc định (password: admin123)
      await pool.request().query(`
        INSERT INTO Users (username, password, fullName, role)
        VALUES
        ('admin', 'admin123', N'Administrator', 'admin'),
        ('quanly1', 'admin123', N'Quản lý 1', 'manager'),
        ('nhanvien1', 'admin123', N'Nhân viên 1', 'user')
      `);
      console.log('✅ Đã thêm dữ liệu mẫu cho Users');
    }

  } catch (err) {
    console.error('❌ Lỗi thêm dữ liệu mẫu:', err);
  }
};

module.exports = {
  getConnection,
  initDatabase,
  sql
};
