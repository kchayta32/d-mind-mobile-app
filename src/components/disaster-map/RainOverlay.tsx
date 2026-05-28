import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { RainViewerData } from './useRainViewerData';

interface RainOverlayProps {
  rainData: RainViewerData | null;
  overlayType: 'radar' | 'satellite';
  timeType: 'past' | 'future';
  currentFrameIndex: number;
}

const RainOverlay: React.FC<RainOverlayProps> = ({
  rainData,
  overlayType,
  timeType,
  currentFrameIndex
}) => {
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
