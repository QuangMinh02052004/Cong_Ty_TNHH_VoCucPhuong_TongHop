/**
 * Database Configuration - PostgreSQL (Neon)
 * Migrated from SQL Server to share database with vocucphuong.vercel.app
 */

const { Pool } = require('pg');
require('dotenv').config();

// Connection string - dùng chung với vocucphuong.vercel.app và Nhập Hàng
const connectionString = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_1XwtpYJIFC5i@ep-holy-recipe-a1pyfvtp-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

let pool = null;

/**
 * Get database connection pool
 */
const getPool = () => {
    if (!pool) {
        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
        console.log('✅ Đã kết nối PostgreSQL (Neon) - Tổng Hợp');
    }
    return pool;
};

/**
 * Execute SQL query with positional parameters ($1, $2, ...)
 */
const query = async (sqlQuery, values = []) => {
    try {
        const poolConnection = getPool();
        const result = await poolConnection.query(sqlQuery, values);
        return result.rows;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

/**
 * Execute SQL query and return single record
 */
const queryOne = async (sqlQuery, values = []) => {
    const results = await query(sqlQuery, values);
    return results.length > 0 ? results[0] : null;
};

/**
 * Initialize database tables
 */
const initDatabase = async () => {
    try {
        // Tạo bảng TH_TimeSlots (Khung giờ xe chạy - với prefix TH_ để phân biệt)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_TimeSlots" (
                id SERIAL PRIMARY KEY,
                time VARCHAR(10) NOT NULL,
                date VARCHAR(20),
                type VARCHAR(50),
                code VARCHAR(20),
                driver VARCHAR(100),
                phone VARCHAR(20),
                route VARCHAR(100),
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ TH_TimeSlots table ready');

        // Tạo bảng TH_Bookings (Đặt vé)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_Bookings" (
                id SERIAL PRIMARY KEY,
                "timeSlotId" INTEGER REFERENCES "TH_TimeSlots"(id) ON DELETE CASCADE,
                phone VARCHAR(20),
                name VARCHAR(200),
                gender VARCHAR(10),
                nationality VARCHAR(100),
                "pickupMethod" VARCHAR(50),
                "pickupAddress" VARCHAR(500),
                "dropoffMethod" VARCHAR(50),
                "dropoffAddress" VARCHAR(500),
                note TEXT,
                "seatNumber" INTEGER,
                amount DECIMAL(18,2),
                paid DECIMAL(18,2) DEFAULT 0,
                "timeSlot" VARCHAR(10),
                date VARCHAR(20),
                route VARCHAR(100),
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ TH_Bookings table ready');

        // Tạo bảng TH_Drivers (Tài xế)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_Drivers" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ TH_Drivers table ready');

        // Tạo bảng TH_Vehicles (Xe)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_Vehicles" (
                id SERIAL PRIMARY KEY,
                code VARCHAR(20) NOT NULL UNIQUE,
                type VARCHAR(50) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ TH_Vehicles table ready');

        // Tạo bảng TH_Stations (Trạm dừng)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_Stations" (
                id SERIAL PRIMARY KEY,
                station_name VARCHAR(200) NOT NULL,
                address VARCHAR(500),
                station_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ TH_Stations table ready');

        // Tạo bảng TH_Users (Người dùng hệ thống Tổng Hợp)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_Users" (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                "fullName" VARCHAR(100) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                role VARCHAR(20) DEFAULT 'user',
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW(),
                "lastLogin" TIMESTAMP
            )
        `);
        console.log('✅ TH_Users table ready');

        // Tạo bảng TH_Customers (Khách hàng)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_Customers" (
                id SERIAL PRIMARY KEY,
                phone VARCHAR(20) NOT NULL UNIQUE,
                customer_name VARCHAR(100),
                address VARCHAR(255),
                email VARCHAR(100),
                notes VARCHAR(500),
                "pickupType" VARCHAR(50),
                "pickupLocation" VARCHAR(500),
                "dropoffType" VARCHAR(50),
                "dropoffLocation" VARCHAR(500),
                total_bookings INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ TH_Customers table ready');

        // Tạo bảng TH_Freight (Hàng hóa)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_Freight" (
                id SERIAL PRIMARY KEY,
                time_slot_id INTEGER REFERENCES "TH_TimeSlots"(id) ON DELETE CASCADE,
                sender_customer_id INTEGER,
                receiver_customer_id INTEGER,
                receiver_name VARCHAR(100),
                receiver_phone VARCHAR(20),
                receiver_address VARCHAR(255),
                pickup_station_id INTEGER,
                delivery_station_id INTEGER,
                description VARCHAR(500) NOT NULL,
                weight DECIMAL(10,2),
                size_length DECIMAL(10,2),
                size_width DECIMAL(10,2),
                size_height DECIMAL(10,2),
                quantity INTEGER DEFAULT 1,
                freight_charge DECIMAL(10,2) DEFAULT 0,
                cod_amount DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT 'pending',
                pickup_time TIMESTAMP,
                delivery_time TIMESTAMP,
                special_instructions VARCHAR(500),
                created_by INTEGER,
                updated_by INTEGER,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✅ TH_Freight table ready');

        // Tạo bảng TH_SeatLocks (Khóa ghế tạm thời)
        await query(`
            CREATE TABLE IF NOT EXISTS "TH_SeatLocks" (
                id SERIAL PRIMARY KEY,
                "timeSlotId" INTEGER NOT NULL,
                "seatNumber" INTEGER NOT NULL,
                "lockedBy" VARCHAR(100) NOT NULL,
                "lockedByUserId" INTEGER,
                "lockedAt" TIMESTAMP DEFAULT NOW(),
                "expiresAt" TIMESTAMP NOT NULL,
                date VARCHAR(20) NOT NULL,
                route VARCHAR(100) NOT NULL,
                CONSTRAINT "UQ_SeatLock" UNIQUE ("timeSlotId", "seatNumber", date, route)
            )
        `);
        console.log('✅ TH_SeatLocks table ready');

        // Xóa các lock hết hạn
        await query('DELETE FROM "TH_SeatLocks" WHERE "expiresAt" < NOW()');

        console.log('✅ Database tables đã được khởi tạo!');

        // Insert dữ liệu mẫu nếu bảng trống
        await insertSampleData();

    } catch (err) {
        console.error('❌ Lỗi khởi tạo database:', err);
        throw err;
    }
};

/**
 * Insert sample data if tables are empty
 */
const insertSampleData = async () => {
    try {
        // Kiểm tra Drivers
        const driverCount = await queryOne('SELECT COUNT(*) as count FROM "TH_Drivers"');
        if (parseInt(driverCount.count) === 0) {
            await query(`
                INSERT INTO "TH_Drivers" (name, phone) VALUES
                ('TX Thanh Bắc', '0918026316'),
                ('TX. Phong M X', '0912345678'),
                ('TX. Minh', '0987654321'),
                ('TX. Hùng', '0909123456')
            `);
            console.log('✅ Đã thêm dữ liệu mẫu cho TH_Drivers');
        }

        // Kiểm tra Vehicles
        const vehicleCount = await queryOne('SELECT COUNT(*) as count FROM "TH_Vehicles"');
        if (parseInt(vehicleCount.count) === 0) {
            await query(`
                INSERT INTO "TH_Vehicles" (code, type) VALUES
                ('60BO5307', 'Xe 28G'),
                ('51B26542', 'Xe 28G'),
                ('51B12345', 'Xe 16G'),
                ('60BO1234', 'Xe 28G')
            `);
            console.log('✅ Đã thêm dữ liệu mẫu cho TH_Vehicles');
        }

        // Kiểm tra Users
        const userCount = await queryOne('SELECT COUNT(*) as count FROM "TH_Users"');
        if (parseInt(userCount.count) === 0) {
            await query(`
                INSERT INTO "TH_Users" (username, password, "fullName", role) VALUES
                ('admin', 'admin123', 'Administrator', 'admin'),
                ('quanly1', 'admin123', 'Quản lý 1', 'manager'),
                ('nhanvien1', 'admin123', 'Nhân viên 1', 'user')
            `);
            console.log('✅ Đã thêm dữ liệu mẫu cho TH_Users');
        }

    } catch (err) {
        console.error('❌ Lỗi thêm dữ liệu mẫu:', err);
    }
};

/**
 * Close database connection
 */
const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Đã đóng kết nối PostgreSQL');
    }
};

// Tương thích với code cũ
const getConnection = getPool;

module.exports = {
    getPool,
    getConnection,
    query,
    queryOne,
    initDatabase,
    closePool
};
