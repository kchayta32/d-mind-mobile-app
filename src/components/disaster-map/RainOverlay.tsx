import React, { useEffect, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import { RainViewerData } from './useRainViewerData';

interface RainOverlayProps {
  rainData: RainViewerData | null;
  overlayType: 'radar' | 'satellite';
  timeType: 'past' | 'future';
}

const RainOverlay: React.FC<RainOverlayProps> = ({ rainData, overlayType, timeType }) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);

  useEffect(() => {
    if (!rainData || overlayType !== 'radar' || timeType !== 'past') return;

    const frames = rainData.radar?.past || [];
    if (frames.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentFrameIndex(prev => (prev + 1) % frames.length);
    }, 500); // Change frame every 500ms

    return () => clearInterval(interval);
  }, [rainData, overlayType, timeType]);

  if (!rainData) return null;

  let frames: any[] = [];
  if (overlayType === 'radar') {
    frames = timeType === 'past' ? rainData.radar?.past || [] : rainData.radar?.nowcast || [];
  } else {
    frames = rainData.satellite?.infrared || [];
  }

  if (frames.length === 0) return null;

  const frameIndex = Math.min(currentFrameIndex, frames.length - 1);
  const frame = frames[frameIndex];

  if (!frame) return null;

  const tileUrl = `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;

  return (
    <Source id="rain-source" type="raster" tiles={[tileUrl]} tileSize={256}>
      <Layer
        id="rain-layer"
        type="raster"
        paint={{ 'raster-opacity': 0.6 }}
      />
    </Source>
  );
};

export default RainOverlay;
