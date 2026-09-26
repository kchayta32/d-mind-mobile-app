import React from 'react';
import WildfireWMSLayers from '../WildfireWMSLayers';
import DroughtWMSLayers from '../DroughtWMSLayers';
import FloodWMSLayers from '../FloodWMSLayers';
import RainOverlay from '../RainOverlay';
import { DisasterType } from '../types';
import { RainViewerData } from '../useRainViewerData';

interface MapLayersProps {
  selectedType: DisasterType;
  droughtLayers: string[];
  floodTimeFilter: string;
  showFloodFrequency: boolean;
  showRainOverlay: boolean;
  rainData: RainViewerData | null;
  rainOverlayType: 'radar' | 'satellite';
  rainTimeType: 'past' | 'future';
  currentFrameIndex: number;
  wildfireTimeFilter: string;
  showBurnFreq: boolean;
  showBurnScar?: boolean;
  tileFormat?: 'wmts' | 'tms' | 'wms';
  layerOpacity?: number;
}

export const MapLayers: React.FC<MapLayersProps> = ({
  selectedType,
  droughtLayers,
  floodTimeFilter,
  showFloodFrequency,
  showRainOverlay,
  rainData,
  rainOverlayType,
  rainTimeType,
  currentFrameIndex,
  wildfireTimeFilter,
  showBurnFreq,
  showBurnScar = false,
  tileFormat = 'wmts',
  layerOpacity = 0.7
}) => {
  return (
    <>
      {/* Raster layers for wildfire */}
      {selectedType === 'wildfire' && (
        <WildfireWMSLayers
          timeFilter={wildfireTimeFilter}
          showBurnFreq={showBurnFreq}
          showBurnScar={showBurnScar}
          tileFormat={tileFormat}
          opacity={layerOpacity}
        />
      )}

      {/* Raster layers for drought */}
      {selectedType === 'drought' && (
        <DroughtWMSLayers
          selectedLayers={droughtLayers}
          opacity={layerOpacity}
          tileFormat={tileFormat}
        />
      )}

      {/* Raster layers for flood */}
      {selectedType === 'flood' && (
        <FloodWMSLayers
          timeFilter={floodTimeFilter}
          showFrequency={showFloodFrequency}
          opacity={layerOpacity}
          tileFormat={tileFormat}
        />
      )}

      {/* Rain overlay for heavy rain type */}
      {selectedType === 'heavyrain' && showRainOverlay && rainData && (
        <RainOverlay
          rainData={rainData}
          overlayType={rainOverlayType}
          timeType={rainTimeType}
          currentFrameIndex={currentFrameIndex}
        />
      )}
    </>
  );
};

export default React.memo(MapLayers);
