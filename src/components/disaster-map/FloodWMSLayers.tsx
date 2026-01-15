import React from 'react';
import { Source, Layer } from 'react-map-gl';

interface FloodWMSLayersProps {
  timeFilter: '1day' | '3days' | '7days' | '30days';
  showFrequency: boolean;
  opacity: number;
}

const API_KEY = import.meta.env.VITE_GISTDA_DISASTER_API_KEY || '';

const FloodWMSLayers: React.FC<FloodWMSLayersProps> = ({ timeFilter, showFrequency, opacity }) => {
  // Map timeframes to available API endpoints
  const apiTimeframe = timeFilter === '7days' || timeFilter === '30days' ? '3days' : timeFilter;

  return (
    <>
      {/* Current flood areas - using WMTS XYZ format */}
      {timeFilter && (
        <Source
          id="flood-wms-source"
          type="raster"
          tiles={[
            `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood/${apiTimeframe}/wmts/{z}/{x}/{y}.png?api_key=${API_KEY}`
          ]}
          tileSize={256}
        >
          <Layer
            id="flood-wms-layer"
            type="raster"
            paint={{ 'raster-opacity': opacity }}
          />
        </Source>
      )}

      {/* Recurrent flood areas - using WMTS XYZ format */}
      {showFrequency && (
        <Source
          id="flood-freq-source"
          type="raster"
          tiles={[
            `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood-freq/wmts/{z}/{x}/{y}.png?api_key=${API_KEY}`
          ]}
          tileSize={256}
        >
          <Layer
            id="flood-freq-layer"
            type="raster"
            paint={{ 'raster-opacity': opacity * 0.7 }}
          />
        </Source>
      )}
    </>
  );
};

export default FloodWMSLayers;
