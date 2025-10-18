
import React from 'react';
import { WildfireWMSLayers } from '../WildfireWMSLayers';
import DroughtWMSLayers from '../DroughtWMSLayers';
import FloodWMSLayers from '../FloodWMSLayers';
import RainOverlay from '../RainOverlay';
import { DisasterType } from '../DisasterMap';
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
  wildfireTimeFilter: string;
  showBurnFreq: boolean;
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
  wildfireTimeFilter,
  showBurnFreq
}) => {
  return (
    <>
      {/* WMS layers for wildfire */}
      {selectedType === 'wildfire' && (
        <WildfireWMSLayers
          timeFilter={wildfireTimeFilter}
          showBurnFreq={showBurnFreq}
        />
      )}

      {/* WMS layers for drought */}
      {selectedType === 'drought' && (
        <DroughtWMSLayers
          selectedLayers={droughtLayers}
          opacity={0.7}
        />
      )}

      {/* WMS layers for flood */}
      {selectedType === 'flood' && (
        <FloodWMSLayers
          timeFilter={floodTimeFilter as '1day' | '3days' | '7days' | '30days'}
          showFrequency={showFloodFrequency}
          opacity={0.7}
        />
      )}
      
      {/* Rain overlay for heavy rain type */}
      {selectedType === 'heavyrain' && showRainOverlay && rainData && (
        <RainOverlay 
          rainData={rainData}
          overlayType={rainOverlayType}
          timeType={rainTimeType}
        />
      )}
    </>
  );
};
