
import React from 'react';
import { WMSTileLayer } from 'react-leaflet';

interface DroughtWMSLayersProps {
  showDRI?: boolean;
  showNDWI?: boolean;
  showSMAP?: boolean;
}

const API_KEY = 'wFaHcoOyzK53pVqspkI9Mvobjm5vWzHVOwGOjzW4f2nAAvsVf8CETklHpX1peaDF';

export const DroughtWMSLayers: React.FC<DroughtWMSLayersProps> = ({
  showDRI = true,
  showNDWI = false,
  showSMAP = false
}) => {
  return (
    <>
      {/* Drought Risk Index (DRI) - 7 days */}
      {showDRI && (
        <WMSTileLayer
          url={`https://api-gateway.gistda.or.th/api/2.0/resources/maps/dri/7days/wms?api_key=${API_KEY}`}
          layers="6799acce8d739fff9dacee2f"
          format="image/png"
          transparent={true}
          opacity={0.6}
          attribution="GISTDA Drought Risk Index"
        />
      )}

      {/* Normalized Difference Water Index (NDWI) - 7 days */}
      {showNDWI && (
        <WMSTileLayer
          url={`https://api-gateway.gistda.or.th/api/2.0/resources/maps/ndwi/7days/wms?api_key=${API_KEY}`}
          layers="default"
          format="image/png"
          transparent={true}
          opacity={0.6}
          attribution="GISTDA NDWI"
        />
      )}

      {/* Soil Moisture Active Passive (SMAP) - 7 days */}
      {showSMAP && (
        <WMSTileLayer
          url={`https://api-gateway.gistda.or.th/api/2.0/resources/maps/smap/7days/wms?api_key=${API_KEY}`}
          layers="default"
          format="image/png"
          transparent={true}
          opacity={0.6}
          attribution="NASA SMAP"
        />
      )}
    </>
  );
};
