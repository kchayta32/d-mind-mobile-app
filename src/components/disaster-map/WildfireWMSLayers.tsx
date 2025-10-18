
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';

interface WildfireWMSLayersProps {
  timeFilter: string;
  showBurnFreq: boolean;
}

export const WildfireWMSLayers: React.FC<WildfireWMSLayersProps> = ({
  timeFilter,
  showBurnFreq
}) => {
  const API_KEY = 'UIKDdatC5lgDcdrGxBJfyjHRlvRSvKQFGjY8A3mG00fj99MqcWCd2VxVTkcfkVX6';
  const baseUrl = 'https://api-gateway.gistda.or.th/api/2.0/resources/maps';

  return (
    <>
      {timeFilter && (
        <WMSTileLayer
          url={`${baseUrl}/viirs/${timeFilter}/wmts?api_key=${API_KEY}`}
          layers="viirs"
          format="image/png"
          transparent={true}
          opacity={0.7}
          attribution={`GISTDA VIIRS Hotspots ${timeFilter}`}
        />
      )}
      
      {showBurnFreq && (
        <WMSTileLayer
          url={`${baseUrl}/burn-freq/wmts?api_key=${API_KEY}`}
          layers="burn-freq"
          format="image/png"
          transparent={true}
          opacity={0.6}
          attribution="GISTDA Burn Frequency"
        />
      )}
    </>
  );
};
