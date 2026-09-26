import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { gistdaService, getGistdaApiKey } from '@/services/gistda/gistdaService';
import { FloodTimeframe } from '@/services/gistda/types';

interface FloodWMSLayersProps {
  timeFilter: FloodTimeframe | string;
  showFrequency?: boolean;
  opacity?: number;
  tileFormat?: 'wmts' | 'tms' | 'wms';
}

const FloodWMSLayers: React.FC<FloodWMSLayersProps> = ({
  timeFilter = '3days',
  showFrequency = false,
  opacity = 0.7,
  tileFormat = 'wmts'
}) => {
  const apiKey = getGistdaApiKey();
  const validTimeframe = (['1day', '3days', '7days', '30days'].includes(timeFilter)
    ? timeFilter
    : '3days') as FloodTimeframe;

  // Build tile URL for active flood raster
  const floodTileUrl = React.useMemo(() => {
    if (!timeFilter) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood/${validTimeframe}/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    // Default WMTS tile URL
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood/${validTimeframe}/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [validTimeframe, tileFormat, apiKey, timeFilter]);

  // Build tile URL for recurrent flood frequency raster
  const freqTileUrl = React.useMemo(() => {
    if (!showFrequency) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood-freq/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood-freq/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [showFrequency, tileFormat, apiKey]);

  return (
    <>
      {/* Current flood areas raster layer */}
      {floodTileUrl && (
        <Source
          id={`flood-raster-${validTimeframe}-${tileFormat}`}
          type="raster"
          tiles={[floodTileUrl]}
          tileSize={256}
        >
          <Layer
            id={`flood-raster-layer-${validTimeframe}`}
            type="raster"
            paint={{
              'raster-opacity': opacity,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}

      {/* Recurrent flood frequency raster layer */}
      {freqTileUrl && (
        <Source
          id={`flood-freq-raster-${tileFormat}`}
          type="raster"
          tiles={[freqTileUrl]}
          tileSize={256}
        >
          <Layer
            id="flood-freq-raster-layer"
            type="raster"
            paint={{
              'raster-opacity': opacity * 0.8,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}
    </>
  );
};

export default React.memo(FloodWMSLayers);
