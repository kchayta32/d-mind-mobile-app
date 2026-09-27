import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { getGistdaApiKey, DEFAULT_GISTDA_API_KEY } from '@/services/gistda/gistdaService';
import { FloodTimeframe } from '@/services/gistda/types';

interface FloodWMSLayersProps {
  timeFilter: FloodTimeframe | string;
  showFrequency?: boolean;
  opacity?: number;
  tileFormat?: 'wmts' | 'tms' | 'wms';
  showSentinel2TrueColor?: boolean;
  showSentinel1Sar?: boolean;
}

export const SENTINEL2_CLOUDLESS_URL =
  'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg';

export const SENTINEL1_SAR_URL =
  'https://tiles.maps.eox.at/wmts/1.0.0/hydrography_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.png';

const FloodWMSLayers: React.FC<FloodWMSLayersProps> = ({
  timeFilter = '3days',
  showFrequency = false,
  opacity = 0.7,
  tileFormat = 'wmts',
  showSentinel2TrueColor = false,
  showSentinel1Sar = false
}) => {
  const apiKey = getGistdaApiKey() || DEFAULT_GISTDA_API_KEY;
  const validTimeframe = (['1day', '3days', '7days', '30days'].includes(timeFilter)
    ? timeFilter
    : '3days') as FloodTimeframe;

  // Build tile URL for active flood raster (GISTDA API 2.0)
  const floodTileUrl = React.useMemo(() => {
    if (!timeFilter) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood/${validTimeframe}/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    // Default WMTS tile URL
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood/${validTimeframe}/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [validTimeframe, tileFormat, apiKey, timeFilter]);

  // Build tile URL for recurrent flood frequency raster (GISTDA API 2.0)
  const freqTileUrl = React.useMemo(() => {
    if (!showFrequency) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood-freq/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood-freq/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [showFrequency, tileFormat, apiKey]);

  return (
    <>
      {/* 1. Copernicus Sentinel-2 True Color / Cloudless Base Imagery (10m Resolution via EOX WMTS) */}
      {showSentinel2TrueColor && (
        <Source
          id="sentinel2-cloudless-wmts"
          type="raster"
          tiles={[SENTINEL2_CLOUDLESS_URL]}
          tileSize={256}
          scheme="xyz"
          attribution="&copy; Sentinel-2 cloudless by EOX IT Services GmbH (Copernicus Sentinel data)"
        >
          <Layer
            id="sentinel2-cloudless-layer"
            type="raster"
            paint={{
              'raster-opacity': 0.9,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}

      {/* 2. Copernicus Sentinel-1 Synthetic Aperture Radar (SAR) Water Backscatter / Hydrography Layer */}
      {showSentinel1Sar && (
        <Source
          id="sentinel1-sar-wmts"
          type="raster"
          tiles={[SENTINEL1_SAR_URL]}
          tileSize={256}
          scheme="xyz"
          attribution="&copy; Copernicus Sentinel-1 C-SAR Flood & Water Surface Backscatter"
        >
          <Layer
            id="sentinel1-sar-layer"
            type="raster"
            paint={{
              'raster-opacity': 0.75,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}

      {/* 3. Current flood areas raster layer (GISTDA API 2.0 Sentinel-1/2 processed) */}
      {floodTileUrl && (
        <Source
          id={`flood-raster-${validTimeframe}-${tileFormat}`}
          type="raster"
          tiles={[floodTileUrl]}
          tileSize={256}
          scheme="xyz"
          attribution={`GISTDA Sentinel-1/2 Satellite Flood Inspection (${validTimeframe})`}
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

      {/* 4. Recurrent flood frequency raster layer (พื้นที่น้ำท่วมซ้ำซาก สถิติดาวเทียมย้อนหลัง) */}
      {freqTileUrl && (
        <Source
          id={`flood-freq-raster-${tileFormat}`}
          type="raster"
          tiles={[freqTileUrl]}
          tileSize={256}
          scheme="xyz"
          attribution="GISTDA Sentinel Historical Flood Frequency"
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
