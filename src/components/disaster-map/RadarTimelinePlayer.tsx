import React, { useMemo } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { RainViewerData } from './useRainViewerData';

interface RadarTimelinePlayerProps {
  rainData: RainViewerData | null;
  currentFrameIndex: number;
  setCurrentFrameIndex: (idx: number) => void;
  rainOverlayType: 'radar' | 'satellite';
  rainTimeType: 'past' | 'future';
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

export const RadarTimelinePlayer: React.FC<RadarTimelinePlayerProps> = ({
  rainData,
  currentFrameIndex,
  setCurrentFrameIndex,
  rainOverlayType,
  rainTimeType,
  isPlaying,
  setIsPlaying,
  playbackSpeed,
  setPlaybackSpeed,
}) => {
  // Extract correct frames list based on types
  const frames = useMemo(() => {
    if (!rainData) return [];
    if (rainOverlayType === 'radar') {
      return rainTimeType === 'past' ? rainData.radar?.past || [] : rainData.radar?.nowcast || [];
    } else {
      return rainData.satellite?.infrared || [];
    }
  }, [rainData, rainOverlayType, rainTimeType]);

  const currentFrame = frames[currentFrameIndex];

  // Format timestamp to local Thai time format (e.g., "26 พ.ค. 69 16:52 น.")
  const formatThaiTime = (timestamp?: number) => {
    if (!timestamp) return '--:-- น.';
    const date = new Date(timestamp * 1000);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const monthsThai = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const day = date.getDate();
    const month = monthsThai[date.getMonth()];
    const year = (date.getFullYear() + 543) % 100; // Thai Buddhist Era year last 2 digits

    return `${day} ${month} ${year} ${timeStr} น.`;
  };

  const handlePrevFrame = () => {
    if (frames.length === 0) return;
    setIsPlaying(false);
    setCurrentFrameIndex((currentFrameIndex - 1 + frames.length) % frames.length);
  };

  const handleNextFrame = () => {
    if (frames.length === 0) return;
    setIsPlaying(false);
    setCurrentFrameIndex((currentFrameIndex + 1) % frames.length);
  };

  const togglePlay = () => {
    if (frames.length <= 1) return;
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentFrameIndex(Number(e.target.value));
  };

  const isPast = rainTimeType === 'past';

  if (!rainData || frames.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-auto md:min-w-[650px] max-w-[800px] z-[1000] rounded-2xl border border-white/10 bg-slate-950/75 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.5),0_0_15px_rgba(14,165,233,0.15)] p-4 flex flex-col gap-3 font-sans transition-all duration-300">
      <style>{`
        .timeline-range-slider {
          -webkit-appearance: none;
          width: 100%;
          background: transparent;
        }
        .timeline-range-slider:focus {
          outline: none;
        }
        .timeline-range-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .timeline-range-slider::-webkit-slider-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #0ea5e9;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -5px;
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.8), 0 0 2px rgba(255, 255, 255, 0.5);
          border: 2px solid white;
          transition: transform 0.1s, background-color 0.1s;
        }
        .timeline-range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          background: #38bdf8;
        }
        .timeline-range-slider::-webkit-slider-thumb:active {
          transform: scale(1.3);
        }
        .timeline-range-slider::-moz-range-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .timeline-range-slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #0ea5e9;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.8);
        }
      `}</style>

      {/* Top Metadata Row */}
      <div className="flex flex-row items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-semibold tracking-wider text-white/90 uppercase font-prompt">
            {rainOverlayType === 'radar' ? 'เรดาร์สภาพอากาศ' : 'ภาพถ่ายดาวเทียม'}
          </span>
          
          {/* Active live status badge with pulsing dot */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/10 bg-black/40 backdrop-blur-md select-none font-inter">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPast ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPast ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={isPast ? 'text-emerald-400' : 'text-amber-400'}>
              {isPast ? 'LIVE' : 'FORECAST'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Time display */}
          <span className="text-xs md:text-sm font-semibold tabular-nums text-sky-400 font-prompt">
            {formatThaiTime(currentFrame?.time)}
          </span>

          {/* Precipitation intensity color legend */}
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-white/40 uppercase font-prompt">ความเข้มฝน</span>
              <div className="w-16 md:w-20 h-1.5 rounded-full bg-gradient-to-r from-sky-400 via-green-400 via-yellow-400 via-red-500 to-purple-600 border border-white/10" />
            </div>
            <div className="flex justify-between w-16 md:w-20 text-[7px] text-white/30 px-0.5 font-prompt">
              <span>เบา</span>
              <span>หนัก</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive slider tracking the timeline */}
      <div className="w-full px-1">
        <input
          type="range"
          min={0}
          max={frames.length - 1}
          value={currentFrameIndex}
          onChange={handleSliderChange}
          className="timeline-range-slider"
        />
        <div className="flex justify-between text-[9px] text-white/30 px-0.5 mt-1 font-prompt">
          <span>{formatThaiTime(frames[0]?.time)}</span>
          <span>{formatThaiTime(frames[frames.length - 1]?.time)}</span>
        </div>
      </div>

      {/* Control Actions Row */}
      <div className="flex items-center justify-between gap-4 pt-1">
        {/* Left Side: Frame Count Indicator */}
        <span className="text-[10px] md:text-xs text-white/40 font-prompt">
          เฟรม {currentFrameIndex + 1} จาก {frames.length}
        </span>

        {/* Center: Play/Pause/Prev/Next buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevFrame}
            disabled={frames.length <= 1}
            className="p-1.5 text-white/70 hover:text-white disabled:text-white/20 transition-all hover:scale-110 active:scale-95 disabled:hover:scale-100"
            title="เฟรมก่อนหน้า"
          >
            <SkipBack size={18} />
          </button>
          
          <button
            onClick={togglePlay}
            disabled={frames.length <= 1}
            className="p-2.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:bg-white/10 border border-white/10 rounded-full text-white shadow-[0_0_12px_rgba(14,165,233,0.3)] disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'หยุดเล่น' : 'เล่น'}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="translate-x-0.5" />
            )}
          </button>

          <button
            onClick={handleNextFrame}
            disabled={frames.length <= 1}
            className="p-1.5 text-white/70 hover:text-white disabled:text-white/20 transition-all hover:scale-110 active:scale-95 disabled:hover:scale-100"
            title="เฟรมถัดไป"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Right Side: Speed Selector Pill */}
        <div className="flex items-center bg-black/40 rounded-full border border-white/10 p-0.5">
          {([1, 2, 4] as const).map((speed) => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-semibold font-inter transition-all ${
                playbackSpeed === speed
                  ? 'bg-sky-500 text-white shadow-[0_0_8px_rgba(14,165,233,0.5)] border border-sky-400/20'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
