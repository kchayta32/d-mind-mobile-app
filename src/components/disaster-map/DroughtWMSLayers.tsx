import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { getGistdaApiKey } from '@/services/gistda/gistdaService';

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
  const apiKey = getGistdaApiKey();
  const baseUrl = 'https://api-gateway.gistda.or.th/api/2.0/resources/maps';

  // DRIPlus (7 days Drought Risk Index)
  const driUrl = React.useMemo(() => {
    if (!selectedLayers.includes('dri')) return null;
    if (tileFormat === 'tms') {
      return `${baseUrl}/dri/7days/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `${baseUrl}/dri/7days/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [selectedLayers, tileFormat, apiKey]);

  // NDWI (7 days Vegetation Water Index)
  const ndwiUrl = React.useMemo(() => {
    if (!selectedLayers.includes('ndwi')) return null;
    if (tileFormat === 'tms') {
      return `${baseUrl}/ndwi/7days/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `${baseUrl}/ndwi/7days/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [selectedLayers, tileFormat, apiKey]);

  // SMAP (7 days Soil Moisture Active Passive)
  const smapUrl = React.useMemo(() => {
    if (!selectedLayers.includes('smap')) return null;
    if (tileFormat === 'tms') {
      return `${baseUrl}/smap/7days/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `${baseUrl}/smap/7days/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [selectedLayers, tileFormat, apiKey]);

  return (
    <>
      {/* DRIPlus Drought Risk Layer */}
      {driUrl && (
        <Source
          id={`dri-source-${tileFormat}`}
          type="raster"
          tiles={[driUrl]}
          tileSize={256}
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

      {/* NDWI Vegetation Water Index Layer */}
      {ndwiUrl && (
        <Source
          id={`ndwi-source-${tileFormat}`}
          type="raster"
          tiles={[ndwiUrl]}
          tileSize={256}
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

      {/* SMAP Soil Moisture Layer */}
      {smapUrl && (
        <Source
          id={`smap-source-${tileFormat}`}
          type="raster"
          tiles={[smapUrl]}
          tileSize={256}
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
