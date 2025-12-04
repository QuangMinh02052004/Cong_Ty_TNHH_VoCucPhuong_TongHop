-- Tạo bảng Freight (Hàng hóa)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Freight' and xtype='U')
BEGIN
  CREATE TABLE Freight (
    id INT IDENTITY(1,1) PRIMARY KEY,
    time_slot_id INT NOT NULL,

    -- Thông tin người gửi
    sender_customer_id INT NULL,

    -- Thông tin người nhận
    receiver_customer_id INT NULL,
    receiver_name NVARCHAR(100) NULL,
    receiver_phone NVARCHAR(20) NULL,
    receiver_address NVARCHAR(255) NULL,

    -- Điểm đón/trả hàng
    pickup_station_id INT NULL,
    delivery_station_id INT NULL,

    -- Thông tin hàng hóa
    description NVARCHAR(500) NOT NULL,
    weight DECIMAL(10,2) NULL, -- Cân nặng (kg)
    size_length DECIMAL(10,2) NULL, -- Chiều dài (cm)
    size_width DECIMAL(10,2) NULL, -- Chiều rộng (cm)
    size_height DECIMAL(10,2) NULL, -- Chiều cao (cm)
    quantity INT DEFAULT 1, -- Số lượng kiện hàng

    -- Thông tin phí và thanh toán
    freight_charge DECIMAL(10,2) DEFAULT 0, -- Cước phí vận chuyển
    cod_amount DECIMAL(10,2) DEFAULT 0, -- Tiền thu hộ (COD)

    -- Trạng thái và tracking
    status NVARCHAR(20) DEFAULT 'pending', -- pending, picked_up, in_transit, delivered, cancelled
    pickup_time DATETIME NULL,
    delivery_time DATETIME NULL,

    -- Ghi chú
    special_instructions NVARCHAR(500) NULL,

    -- Metadata
    created_by INT NULL,
    updated_by INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    -- Foreign keys
    FOREIGN KEY (time_slot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_customer_id) REFERENCES Customers(id),
    FOREIGN KEY (receiver_customer_id) REFERENCES Customers(id),
    FOREIGN KEY (pickup_station_id) REFERENCES Stations(id),
    FOREIGN KEY (delivery_station_id) REFERENCES Stations(id),
    FOREIGN KEY (created_by) REFERENCES Users(id),
    FOREIGN KEY (updated_by) REFERENCES Users(id)
  );

  PRINT 'Bảng Freight đã được tạo thành công';
END
ELSE
BEGIN
  PRINT 'Bảng Freight đã tồn tại';
END;

-- Tạo indexes để tối ưu truy vấn
CREATE INDEX idx_freight_timeslot ON Freight(time_slot_id);
CREATE INDEX idx_freight_status ON Freight(status);
CREATE INDEX idx_freight_sender ON Freight(sender_customer_id);
CREATE INDEX idx_freight_created_at ON Freight(created_at);
