export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// 1. THỜI LƯỢNG TỪNG PHÂN ĐOẠN (tính bằng GIÂY)
// Bạn tự tăng/giảm cho khớp độ dài clip thực tế của mình
export const DURATIONS = {
  intro: 5,              // Intro giới thiệu luận văn
  s1_homing: 12.5,          // Phân đoạn 1: GW1 Homing về gốc 0°
  s2_fieldProof: 8,      // Phân đoạn 2: Lưới 2x2 (GW1, Node 1, Node 2, GW2)
  s3_broadcast: 11.5,      // Phân đoạn 3: GW1 quét Broadcast (đã tua nhanh)
  s4_online: 105,         // Phân đoạn 4: GW1 Online + 2 GG Maps + App Mobi-WSN
  s5_offlineCompass: 8,  // Phân đoạn 5: GW1 Offline -> La bàn GW1 & GW2 (5 giây)
  s6_relayResume: 150,    // Phân đoạn 6: Quay lại GW1 + 2 GG Maps + App (Relay)
  s7_onlineReturn: 48, // Phân đoạn 7: Quay lại GW1 + 2 GG Maps + App (Online)
  outro: 5,              // Outro cảm ơn hội đồng
};

// Tốc độ tua nhanh cho Phân đoạn 3 (Broadcast): ví dụ 4 = tua nhanh 4x
export const BROADCAST_SPEED = 6;

export type MediaSlotConfig = {
  /**
   * - Điền tên tệp trong thư mục public/ (hỗ trợ cả video .mp4/.MOV lẫn ảnh .png/.jpg)
   * - Để null nếu chưa có video -> hệ thống tự tạo khung Note ghi chú thay thế
   */
  file: string | null;
  startSec?: number;       // Giây bắt đầu cắt trong video gốc (mặc định 0)
  cuts?: Array<{ fromSec: number; toSec: number }>; // Cắt nhiều phân đoạn trong video gốc (mặc định null)
  playbackRate?: number;   // Tốc độ phát (mặc định 1)
  muted?: boolean;         // Tắt tiếng clip gốc (mặc định true)
  objectFit: 'cover' | 'contain'; // 'cover': cắt gọn vừa ô | 'contain': giữ nguyên 100% không cắt
  objectPosition?: string;
  note: string;            // Ghi chú hiển thị khi file = null
  scale?: number;          // Tỷ lệ phóng to/thu nhỏ (mặc định 1)
};

