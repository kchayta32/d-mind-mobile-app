import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { getGistdaApiKey, DEFAULT_GISTDA_API_KEY } from '@/services/gistda/gistdaService';
import { VIIRSTimeframe } from '@/services/gistda/types';

interface WildfireWMSLayersProps {
  timeFilter: VIIRSTimeframe | string;
  showBurnFreq?: boolean;
  showBurnScar?: boolean;
  opacity?: number;
  tileFormat?: 'wmts' | 'tms' | 'wms';
}

const WildfireWMSLayers: React.FC<WildfireWMSLayersProps> = ({
  timeFilter = '1day',
  showBurnFreq = false,
  showBurnScar = false,
  opacity = 0.7,
  tileFormat = 'wmts'
}) => {
  const apiKey = getGistdaApiKey() || DEFAULT_GISTDA_API_KEY;
  const validTimeframe = (['1day', '3days', '7days', '30days'].includes(timeFilter)
    ? timeFilter
    : '1day') as VIIRSTimeframe;

  // VIIRS Hotspot raster tiles (GISTDA API 2.0)
  const viirsTileUrl = React.useMemo(() => {
    if (!timeFilter) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/viirs/${validTimeframe}/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/viirs/${validTimeframe}/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [validTimeframe, tileFormat, apiKey, timeFilter]);

  // Burn Frequency raster tiles (GISTDA API 2.0)
  const burnFreqTileUrl = React.useMemo(() => {
    if (!showBurnFreq) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-freq/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-freq/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [showBurnFreq, tileFormat, apiKey]);

  // Burn Scar (weekly) raster tiles (GISTDA API 2.0)
  const burnScarTileUrl = React.useMemo(() => {
    if (!showBurnScar) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-scar/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-scar/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [showBurnScar, tileFormat, apiKey]);

  return (
    <>
      {/* 1. VIIRS Hotspots raster layer */}
      {viirsTileUrl && (
        <Source
          id={`viirs-raster-${validTimeframe}-${tileFormat}`}
          type="raster"
          tiles={[viirsTileUrl]}
          tileSize={256}
          scheme="xyz"
          attribution="GISTDA VIIRS Active Fire Hotspots"
        >
          <Layer
            id={`viirs-raster-layer-${validTimeframe}`}
            type="raster"
            paint={{
              'raster-opacity': opacity,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}

      {/* 2. Burn frequency raster layer (พื้นที่เผาไหม้ซ้ำซาก 10 ปี) */}
      {burnFreqTileUrl && (
        <Source
          id={`burn-freq-raster-${tileFormat}`}
          type="raster"
          tiles={[burnFreqTileUrl]}
          tileSize={256}
          scheme="xyz"
          attribution="GISTDA Burn Frequency Historical Statistics"
        >
          <Layer
            id="burn-freq-raster-layer"
            type="raster"
            paint={{
              'raster-opacity': opacity * 0.75,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}

      {/* 3. Burn scar raster layer (ร่องรอยเผาไหม้รายสัปดาห์) */}
      {burnScarTileUrl && (
        <Source
          id={`burn-scar-raster-${tileFormat}`}
          type="raster"
          tiles={[burnScarTileUrl]}
          tileSize={256}
          scheme="xyz"
          attribution="GISTDA Weekly Burn Scar Detection"
        >
          <Layer
            id="burn-scar-raster-layer"
            type="raster"
            paint={{
              'raster-opacity': opacity * 0.85,
              'raster-fade-duration': 300
            }}
          />
        </Source>
      )}
    </>
  );
};

export default React.memo(WildfireWMSLayers);
