import React from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { getGistdaApiKey } from '@/services/gistda/gistdaService';
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
  const apiKey = getGistdaApiKey();
  const validTimeframe = (['1day', '3days', '7days', '30days'].includes(timeFilter)
    ? timeFilter
    : '1day') as VIIRSTimeframe;

  // VIIRS Hotspot raster tiles
  const viirsTileUrl = React.useMemo(() => {
    if (!timeFilter) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/viirs/${validTimeframe}/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/viirs/${validTimeframe}/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [validTimeframe, tileFormat, apiKey, timeFilter]);

  // Burn Frequency raster tiles
  const burnFreqTileUrl = React.useMemo(() => {
    if (!showBurnFreq) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-freq/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-freq/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [showBurnFreq, tileFormat, apiKey]);

  // Burn Scar (weekly) raster tiles
  const burnScarTileUrl = React.useMemo(() => {
    if (!showBurnScar) return null;
    if (tileFormat === 'tms') {
      return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-scar/tms/{z}/{x}/{y}?api_key=${apiKey}`;
    }
    return `https://api-gateway.gistda.or.th/api/2.0/resources/maps/burn-scar/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
  }, [showBurnScar, tileFormat, apiKey]);

  return (
    <>
      {/* VIIRS Hotspots raster layer */}
      {viirsTileUrl && (
        <Source
          id={`viirs-raster-${validTimeframe}-${tileFormat}`}
          type="raster"
          tiles={[viirsTileUrl]}
          tileSize={256}
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

      {/* Burn frequency raster layer */}
      {burnFreqTileUrl && (
        <Source
          id={`burn-freq-raster-${tileFormat}`}
          type="raster"
          tiles={[burnFreqTileUrl]}
          tileSize={256}
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

      {/* Burn scar raster layer */}
      {burnScarTileUrl && (
        <Source
          id={`burn-scar-raster-${tileFormat}`}
          type="raster"
          tiles={[burnScarTileUrl]}
          tileSize={256}
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