// 2. KHAI BÁO CÁC VIDEO / ẢNH THAY THẾ (đặt trong thư mục public/)
export const MEDIA: Record<string, MediaSlotConfig> = {
  // GW1 đoạn Homing + tiếp nối sang cảnh 2x2
  gw1_homing: {
    file: 'gateway1.full.MOV', // Đổi thành null nếu chưa muốn gắn
    startSec: 0,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW1 thực hiện Homing về gốc 0°',
  },
  
  // GW1 đoạn minh chứng lưới 2x2
  gw1_fieldProof: {
    file: 'gateway1.full.MOV',
    startSec: 16, // Bù hệ số playbackRate để nối tiếp đúng giây 12.5
    playbackRate: 0.25,                   // Giảm tốc độ x2 (đổi thành 0.7 nếu muốn chậm nhẹ hơn)
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW1 tại Tầng 8 Tòa nhà Công nghệ cao ĐH Cần Thơ',
  },

  // GW1 đoạn quét Broadcast 8 góc (sẽ tự áp dụng BROADCAST_SPEED)
  gw1_broadcast: {
    file: 'gateway1.full.MOV',
    startSec: 12.5, // Chỉnh lại giây bắt đầu phát Broadcast trong clip gốc
    playbackRate: BROADCAST_SPEED,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW1 xoay 8 góc 45° phát Broadcast tìm Node',
  },

  // GW1 đoạn đang bám Node (chạy song song với App)
  gw1_online: {
    file: 'gateway1.full.MOV',
    startSec: (12.5 + DURATIONS.s3_broadcast) * BROADCAST_SPEED, // Chỉnh lại đúng giây GW1 phát xong Broadcast để khớp với App
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW1 tự động xoay ăng-ten Yagi bám Node 1 & Node 2',
  },

  gw1_relay: {
    file: 'gateway1.full.MOV', // Đổi thành tên tệp video mới bạn muốn gắn vào khúc sau
    startSec: (12.5 + DURATIONS.s3_broadcast) * BROADCAST_SPEED + DURATIONS.s4_online + 26.5,               // Tự chỉnh giây bắt đầu của video mới
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW1 chuyển tiếp dữ liệu qua GW2 (13,8 km)',
  },

  gw1_onlineReturn: {
    file: 'gateway1.full.MOV', // Đổi tên tệp nếu bạn dùng video khác
    startSec: (12.5 + DURATIONS.s3_broadcast) * BROADCAST_SPEED + DURATIONS.s4_online + DURATIONS.s5_offlineCompass + 26.5 + DURATIONS.s6_relayResume,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW1 có Internet trở lại, tiếp tục xoay ăng-ten bám Node',
  },

  // GW1 đặt la bàn lúc mất Internet (Phân đoạn 5 - 5 giây)
  gw1_compass: {
    file: 'gateway1.huongvegw22.MOV', // Có thể đổi thành 'note_gw1_laban.png' hoặc tên video khi quay xong
    startSec: 30,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW1 đặt la bàn chứng minh góc 306,0° hướng về GW2',
  },

  // GW2 vị trí lắp đặt (Phân đoạn 2)
  gw2_location: {
    file: 'gateway2.ngang.MOV', // Ví dụ: 'gateway2.ngang.MOV' hoặc ảnh thay thế
    startSec: 14,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: Vị trí lắp đặt GW2 tại Tầng 9 BV Lao & Bệnh phổi (13,8 km)',
  },

  // GW2 đặt la bàn chứng minh hướng về GW1 (Phân đoạn 5 - 5 giây)
  gw2_compass: {
    file: 'gateway2.ngang.MOV', 
    startSec: 0,
    playbackRate: 0.5, // Chỉnh tốc độ chậm lại để khớp với thời lượng 5 giây
    objectPosition: '62% 50%',
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: GW2 đặt la bàn chứng minh góc 126,0° hướng về GW1',
  },

  // Minh chứng thực tế ngoài đường của Node 1 & Node 2 (Phân đoạn 2)
  node1_field: {
    file: null,
    startSec: 0,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: Minh chứng thực tế Node 1 di chuyển ngoài đường',
  },
  node2_field: {
    file: null,
    startSec: 0,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: Minh chứng thực tế Node 2 di chuyển ngoài đường',
  },

  // 2 bản đồ Google Maps đối chiếu đường đi thực tế (Phân đoạn 4 & 6)
  gmap_node1: {
    file: null,
    startSec: 0,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: Quay màn hình Google Maps quỹ đạo thực tế Node 1',
  },
  gmap_node2: {
    file: null,
    startSec: 0,
    muted: true,
    objectFit: 'cover',
    note: 'CHƯA CÓ VIDEO: Quay màn hình Google Maps quỹ đạo thực tế Node 2',
  },

  // ỨNG DỤNG MOBI - WSN (QUAY DỌC - LUÔN DÙNG 'contain' ĐỂ KHÔNG BAO GIỜ CẮT KHUNG HÌNH)
  app_screen: {
    file: 'app1.mp4',
    startSec: 587,
    //529.5, // Chỉnh đúng giây bản đồ bắt đầu hiện lên để khớp GW1
    scale: 1.025, // Phóng to 2% để khớp với khung video quay dọc
    muted: true,
    objectFit: 'contain',
    note: 'CHƯA CÓ VIDEO: Màn hình ứng dụng Mobi - WSN (khung dọc)',
  },

  app_relay: {
    file: 'app1.mp4',          // Đổi thành tên tệp video App mới bạn muốn gắn vào khúc sau
    startSec: 712,               // Tự chỉnh giây bắt đầu của video mới
    scale: 1.025,
    muted: true,
    objectFit: 'contain',
    note: 'CHƯA CÓ VIDEO: Màn hình ứng dụng Mobi - WSN (Chế độ Relay)',
  },

    // APP Phân đoạn 7: Hết Relay, quay về Online (bắt đầu từ 05:00.00 - tự chỉnh riêng)
  app_onlineReturn: {
    file: 'app1.mp4',          // Đổi tên tệp nếu bạn dùng video App khác
    startSec: 712 + 6 + DURATIONS.s5_offlineCompass + DURATIONS.s6_relayResume, // Nối tiếp sau app_relay (= 870s)
    scale: 1.025,
    muted: true,
    objectFit: 'contain',
    note: 'CHƯA CÓ VIDEO: Màn hình ứng dụng Mobi - WSN (Quay về chế độ Online)',
  },
};

