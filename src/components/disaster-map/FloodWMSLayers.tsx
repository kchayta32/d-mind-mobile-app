
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface FloodWMSLayersProps {
  timeFilter: '1day' | '3days' | '7days' | '30days';
  showFrequency: boolean;
  opacity: number;
}

const API_KEY = 'UIKDdatC5lgDcdrGxBJfyjHRlvRSvKQFGjY8A3mG00fj99MqcWCd2VxVTkcfkVX6';

const FloodWMSLayers: React.FC<FloodWMSLayersProps> = ({ timeFilter, showFrequency, opacity }) => {
  const map = useMap();

  useEffect(() => {
    const layers: L.Layer[] = [];

    // Map timeframes to available API endpoints
    const apiTimeframe = timeFilter === '7days' || timeFilter === '30days' ? '3days' : timeFilter;

    // Current flood areas using GISTDA API Gateway WMS
    if (timeFilter) {
      const wmsUrl = `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood/${apiTimeframe}/wms?api_key=${API_KEY}`;
      
      const floodLayer = L.tileLayer.wms(wmsUrl, {
        layers: Object.keys({})[0] || '',
        format: 'image/png',
        transparent: true,
        attribution: `GISTDA - พื้นที่น้ำท่วม ${timeFilter}`,
        opacity,
        maxZoom: 18,
      });
      
      floodLayer.addTo(map);
      layers.push(floodLayer);
    }

    // Recurrent flood areas
    if (showFrequency) {
      const freqUrl = `https://api-gateway.gistda.or.th/api/2.0/resources/maps/flood-freq/wms?api_key=${API_KEY}`;
      
      const freqLayer = L.tileLayer.wms(freqUrl, {
        layers: Object.keys({})[0] || '',
        format: 'image/png',
        transparent: true,
        attribution: 'GISTDA - พื้นที่น้ำท่วมซ้ำซาก',
        opacity: opacity * 0.7,
        maxZoom: 18,
      });
      
      freqLayer.addTo(map);
      layers.push(freqLayer);
    }

    return () => {
      layers.forEach(layer => {
        map.removeLayer(layer);
      });
    };
  }, [map, timeFilter, showFrequency, opacity]);

  return null;
};

export default FloodWMSLayers;
