
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';

interface WildfireWMSLayersProps {
  showModis: boolean;
  showViirs: boolean;
  showBurnScar: boolean;
}

export const WildfireWMSLayers: React.FC<WildfireWMSLayersProps> = ({
  showModis,
  showViirs,
  showBurnScar
}) => {
  const baseUrl = 'https://disaster.gistda.or.th/api/1.0/documents/fire';

  return (
    <>
      {showModis && (
        <WMSTileLayer
          url={`${baseUrl}/hotspot/modis/7days/wms`}
          layers="hotspot"
          format="image/png"
          transparent={true}
          opacity={0.7}
          attribution="GISTDA MODIS Hotspots"
        />
      )}
      
      {showViirs && (
        <WMSTileLayer
          url={`${baseUrl}/hotspot/viirs/7days/wms`}
          layers="hotspot"
          format="image/png"
          transparent={true}
          opacity={0.7}
          attribution="GISTDA VIIRS Hotspots"
        />
      )}
      
      {showBurnScar && (
        <WMSTileLayer
          url={`${baseUrl}/burn-scar/wms`}
          layers="burn-scar"
          format="image/png"
          transparent={true}
          opacity={0.6}
          attribution="GISTDA Burn Scar"
        />
      )}
    </>
  );
};
