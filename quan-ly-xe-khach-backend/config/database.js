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

  } catch (err) {
    console.error('❌ Lỗi thêm dữ liệu mẫu:', err);
  }
};

module.exports = {
  getConnection,
  initDatabase,
  sql
};
