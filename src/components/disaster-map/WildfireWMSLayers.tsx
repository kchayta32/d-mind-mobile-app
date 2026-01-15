import React from 'react';
import { Source, Layer } from 'react-map-gl';

interface WildfireWMSLayersProps {
  timeFilter: string;
  showBurnFreq: boolean;
}

const WildfireWMSLayers: React.FC<WildfireWMSLayersProps> = ({
  timeFilter,
  showBurnFreq
}) => {
  const API_KEY = import.meta.env.VITE_GISTDA_DISASTER_API_KEY || '';
  const baseUrl = 'https://api-gateway.gistda.or.th/api/2.0/resources/maps';

  return (
    <>
      {/* VIIRS hotspot layer - using WMTS XYZ format */}
      {timeFilter && (
        <Source
          id="viirs-source"
          type="raster"
          tiles={[
            `${baseUrl}/viirs/${timeFilter}/wmts/{z}/{x}/{y}.png?api_key=${API_KEY}`
          ]}
          tileSize={256}
        >
          <Layer
            id="viirs-layer"
            type="raster"
            paint={{ 'raster-opacity': 0.7 }}
          />
        </Source>
      )}

      {/* Burn frequency layer - using WMTS XYZ format */}
      {showBurnFreq && (
        <Source
          id="burn-freq-source"
          type="raster"
          tiles={[
            `${baseUrl}/burn-freq/wmts/{z}/{x}/{y}.png?api_key=${API_KEY}`
          ]}
          tileSize={256}
        >
          <Layer
            id="burn-freq-layer"
            type="raster"
            paint={{ 'raster-opacity': 0.6 }}
          />
        </Source>
      )}
    </>
  );
};

export default WildfireWMSLayers;
