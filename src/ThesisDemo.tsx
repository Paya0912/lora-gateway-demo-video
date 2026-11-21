import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  BROADCAST_SPEED,
  DURATIONS,
  MEDIA,
  SUBTITLES,
  THESIS_INFO,
} from './config';
import { SmartMedia } from './SmartMedia';

type Rect = { left: number; top: number; width: number; height: number };

const RECT_CENTER: Rect = { left: 160, top: 88, width: 1600, height: 900 };
const RECT_2X2_TL: Rect = { left: 24, top: 84, width: 924, height: 474 };
const RECT_2X2_TR: Rect = { left: 972, top: 84, width: 924, height: 474 };
const RECT_2X2_BL: Rect = { left: 24, top: 582, width: 924, height: 474 };
const RECT_2X2_BR: Rect = { left: 972, top: 582, width: 924, height: 474 };

const RECT_ONLINE_TL: Rect = { left: 24, top: 84, width: 1328, height: 620 };
const RECT_MAP_1: Rect = { left: 24, top: 724, width: 654, height: 332 };
const RECT_MAP_2: Rect = { left: 698, top: 724, width: 654, height: 332 };
const RECT_GW1_COMPASS: Rect = { left: 24, top: 84, width: 654, height: 972 };
const RECT_GW2_COMPASS: Rect = { left: 698, top: 84, width: 654, height: 972 };
const RECT_APP_RIGHT: Rect = { left: 1376, top: 84, width: 520, height: 972 };

const lerpRect = (
  frame: number,
  startFrame: number,
  endFrame: number,
  from: Rect,
  to: Rect
): Rect => {
  const progress = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  return {
    left: from.left + (to.left - from.left) * progress,
    top: from.top + (to.top - from.top) * progress,
    width: from.width + (to.width - from.width) * progress,
    height: from.height + (to.height - from.height) * progress,
  };
};

export const getTotalFrames = (fps: number) => {
  const totalSec =
    DURATIONS.intro +
    DURATIONS.s1_homing +
    DURATIONS.s2_fieldProof +
    DURATIONS.s3_broadcast +
    DURATIONS.s4_online +
    DURATIONS.s5_offlineCompass +
    DURATIONS.s6_relayResume +
    DURATIONS.s7_onlineReturn +
    DURATIONS.outro;
  return Math.round(totalSec * fps);
};