// 3. THÔNG TIN INTRO / OUTRO
export const THESIS_INFO = {
  university: 'ĐẠI HỌC CẦN THƠ – TRƯỜNG BÁCH KHOA | KHOA ĐIỆN TỬ - VIỄN THÔNG',
  subtitle: 'VIDEO DEMO LUẬN VĂN TỐT NGHIỆP',
  title: 'THIẾT KẾ VÀ THỰC HIỆN GATEWAY LORA CHO MẠNG CẢM BIẾN KHÔNG DÂY DI ĐỘNG',
  students: 'SVTH: Lê Tiến Đạt (B2308281) – Nguyễn Hoàng Khải (B2308304) | Kỹ thuật Máy tính K49',
  advisor: 'Cán bộ hướng dẫn: TS. Trương Phong Tuyên  •  Cần Thơ, tháng 12/2026',
  outroTitle: 'XIN CHÂN THÀNH CẢM ƠN QUÝ THẦY CÔ HỘI ĐỒNG VÀ CÁC BẠN ĐÃ THEO DÕI!',
};

// 4. DANH SÁCH PHỤ ĐỀ (đã khớp theo DURATIONS hiện tại)
export const SUBTITLES: Array<{ startSec: number; endSec: number; text: string }> = [
  // Phân đoạn 1: Homing (5.0s -> 17.5s)
  {
    startSec: 5.5,
    endSec: 17,
    text: 'Trạm Gateway 1 khởi động và thực hiện Homing về công tắc hành trình tại góc gốc 0° (hướng Bắc thực).',
  },

  // Phân đoạn 2: Lưới 2x2 (17.5s -> 25.5s)
  {
    startSec: 18,
    endSec: 25,
    text: 'Bố trí thực địa tại TP. Cần Thơ: GW1 tại Tòa nhà Công nghệ cao, GW2 cách 13,8 km và 2 nút cảm biến di động ngoài đường.',
  },

  // Phân đoạn 3: Broadcast (25.5s -> 37.0s)
  {
    startSec: 26,
    endSec: 36.5,
    text: 'Gateway 1 xoay ăng-ten Yagi 11 dBi qua 8 góc (45°/bước) phát gói Broadcast dò tìm danh sách nút cảm biến (tua nhanh 6x).',
  },

  // Phân đoạn 4: Online (37.0s -> 142.0s)
  {
    startSec: 37.5,
    endSec: 50,
    text: 'Chế độ Online: GW1 tự động xoay bám Node 1 & Node 2, đồng bộ quỹ đạo trực tiếp lên ứng dụng Mobi - WSN và khớp với Google Maps.',
  },
  // TODO: Tự chỉnh lại startSec / endSec cho khớp lúc bạn bấm Focus Node 1 (trong khoảng 51s -> 141s)
  {
    startSec: 60,
    endSec: 70,
    text: 'Chế độ Tập trung (Focus) Node 1: Ứng dụng gửi lệnh điều khiển GW1 ưu tiên bám sát và cập nhật liên tục quỹ đạo của Node 1.',
  },

  // Phân đoạn 5: Offline - La bàn (142.0s -> 150.0s)
  {
    startSec: 142.5,
    endSec: 149.5,
    text: 'Khi GW1 mất Internet (Offline), ăng-ten xoay về góc 306,0° truyền chuyển tiếp LoRa 13,8 km sang GW2 (cố định góc 126,0°).',
  },

  // Phân đoạn 6: Relay (150.0s -> 300.0s)
  {
    startSec: 150.5,
    endSec: 163,
    text: 'Ứng dụng Mobi - WSN chuyển trạng thái Relay GW2, dữ liệu quỹ đạo 2 nút vẫn tiếp tục được cập nhật liên tục qua tuyến LoRa 13,8 km.',
  },
  // TODO: Tự chỉnh lại startSec / endSec cho khớp lúc bạn bấm Focus Node 2 (trong khoảng 164s -> 299s)
  {
    startSec: 210,
    endSec: 222,
    text: 'Chế độ Tập trung (Focus) Node 2 qua Relay: Hệ thống vẫn duy trì lệnh điều khiển từ xa, bám sát quỹ đạo Node 2 dù GW1 mất Internet.',
  },

  // Phân đoạn 7: Online trở lại (300.0s -> 348.0s)
  {
    startSec: 300.5,
    endSec: 315,
    text: 'Gateway 1 có kết nối Internet trở lại, tự động chuyển về chế độ Online và tiếp tục bám mục tiêu trực tiếp.',
  },
];