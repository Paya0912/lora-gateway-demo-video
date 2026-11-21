import React from 'react';
import { Img, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { MediaSlotConfig } from './config';

type SmartMediaProps = {
  media: MediaSlotConfig;
  label: string;
  accentColor?: string;
  badgeText?: string;
  style?: React.CSSProperties;
};

const isImageFile = (filename: string) =>
  /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(filename);

const buildVideoSegments = (
  startSec: number,
  cuts: Array<{ fromSec: number; toSec: number }>,
  fps: number
) => {
  const sortedCuts = [...cuts].sort((a, b) => a.fromSec - b.fromSec);
  const segments: Array<{
    fromFrame: number;
    durationInFrames?: number;
    startFromFrames: number;
  }> = [];

  let currentOrigSec = startSec;
  let timelineFrame = 0;

  for (const cut of sortedCuts) {
    if (cut.toSec <= currentOrigSec) continue;
    if (cut.fromSec > currentOrigSec) {
      const durationFrames = Math.round((cut.fromSec - currentOrigSec) * fps);
      if (durationFrames > 0) {
        segments.push({
          fromFrame: timelineFrame,
          durationInFrames: durationFrames,
          startFromFrames: Math.max(0, Math.round(currentOrigSec * fps)),
        });
        timelineFrame += durationFrames;
      }
    }
    currentOrigSec = Math.max(currentOrigSec, cut.toSec);
  }

  segments.push({
    fromFrame: timelineFrame,
    durationInFrames: undefined,
    startFromFrames: Math.max(0, Math.round(currentOrigSec * fps)),
  });

  return segments;
};

export const SmartMedia: React.FC<SmartMediaProps> = ({
  media,
  label,
  accentColor = '#0F2C59',
  badgeText,
  style,
}) => {
  const { fps } = useVideoConfig();
  const startFromFrames = Math.max(0, Math.round((media.startSec ?? 0) * fps));
  const hasCuts = Boolean(media.cuts && media.cuts.length > 0);
  const videoSegments = hasCuts
    ? buildVideoSegments(media.startSec ?? 0, media.cuts!, fps)
    : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        border: `3px solid ${accentColor}`,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(15, 44, 89, 0.10)',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Thanh tiêu đề nhỏ gắn trên từng khung video */}
      <div
        style={{
          height: 36,
          minHeight: 36,
          backgroundColor: accentColor,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: 0.2,
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </span>
        {badgeText && (
          <span
            style={{
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              padding: '2px 10px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 800,
              marginLeft: 10,
              flexShrink: 0,
            }}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Vùng hiển thị nội dung: Video / Ảnh / Khung Note Placeholder */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: media.objectFit === 'contain' ? '#F8FAFC' : '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {!media.file ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#F1F5F9',
              border: '3px dashed #94A3B8',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center',
              fontFamily: 'Segoe UI, Roboto, Arial, sans-serif',
            }}
          >
            <div
              style={{
                backgroundColor: '#E2E8F0',
                color: '#334155',
                fontWeight: 800,
                fontSize: 16,
                padding: '6px 14px',
                borderRadius: 6,
                marginBottom: 12,
              }}
            >
              VỊ TRÍ GIỮ CHỖ (CHƯA CÓ VIDEO)
            </div>
            <div
              style={{
                color: '#0F172A',
                fontSize: 22,
                fontWeight: 600,
                lineHeight: 1.4,
                maxWidth: '90%',
              }}
            >
              {media.note}
            </div>
          </div>
        ) : isImageFile(media.file) ? (
          <Img
            src={staticFile(media.file)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: media.objectFit,
            }}
          />
        ) : hasCuts ? (
          <>
            {videoSegments.map((seg, idx) => (
              <Sequence
                key={idx}
                from={seg.fromFrame}
                durationInFrames={seg.durationInFrames}
              >
                <OffthreadVideo
                  src={staticFile(media.file!)}
                  startFrom={seg.startFromFrames}
                  playbackRate={media.playbackRate ?? 1}
                  muted={media.muted ?? true}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: media.objectFit,
                    objectPosition: media.objectPosition,
                    transform: media.scale ? `scale(${media.scale})` : undefined,
                  }}
                />
              </Sequence>
            ))}
          </>
        ) : (
          <OffthreadVideo
            src={staticFile(media.file)}
            startFrom={startFromFrames}
            playbackRate={media.playbackRate ?? 1}
            muted={media.muted ?? true}
            style={{
              width: '100%',
              height: '100%',
              objectFit: media.objectFit,
              objectPosition: media.objectPosition,
              transform: media.scale ? `scale(${media.scale})` : undefined,
            }}
          />
        )}
      </div>
    </div>
  );
};