export const ThesisDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mốc thời gian (tính theo số frame)
  const TRANS = Math.round(0.5 * fps); // Thời gian thu phóng mượt = 0.5 giây
  const fIntroEnd = Math.round(DURATIONS.intro * fps);
  const fS1End = fIntroEnd + Math.round(DURATIONS.s1_homing * fps);
  const fS2End = fS1End + Math.round(DURATIONS.s2_fieldProof * fps);
  const fS3End = fS2End + Math.round(DURATIONS.s3_broadcast * fps);
  const fS4End = fS3End + Math.round(DURATIONS.s4_online * fps);
  const fS5End = fS4End + Math.round(DURATIONS.s5_offlineCompass * fps);
  const fS6End = fS5End + Math.round(DURATIONS.s6_relayResume * fps);
  const fS7End = fS6End + Math.round(DURATIONS.s7_onlineReturn * fps);
  const fTotal = fS7End + Math.round(DURATIONS.outro * fps);

  // Tính tọa độ mượt cho khung GW1 qua các phân đoạn
  let gw1Rect: Rect = RECT_CENTER;
  if (frame < fS1End) {
    gw1Rect = RECT_CENTER;
  } else if (frame < fS1End + TRANS) {
    gw1Rect = lerpRect(frame, fS1End, fS1End + TRANS, RECT_CENTER, RECT_2X2_TL);
  } else if (frame < fS2End) {
    gw1Rect = RECT_2X2_TL;
  } else if (frame < fS2End + TRANS) {
    gw1Rect = lerpRect(frame, fS2End, fS2End + TRANS, RECT_2X2_TL, RECT_CENTER);
  } else if (frame < fS3End) {
    gw1Rect = RECT_CENTER;
  } else if (frame < fS3End + TRANS) {
    gw1Rect = lerpRect(frame, fS3End, fS3End + TRANS, RECT_CENTER, RECT_ONLINE_TL);
  } else {
    gw1Rect = RECT_ONLINE_TL;
  }

  // Độ mờ cho 3 ô phụ ở Phân đoạn 2 (2x2)
  const s2GridOpacity =
    frame >= fS1End && frame < fS2End
      ? interpolate(
          frame,
          [fS1End, fS1End + TRANS, fS2End - 8, fS2End],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )
      : 0;

  // Hiệu ứng trượt mượt cho App Mobi-WSN và 2 Google Maps khi vào Phân đoạn 4
  const onlinePhaseProgress = interpolate(frame, [fS3End, fS3End + TRANS], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const appTranslateX = (1 - onlinePhaseProgress) * 560;

  // Xác định tiêu đề thanh trên cùng theo từng phân đoạn
  let headerTitle = '';
  let headerAccent = '#0F2C59';
  if (frame >= fIntroEnd && frame < fS1End) {
    headerTitle = 'GIAI ĐOẠN 1: KHỞI ĐỘNG & ĐỊNH CHUẨN VỊ TRÍ GỐC 0° (HOMING) – GATEWAY 1';
  } else if (frame >= fS1End && frame < fS2End) {
    headerTitle = 'BỐ TRÍ THỰC ĐỊA: GATEWAY 1, GATEWAY 2 (13,8 KM) & 2 NÚT DI ĐỘNG';
  } else if (frame >= fS2End && frame < fS3End) {
    headerTitle = 'GIAI ĐOẠN 2: QUÉT MẠNG BROADCAST (8 GÓC 45° TỪ 0° ĐẾN 315°)';
  } else if (frame >= fS3End && frame < fS4End) {
    headerTitle = 'CHẾ ĐỘ ONLINE: BÁM MỤC TIÊU TỰ ĐỘNG & ĐỐI CHIẾU TRỰC TIẾP VỚI ỨNG DỤNG MOBI - WSN';
    headerAccent = '#047857';
  } else if (frame >= fS4End && frame < fS5End) {
    headerTitle = 'CHẾ ĐỘ OFFLINE (MẤT INTERNET): ĐỊNH HƯỚNG CHUYỂN TIẾP DỰ PHÒNG GW1 (306°) ↔ GW2 (126°)';
    headerAccent = '#C2410C';
  } else if (frame >= fS5End && frame < fS6End) {
    headerTitle = 'CHẾ ĐỘ RELAY: TIẾP TỤC CẬP NHẬT QUỸ ĐẠO LIÊN TỤC QUA TUYẾN LORA 13,8 KM';
    headerAccent = '#B45309';
  } else if (frame >= fS6End && frame < fS7End) {
    headerTitle = 'CHẾ ĐỘ ONLINE TRỞ LẠI: GW1 CÓ INTERNET & TIẾP TỤC BÁM MỤC TIÊU TỰ ĐỘNG';
    headerAccent = '#047857';
  }

  // Tìm phụ đề theo giây hiện tại
  const currentSec = frame / fps;
  const activeSubtitle = SUBTITLES.find(
    (sub) => currentSec >= sub.startSec && currentSec <= sub.endSec
  );

  const isRightAppVisible = frame >= fS3End && frame < fS7End;

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFFFF' }}>
      {/* ================= INTRO ================= */}
      <Sequence from={0} durationInFrames={fIntroEnd}>
        <AbsoluteFill
          style={{
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 120px',
            textAlign: 'center',
            fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 700, color: '#475569', letterSpacing: 1 }}>
            {THESIS_INFO.university}
          </div>
          <div
            style={{
              width: 140,
              height: 5,
              backgroundColor: '#0F2C59',
              margin: '24px 0',
              borderRadius: 4,
            }}
          />
          <div style={{ fontSize: 32, fontWeight: 800, color: '#0284C7', marginBottom: 16 }}>
            {THESIS_INFO.subtitle}
          </div>
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: '#0F2C59',
              lineHeight: 1.28,
              maxWidth: 1500,
              marginBottom: 42,
            }}
          >
            {THESIS_INFO.title}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#1E293B', marginBottom: 12 }}>
            {THESIS_INFO.students}
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: '#475569' }}>
            {THESIS_INFO.advisor}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ================= THANH TIÊU ĐỀ PHÍA TRÊN (PHÂN ĐOẠN 1 -> 7) ================= */}
      {frame >= fIntroEnd && frame < fS7End && (
        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 16,
            width: 1872,
            height: 54,
            backgroundColor: '#F8FAFC',
            borderLeft: `8px solid ${headerAccent}`,
            borderBottom: '2px solid #E2E8F0',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 18,
            fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
            fontSize: 23,
            fontWeight: 800,
            color: headerAccent,
            boxSizing: 'border-box',
          }}
        >
          {headerTitle}
        </div>
      )}

      {/* ================= PHÂN ĐOẠN 1: GW1 HOMING (TỐC ĐỘ GỐC 1x) ================= */}
      <Sequence from={fIntroEnd} durationInFrames={fS1End - fIntroEnd}>
        <div style={{ position: 'absolute', ...gw1Rect }}>
          <SmartMedia
            media={MEDIA.gw1_homing}
            label="Gateway 1 – Tầng 8 Tòa nhà Công nghệ cao ĐH Cần Thơ"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* ================= PHÂN ĐOẠN 2: GW1 THU NHỎ LÊN TRÊN TRÁI (TUA CHẬM RIÊNG) ================= */}
      <Sequence from={fS1End} durationInFrames={fS2End - fS1End}>
        <div style={{ position: 'absolute', ...gw1Rect }}>
          <SmartMedia
            media={MEDIA.gw1_fieldProof}
            label="Gateway 1 – Tầng 8 Tòa nhà Công nghệ cao ĐH Cần Thơ"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* 3 Ô PHỤ Ở PHÂN ĐOẠN 2 (NODE 1 TRÊN PHẢI, NODE 2 DƯỚI PHẢI, GW2 DƯỚI TRÁI) */}
      <Sequence from={fS1End} durationInFrames={fS2End - fS1End}>
        <div style={{ position: 'absolute', ...RECT_2X2_TR, opacity: s2GridOpacity }}>
          <SmartMedia
            media={MEDIA.node1_field}
            label="Node 1 – Minh chứng thực tế di chuyển ngoài đường"
            accentColor="#0284C7"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div style={{ position: 'absolute', ...RECT_2X2_BR, opacity: s2GridOpacity }}>
          <SmartMedia
            media={MEDIA.node2_field}
            label="Node 2 – Minh chứng thực tế di chuyển ngoài đường"
            accentColor="#EA580C"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div style={{ position: 'absolute', ...RECT_2X2_BL, opacity: s2GridOpacity }}>
          <SmartMedia
            media={MEDIA.gw2_location}
            label="Gateway 2 – Tầng 9 BV Lao & Bệnh phổi TP. Cần Thơ (13,8 km)"
            accentColor="#B45309"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* ================= PHÂN ĐOẠN 3: PHÓNG TO LẠI GW1 & TUA NHANH BROADCAST ================= */}
      <Sequence from={fS2End} durationInFrames={fS3End - fS2End}>
        <div style={{ position: 'absolute', ...gw1Rect }}>
          <SmartMedia
            media={MEDIA.gw1_broadcast}
            label="Gateway 1 – Phát Broadcast quét 8 góc phương vị (45°/bước)"
            badgeText={`⏩ TUA NHANH ${BROADCAST_SPEED}x`}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* ================= 2 GOOGLE MAPS CHẠY LIÊN TỤC (PHÂN ĐOẠN 4 -> 6) ================= */}
      <Sequence from={fS3End} durationInFrames={fS7End - fS3End}>
        <div style={{ position: 'absolute', ...RECT_MAP_1, opacity: onlinePhaseProgress }}>
          <SmartMedia
            media={MEDIA.gmap_node1}
            label="Google Maps thực tế – Node 1"
            accentColor="#0284C7"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div style={{ position: 'absolute', ...RECT_MAP_2, opacity: onlinePhaseProgress }}>
          <SmartMedia
            media={MEDIA.gmap_node2}
            label="Google Maps thực tế – Node 2"
            accentColor="#EA580C"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* ================= PHÂN ĐOẠN 4 (ONLINE): GW1 & APP KHÚC TRƯỚC ================= */}
      <Sequence from={fS3End} durationInFrames={fS4End - fS3End}>
        {/* CỘT TRÁI TRÊN: GW1 Online */}
        <div style={{ position: 'absolute', ...gw1Rect }}>
          <SmartMedia
            media={MEDIA.gw1_online}
            label="Gateway 1 – Tự động xoay ăng-ten Yagi bám Node 1 & Node 2"
            accentColor="#047857"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* CỘT BÊN PHẢI: App Mobi - WSN Online */}
        <div
          style={{
            position: 'absolute',
            ...RECT_APP_RIGHT,
            transform: `translateX(${appTranslateX}px)`,
            opacity: onlinePhaseProgress,
          }}
        >
          <SmartMedia
            media={MEDIA.app_screen}
            label="Ứng dụng giám sát thời gian thực Mobi - WSN"
            accentColor="#0F2C59"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* ================= PHÂN ĐOẠN 5 & 6 (OFFLINE / RELAY): GW1 & APP KHÚC SAU (ĐỘC LẬP) ================= */}
      <Sequence from={fS4End} durationInFrames={fS6End - fS4End}>
        {/* CỘT TRÁI TRÊN: GW1 Relay (tự chỉnh video mới trong MEDIA.gw1_relay) */}
        <div style={{ position: 'absolute', ...RECT_ONLINE_TL }}>
          <SmartMedia
            media={MEDIA.gw1_relay}
            label="Gateway 1 – Chuyển tiếp dữ liệu qua GW2 (13,8 km)"
            accentColor="#B45309"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* CỘT BÊN PHẢI: App Mobi - WSN Relay (tự chỉnh video mới trong MEDIA.app_relay) */}
        <div style={{ position: 'absolute', ...RECT_APP_RIGHT }}>
          <SmartMedia
            media={MEDIA.app_relay}
            label="Ứng dụng giám sát thời gian thực Mobi - WSN"
            accentColor="#0F2C59"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* ================= PHÂN ĐOẠN 5 (LỚP PHỦ 5 GIÂY): MINH CHỨNG LA BÀN GW1 & GW2 ================= */}
      <Sequence from={fS4End} durationInFrames={fS5End - fS4End}>
        {/* Nền trắng che khe hở 20px ở giữa để không lộ video GW1 bên dưới */}
        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 84,
            width: 1328,
            height: 972,
            backgroundColor: '#FFFFFF',
          }}
        />

        {/* Ô DỌC TRÁI: GW1 đặt la bàn */}
        <div style={{ position: 'absolute', ...RECT_GW1_COMPASS, backgroundColor: '#FFFFFF' }}>
          <SmartMedia
            media={MEDIA.gw1_compass}
            label="GW1 OFFLINE – Đặt la bàn chứng minh xoay đúng góc 306,0° hướng về GW2"
            accentColor="#C2410C"
            badgeText="GW1 OFFLINE"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Ô DỌC PHẢI: GW2 đặt la bàn */}
        <div style={{ position: 'absolute', ...RECT_GW2_COMPASS, backgroundColor: '#FFFFFF' }}>
          <SmartMedia
            media={MEDIA.gw2_compass}
            label="Minh chứng GW2 (cách 13,8 km) – Đặt la bàn hướng cố định 126,0° về GW1"
            accentColor="#C2410C"
            badgeText="RELAY 13,8 KM"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      

      {/* ================= PHÂN ĐOẠN 7 (QUAY VỀ ONLINE TỪ 05:00): GW1 & APP ĐỘC LẬP ================= */}
      <Sequence from={fS6End} durationInFrames={fS7End - fS6End}>
        {/* CỘT TRÁI TRÊN: GW1 quay về Online */}
        <div style={{ position: 'absolute', ...RECT_ONLINE_TL }}>
          <SmartMedia
            media={MEDIA.gw1_onlineReturn}
            label="Gateway 1 – Có Internet trở lại, tiếp tục xoay ăng-ten Yagi bám Node 1 & Node 2"
            accentColor="#047857"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* CỘT BÊN PHẢI: App Mobi - WSN quay về Online */}
        <div style={{ position: 'absolute', ...RECT_APP_RIGHT }}>
          <SmartMedia
            media={MEDIA.app_onlineReturn}
            label="Ứng dụng giám sát thời gian thực Mobi - WSN"
            accentColor="#0F2C59"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Sequence>

      {/* ================= OUTRO ================= */}
      <Sequence from={fS7End} durationInFrames={fTotal - fS7End}>
        <AbsoluteFill
          style={{
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 140px',
            textAlign: 'center',
            fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#0F2C59',
              lineHeight: 1.35,
              marginBottom: 28,
            }}
          >
            {THESIS_INFO.outroTitle}
          </div>
          <div
            style={{
              width: 160,
              height: 5,
              backgroundColor: '#0284C7',
              marginBottom: 28,
              borderRadius: 4,
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1E293B', marginBottom: 12 }}>
            {THESIS_INFO.title}
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: '#475569' }}>
            {THESIS_INFO.students}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ================= PHỤ ĐỀ (TỰ ĐỘNG NÉ KHUNG APP BÊN PHẢI) ================= */}
      {activeSubtitle && (
        <div
          style={{
            position: 'absolute',
            bottom: 1,
            left: isRightAppVisible ? 24 : 160,
            width: isRightAppVisible ? 1328 : 1600,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: 10,
              fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.35,
              textAlign: 'center',
              maxWidth: '94%',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            }}
          >
            {activeSubtitle.text}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};