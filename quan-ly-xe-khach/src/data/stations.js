// Danh sách các trạm với STT chính xác + aliases viết tắt
export const stations = [
  { stt: '1', name: 'An Đông', aliases: ['an dong', 'a dong', 'adong'] },
  { stt: '2', name: 'Ngã 4 Trần Phú-Lê Hồng Phong', aliases: ['n4 tran phu le hong phong', 'nga 4 tran phu', 'n4 tphu lhp'] },
  { stt: '3', name: 'Ngã 4 Trần Phú-Trần Bình Trọng', aliases: ['n4 tran phu tran binh trong', 'n4 tphu tbt'] },
  { stt: '4', name: 'Nhà Sách Nguyễn Thị Minh Khai', aliases: ['nha sach ntmk', 'ns ntmk', 'nha sach'] },
  { stt: '5', name: 'BV Từ Dũ - Nguyễn Thị Minh Khai', aliases: ['bv tu du', 'tu du'] },
  { stt: '6', name: 'Sở Y Tế - Nguyễn Thị Minh Khai', aliases: ['so y te', 'syt ntmk'] },
  { stt: '7', name: 'CV Tao Đàn - Nguyễn Thị Minh Khai', aliases: ['cv tao dan', 'tao dan'] },
  { stt: '7.1', name: 'Trương Định - Nguyễn Thị Minh Khai', aliases: ['truong dinh', 'td ntmk'] },
  { stt: '8', name: 'Cung VH Lao Động - Nguyễn Thị Minh Khai', aliases: ['cung vh lao dong', 'cvh lao dong'] },
  { stt: '9', name: 'N4 Nam Ki - Nguyễn Thị Minh Khai', aliases: ['n4 nam ki', 'nam ki'] },
  { stt: '10', name: 'Ngã 4 Pastuer - Nguyễn Thị Minh Khai', aliases: ['n4 pasteur', 'pasteur', 'n4 pastuer'] },
  { stt: '11', name: 'Nhà VH Thanh Niên  - Nguyễn Thị Minh Khai', aliases: ['nha vh thanh nien', 'nvh thanh nien'] },
  { stt: '12', name: 'Ngã 3 PK.Khoan - Nguyễn Thị Minh Khai', aliases: ['n3 pk khoan', 'pk khoan'] },
  { stt: '13', name: 'Ngã 4 M.Đ.Chi - Nguyễn Thị Minh Khai', aliases: ['n4 md chi', 'md chi'] },
  { stt: '14', name: 'Sân VD Hoa Lư - Nguyễn Thị Minh Khai', aliases: ['svd hoa lu', 'hoa lu'] },
  { stt: '14.1', name: 'Ngã 4.Đinh Tiên Hoàng - Nguyễn Thị Minh Khai', aliases: ['n4 dinh tien hoang', 'dinh tien hoang', 'n4 dth'] },
  { stt: '15', name: 'Cầu Đen', aliases: ['cau den', 'cauden'] },
  { stt: '16', name: 'Cầu Trắng', aliases: ['cau trang', 'cautrang'] },
  { stt: '17', name: 'Metro', aliases: ['meto', 'me tro'] },
  { stt: '18', name: 'Cantavil', aliases: ['canta vil', 'kantavil'] },
  { stt: '21', name: 'Ngã 4 MK', aliases: ['n4 mk', 'minh khai'] },
  { stt: '22', name: 'Ngã 4 Bình Thái', aliases: ['n4 binh thai', 'binh thai'] },
  { stt: '23', name: 'Ngã 4 Thủ Đức', aliases: ['n4 thu duc', 'thu duc', 'n4 tduc'] },
  { stt: '24', name: 'Khu Công Nghệ Cao', aliases: ['kcnc', 'cong nghe cao'] },
  { stt: '25', name: 'Suối Tiên', aliases: ['suoi tien'] },
  { stt: '26', name: 'Ngã 4 621', aliases: ['n4 621', '621'] },
  { stt: '27', name: 'Tân Vạn', aliases: ['tan van', 'tanvan'] },
  { stt: '28', name: 'Ngã 3 Vũng Tàu', aliases: ['n3 vung tau', 'vung tau', 'n3 vtau'] },
  { stt: '29', name: 'Bồn Nước', aliases: ['bon nuoc', 'bonnuoc'] },
  { stt: '30', name: 'Tam Hiệp', aliases: ['tam hiep', 'tamhiep'] },
  { stt: '31', name: 'Amata', aliases: ['amata', 'amt'] },
  { stt: '32', name: 'BV Nhi Đồng Nai', aliases: ['bv nhi dong nai', 'nhi dong nai', 'bv nhi'] },
  { stt: '33', name: 'Cầu Sập', aliases: ['csap', 'cau sap'] },
  { stt: '34', name: 'Bến xe Hố Nai', aliases: ['bx hnai', 'hnai', 'bxe hnai'] },
  { stt: '35', name: 'Chợ Sặt', aliases: ['csat', 'cho sat'] },
  { stt: '36', name: 'Công Viên 30/4', aliases: ['30/4', 'cv 30/4', 'cv30.4'] },
  { stt: '37', name: 'Bệnh Viện Thánh Tâm', aliases: ['bv thanh tam', 'bv ttam'] },
  { stt: '38', name: 'Nhà thờ Thánh Tâm', aliases: ['nt thanh tam', 'thanh tam', 'nt ttam'] },
  { stt: '39', name: 'Cây Xăng Lộ Đức', aliases: ['cx lo duc', 'lduc', 'lo duc'] },
  { stt: '40', name: 'Nhà thờ Tiên Chu', aliases: ['nt tien chu', 'tien chu', 'nt tchu'] },
  { stt: '41', name: 'Chợ Thái Bình', aliases: ['cho thai binh', 'thai binh', 'cho tbinh'] },
  { stt: '42', name: 'Nhà thờ Ngọc Đồng', aliases: ['nt ngoc dong', 'ngoc dong', 'nt ndong'] },
  { stt: '43', name: 'Nhà thờ Ngô Xá', aliases: ['nt ngo xa', 'ngo xa', 'nt nxa'] },
  { stt: '44', name: 'Nhà thờ Sài Quất', aliases: ['nt sai quat', 'sai quat', 'nt squat'] },
  { stt: '44.1', name: 'Ngũ Phúc', aliases: ['ngu phuc', 'nguphuc', 'nphuc'] },
  { stt: '45', name: 'Nhà thờ Thái Hoà', aliases: ['nt thai hoa', 'thoa', 'thai hoa', 'nt thoa'] },
  { stt: '45.1', name: 'Yên Thế', aliases: ['yen the', 'yenthe', 'ythe'] },
  { stt: '46', name: 'Chợ chiều Thanh Hoá', aliases: ['cho chieu thanh hoa', 'cho thanh hoa'] },
  { stt: '46.1', name: 'Nhà thờ Thanh Hoá', aliases: ['nt thanh hoa'] },
  { stt: '47', name: 'Ngã 3 Trị An', aliases: ['tri an', 'n3 tri an'] },
  { stt: '47.1', name: 'Nhà thờ Bùi Chu', aliases: ['nt bui chu', 'bui chu', 'nt bchu'] },
  { stt: '48', name: 'Bắc Sơn', aliases: ['bac son', 'bacson', 'bson'] },
  { stt: '49', name: 'Phú Sơn', aliases: ['phu son', 'pson'] },
  { stt: '50', name: 'Nhà thờ Tân Thành', aliases: ['nt tan thanh', 'tan thanh', 'nt tthanh'] },
  { stt: '51', name: 'Nhà thờ Tân Bắc', aliases: ['tbac', 'tanbac', 'nt tbac', 'nt tan bac'] },
  { stt: '52', name: 'Suối Đĩa', aliases: ['suoi dia', 'suoidia', 'sdia'] },
  { stt: '53', name: 'Nhà thờ Tân Bình', aliases: ['tbinh', 'tanbinh', 'nt tbinh', 'nt tan binh'] },
  { stt: '54', name: 'Trà Cổ', aliases: ['tra co', 'traco', 'tco'] },
  { stt: '54.1', name: 'Bar Romance', aliases: ['bar romance', 'romance'] },
  { stt: '55', name: 'Nhà thờ Quảng Biên', aliases: ['qbien', 'nt qbien', 'nt quang bien'] },
  { stt: '56', name: 'Chợ Quảng Biên', aliases: ['cho quang bien', 'quang bien', 'cho qbien'] },
  { stt: '57', name: 'Sân Golf Trảng Bom', aliases: ['golf trang bom', 'golf tbom'] },
  { stt: '58', name: 'Bưu điện Trảng Bom', aliases: ['bd trang bom', 'bd tbom', 'tbom'] },
  { stt: '59', name: 'Bờ hồ Trảng Bom', aliases: ['bo ho trang bom', 'ho trang bom', 'ho tbom'] },
  { stt: '60', name: 'Cây xăng Thành Thái', aliases: ['cx thanh thai', 'cx tthai'] },
  { stt: '61', name: 'Trạm cân', aliases: ['tram can', 'tramcan'] },
  { stt: '62', name: 'KCN Bầu Xéo', aliases: ['kcn bau xeo', 'bau xeo', 'kcn bxeo', 'bxeo'] },
  { stt: '63', name: 'Song Thạch', aliases: ['song thach', 'songthach', 'sthach'] },
  { stt: '64', name: 'Chợ Lộc Hoà', aliases: ['cho loc hoa', 'loc hoa', 'cho lhoa'] },
  { stt: '65', name: 'Thu phí Bầu Cá', aliases: ['thu phi bau ca', 'tp bau ca', 'bau ca'] },
  { stt: '66', name: 'Nhà thờ Tâm An', aliases: ['tam an', 'nt tam an'] },
  { stt: '67', name: 'Chợ Bầu Cá', aliases: ['cho bau ca', 'bca'] },
  { stt: '68', name: 'Cây xăng Minh Trí', aliases: ['cx minh tri', 'minh tri', 'cx mtri'] },
  { stt: '69', name: 'Ba cây Xoài Bầu Cá', aliases: ['ba cay xoai bau ca', '3 cay xoai', 'ba cay xoai'] },
  { stt: '70', name: 'Cổng vàng Hưng Long', aliases: ['cong vang hung long', 'hung long'] },
  { stt: '71', name: 'Cây xăng Hưng Thịnh', aliases: ['cx hung thinh', 'hung thinh', 'cx hthinh'] },
  { stt: '72', name: 'Sông Thao', aliases: ['song thao', 'songthao', 'sthao'] },
  { stt: '73', name: 'Chùa Vạn Thọ', aliases: ['chua van tho', 'van tho'] },
  { stt: '74', name: 'Chợ Hưng Nghĩa', aliases: ['cho hung nghia', 'hung nghia'] },
  { stt: '75', name: 'Trạm Giữa', aliases: ['tram giua', 'giua'] },
  { stt: '76', name: 'Cây xăng Tam Hoàng', aliases: ['cx tam hoang', 'tam hoang'] },
  { stt: '77', name: 'Đại Phát Đạt', aliases: ['dai phat dat', 'phat dat', 'dpdat'] },
  { stt: '78', name: 'Chợ Hưng Lộc', aliases: ['cho hung loc', 'hung loc', 'hloc'] },
  { stt: '79', name: 'Nhà thờ Hưng Lộc', aliases: ['nt hung loc', 'nt hloc'] },
  { stt: '80', name: 'Cây xăng Hưng Lộc', aliases: ['cx hung loc', 'cx hloc'] },
  { stt: '81', name: 'Mì Quảng Thủy Tiên', aliases: ['mi quang thuy tien', 'mqttien'] },
  { stt: '82', name: 'Ngô Quyền Dầu Giây', aliases: ['ngo quyen dau giay', 'ngo quyen'] },
  { stt: '83', name: 'Cây xăng Đặng Văn Bích', aliases: ['cx dang van bich', 'cx dvbich', 'dang van bich'] },
  { stt: '84', name: 'Bưu điện Dầu Giây', aliases: ['bd dau giay', 'bd dgay'] },
  { stt: '85', name: 'xã Xuân Thạnh Dầu Giây', aliases: ['xuan thanh dau giay', 'xthanh dgay'] },
  { stt: '86', name: 'Trung tâm Hành chính Dầu Giây', aliases: ['tt hanh chinh dgay', 'tthc dgay'] },
  { stt: '87', name: 'Bến xe Dầu Giây', aliases: ['bx dau giay', 'bx dgay'] },
  { stt: '88', name: 'Trạm 97', aliases: ['tram 97', 't97', '97'] },
  { stt: '89', name: 'Cáp Rang', aliases: ['cap rang', 'caprang'] },
  { stt: '90', name: 'Bệnh viện Long Khánh', aliases: ['bv long khanh', 'bv lk'] },
  { stt: '91', name: 'Cây Xăng Suối Tre', aliases: ['cx suoi tre', 'suoi tre'] },
  { stt: '92', name: 'Dốc Lê Lợi', aliases: ['doc le loi', 'le loi'] },
  { stt: '93', name: 'Cây xăng 222', aliases: ['cx 222', '222'] },
  { stt: '94', name: 'Bến xe Long Khánh', aliases: ['bx long khanh', 'bx lk', 'ben xe lk'] }
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

// Bỏ dấu tiếng Việt, lowercase
function normalizeVietnamese(str) {
  if (!str) return '';
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  str = str.toLowerCase().replace(/\s+/g, ' ').trim();
  return str;
}

// Tìm trạm viết tắt trong chuỗi text (dùng cho ghi chú)
// Ví dụ: "giao minh tco 1 thùng" → { stt: '54', stationName: 'Trà Cổ', matchedText: 'tco' }
export const extractStationFromText = (text) => {
  if (!text || typeof text !== 'string') return null;

  const normalized = normalizeVietnamese(text);
  const words = normalized.split(' ');

  // Sort stations by alias length (longest first) để match chính xác hơn
  const sortedStations = [...stations].sort((a, b) => b.name.length - a.name.length);

  // Match aliases (sort longest first)
  for (const station of sortedStations) {
    if (!station.aliases || station.aliases.length === 0) continue;

    const sortedAliases = [...station.aliases].sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      const aliasNormalized = normalizeVietnamese(alias);
      // Kiểm tra alias xuất hiện như một từ riêng biệt (word boundary)
      const aliasWords = aliasNormalized.split(' ');

      for (let i = 0; i <= words.length - aliasWords.length; i++) {
        const slice = words.slice(i, i + aliasWords.length).join(' ');
        if (slice === aliasNormalized) {
          // Tìm vị trí trong text gốc để xóa
          const originalWords = text.trim().split(/\s+/);
          const matchedOriginal = originalWords.slice(i, i + aliasWords.length).join(' ');
          return {
            stt: station.stt,
            stationName: station.name,
            matchedText: matchedOriginal,
            startWordIndex: i,
            wordCount: aliasWords.length
          };
        }
      }
    }
  }

  return null;
};

// Xóa phần viết tắt trạm khỏi text, trả về text sạch
// Ví dụ: "giao minh tco 1 thùng" → "giao minh 1 thùng"
export const removeStationFromText = (text, matchResult) => {
  if (!text || !matchResult) return text;
  const words = text.trim().split(/\s+/);
  words.splice(matchResult.startWordIndex, matchResult.wordCount);
  return words.join(' ').trim();
};

// Export danh sách tên trạm để dùng trong datalist (chỉ tên - để backward compatible)
export const stationNames = stations.map(s => s.name);

// Export danh sách với STT - Name để hiển thị trong dropdown
export const stationNamesWithSTT = stations.map(s => {
  // Format STT để luôn có 2 chữ số (01, 02, ..., 10, 11, ...)
  const formattedSTT = String(s.stt).padStart(2, '0');
  return `${formattedSTT} - ${s.name}`;
});
