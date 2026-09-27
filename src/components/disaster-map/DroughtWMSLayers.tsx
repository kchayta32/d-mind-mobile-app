import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { getGistdaApiKey, DEFAULT_GISTDA_API_KEY } from '@/services/gistda/gistdaService';

interface DroughtWMSLayersProps {
  selectedLayers: string[];
  opacity?: number;
  tileFormat?: 'wmts' | 'tms' | 'wms';
}

const DroughtWMSLayers: React.FC<DroughtWMSLayersProps> = ({
  selectedLayers = ['dri'],
  opacity = 0.7,
  tileFormat = 'wmts'
}) => {
  const apiKey = getGistdaApiKey() || DEFAULT_GISTDA_API_KEY;
  const baseUrl = 'https://api-gateway.gistda.or.th/api/2.0/resources/maps';

  // DRIPlus (7 days Drought Risk Index)
  const driUrl = React.useMemo(() => {
    if (!selectedLayers.includes('dri')) return null;
    if (tileFormat === 'tms') {
      return `${baseUrl}/dri/7days/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `${baseUrl}/dri/7days/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [selectedLayers, tileFormat, apiKey, baseUrl]);

  // NDWI (7 days Vegetation Water Index)
  const ndwiUrl = React.useMemo(() => {
    if (!selectedLayers.includes('ndwi')) return null;
    if (tileFormat === 'tms') {
      return `${baseUrl}/ndwi/7days/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `${baseUrl}/ndwi/7days/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [selectedLayers, tileFormat, apiKey, baseUrl]);

  // SMAP (7 days Soil Moisture Active Passive)
  const smapUrl = React.useMemo(() => {
    if (!selectedLayers.includes('smap')) return null;
    if (tileFormat === 'tms') {
      return `${baseUrl}/smap/7days/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `${baseUrl}/smap/7days/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [selectedLayers, tileFormat, apiKey, baseUrl]);

  return (
    <>
      {/* 1. DRIPlus Drought Risk Layer */}
      {driUrl && (
        <Source
          id={`dri-source-${tileFormat}`}
          type="raster"
          tiles={[driUrl]}
          tileSize={256}
          scheme="xyz"
          attribution="GISTDA DRIPlus Drought Risk Index (7 days)"
        >
          <Layer
            id="dri-layer"
            type="raster"
            paint={{
              'raster-opacity': opacity,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}

      {/* 2. NDWI Vegetation Water Index Layer */}
      {ndwiUrl && (
        <Source
          id={`ndwi-source-${tileFormat}`}
          type="raster"
          tiles={[ndwiUrl]}
          tileSize={256}
          scheme="xyz"
          attribution="GISTDA NDWI Normalized Difference Water Index (7 days)"
        >
          <Layer
            id="ndwi-layer"
            type="raster"
            paint={{
              'raster-opacity': opacity,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}

      {/* 3. SMAP Soil Moisture Layer */}
      {smapUrl && (
        <Source
          id={`smap-source-${tileFormat}`}
          type="raster"
          tiles={[smapUrl]}
          tileSize={256}
          scheme="xyz"
          attribution="GISTDA SMAP Soil Moisture Active Passive (7 days)"
        >
          <Layer
            id="smap-layer"
            type="raster"
            paint={{
              'raster-opacity': opacity,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}
    </>
  );
};

export default React.memo(DroughtWMSLayers);
