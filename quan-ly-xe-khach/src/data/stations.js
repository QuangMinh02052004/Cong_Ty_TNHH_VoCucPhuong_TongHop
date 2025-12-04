// Danh sách các trạm với STT chính xác
export const stations = [
  { stt: '1', name: 'An Đông' },
  { stt: '2', name: 'Ngã 4 Trần Phú-Lê Hồng Phong' },
  { stt: '3', name: 'Ngã 4 Trần Phú-Trần Bình Trọng' },
  { stt: '4', name: 'Nhà Sách Nguyễn Thị Minh Khai' },
  { stt: '5', name: 'BV Từ Dũ - Nguyễn Thị Minh Khai' },
  { stt: '6', name: 'Sở Y Tế - Nguyễn Thị Minh Khai' },
  { stt: '7', name: 'CV Tao Đàn - Nguyễn Thị Minh Khai' },
  { stt: '7.1', name: 'Trương Định - Nguyễn Thị Minh Khai' },
  { stt: '8', name: 'Cung VH Lao Động - Nguyễn Thị Minh Khai' },
  { stt: '9', name: 'N4 Nam Ki - Nguyễn Thị Minh Khai' },
  { stt: '10', name: 'Ngã 4 Pastuer - Nguyễn Thị Minh Khai' },
  { stt: '11', name: 'Nhà VH Thanh Niên  - Nguyễn Thị Minh Khai' },
  { stt: '12', name: 'Ngã 3 PK.Khoan - Nguyễn Thị Minh Khai' },
  { stt: '13', name: 'Ngã 4 M.Đ.Chi - Nguyễn Thị Minh Khai' },
  { stt: '14', name: 'Sân VD Hoa Lư - Nguyễn Thị Minh Khai' },
  { stt: '14.1', name: 'Ngã 4.Đinh Tiên Hoàng - Nguyễn Thị Minh Khai' },
  { stt: '15', name: 'Cầu Đen' },
  { stt: '16', name: 'Cầu Trắng' },
  { stt: '17', name: 'Metro' },
  { stt: '18', name: 'Cantavil' },
  { stt: '21', name: 'Ngã 4 MK' },
  { stt: '22', name: 'Ngã 4 Bình Thái' },
  { stt: '23', name: 'Ngã 4 Thủ Đức' },
  { stt: '24', name: 'Khu Công Nghệ Cao' },
  { stt: '25', name: 'Suối Tiên' },
  { stt: '26', name: 'Ngã 4 621' },
  { stt: '27', name: 'Tân Vạn' },
  { stt: '28', name: 'Ngã 3 Vũng Tàu' },
  { stt: '29', name: 'Bồn Nước' },
  { stt: '30', name: 'Tam Hiệp' },
  { stt: '31', name: 'Amata' },
  { stt: '32', name: 'BV Nhi Đồng Nai' },
  { stt: '33', name: 'Cầu Sập' },
  { stt: '34', name: 'Bến xe Hố Nai' },
  { stt: '35', name: 'Chợ Sặt' },
  { stt: '36', name: 'Công Viên 30/4' },
  { stt: '37', name: 'Bệnh Viện Thánh Tâm' },
  { stt: '38', name: 'Nhà thờ Thánh Tâm' },
  { stt: '39', name: 'Cây Xăng Lộ Đức' },
  { stt: '40', name: 'Nhà thờ Tiên Chu' },
  { stt: '41', name: 'Chợ Thái Bình' },
  { stt: '42', name: 'Nhà thờ Ngọc Đồng' },
  { stt: '43', name: 'Nhà thờ Ngô Xá' },
  { stt: '44', name: 'Nhà thờ Sài Quất' },
  { stt: '44.1', name: 'Ngũ Phúc' },
  { stt: '45', name: 'Nhà thờ Thái Hoà' },
  { stt: '45.1', name: 'Yên Thế' },
  { stt: '46', name: 'Chợ chiều Thanh Hoá' },
  { stt: '46.1', name: 'Nhà thờ Thanh Hoá' },
  { stt: '47', name: 'Ngã 3 Trị An' },
  { stt: '47.1', name: 'Nhà thờ Bùi Chu' },
  { stt: '48', name: 'Bắc Sơn' },
  { stt: '49', name: 'Phú Sơn' },
  { stt: '50', name: 'Nhà thờ Tân Thành' },
  { stt: '51', name: 'Nhà thờ Tân Bắc' },
  { stt: '52', name: 'Suối Đĩa' },
  { stt: '53', name: 'Nhà thờ Tân Bình' },
  { stt: '54', name: 'Trà Cổ' },
  { stt: '54.1', name: 'Bar Romance' },
  { stt: '55', name: 'Nhà thờ Quảng Biên' },
  { stt: '56', name: 'Chợ Quảng Biên' },
  { stt: '57', name: 'Sân Golf Trảng Bom' },
  { stt: '58', name: 'Bưu điện Trảng Bom' },
  { stt: '59', name: 'Bờ hồ Trảng Bom' },
  { stt: '60', name: 'Cây xăng Thành Thái' },
  { stt: '61', name: 'Trạm cân' },
  { stt: '62', name: 'KCN Bầu Xéo' },
  { stt: '63', name: 'Song Thạch' },
  { stt: '64', name: 'Chợ Lộc Hoà' },
  { stt: '65', name: 'Thu phí Bầu Cá' },
  { stt: '66', name: 'Nhà thờ Tâm An' },
  { stt: '67', name: 'Chợ Bầu Cá' },
  { stt: '68', name: 'Cây xăng Minh Trí' },
  { stt: '69', name: 'Ba cây Xoài Bầu Cá' },
  { stt: '70', name: 'Cổng vàng Hưng Long' },
  { stt: '71', name: 'Cây xăng Hưng Thịnh' },
  { stt: '72', name: 'Sông Thao' },
  { stt: '73', name: 'Chùa Vạn Thọ' },
  { stt: '74', name: 'Chợ Hưng Nghĩa' },
  { stt: '75', name: 'Trạm Giữa' },
  { stt: '76', name: 'Cây xăng Tam Hoàng' },
  { stt: '77', name: 'Đại Phát Đạt' },
  { stt: '78', name: 'Chợ Hưng Lộc' },
  { stt: '79', name: 'Nhà thờ Hưng Lộc' },
  { stt: '80', name: 'Cây xăng Hưng Lộc' },
  { stt: '81', name: 'Mì Quảng Thủy Tiên' },
  { stt: '82', name: 'Ngô Quyền Dầu Giây' },
  { stt: '83', name: 'Cây xăng Đặng Văn Bích' },
  { stt: '84', name: 'Bưu điện Dầu Giây' },
  { stt: '85', name: 'xã Xuân Thạnh Dầu Giây' },
  { stt: '86', name: 'Trung tâm Hành chính Dầu Giây' },
  { stt: '87', name: 'Bến xe Dầu Giây' },
  { stt: '88', name: 'Trạm 97' },
  { stt: '89', name: 'Cáp Rang' },
  { stt: '90', name: 'Bệnh viện Long Khánh' },
  { stt: '91', name: 'Cây Xăng Suối Tre' },
  { stt: '92', name: 'Dốc Lê Lợi' },
  { stt: '93', name: 'Cây xăng 222' },
  { stt: '94', name: 'Bến xe Long Khánh' }
];

// Hàm tìm STT của địa danh
export const findStationWithNumber = (address) => {
  if (!address || !address.trim()) {
    return null;
  }

  // Tìm địa danh trong danh sách stations
  const found = stations.find(station =>
    address.toLowerCase().includes(station.name.toLowerCase()) ||
    station.name.toLowerCase().includes(address.toLowerCase())
  );

  if (found) {
    return `${found.stt}. ${found.name}`;
  }

  // Nếu không tìm thấy trong danh sách, trả về địa chỉ gốc
  return address;
};

// Export danh sách tên trạm để dùng trong datalist
export const stationNames = stations.map(s => s.name);
