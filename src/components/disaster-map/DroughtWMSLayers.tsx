
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface DroughtWMSLayersProps {
  selectedLayers: string[];
  opacity: number;
}

const DroughtWMSLayers: React.FC<DroughtWMSLayersProps> = ({ selectedLayers, opacity }) => {
  const map = useMap();

  useEffect(() => {
    const layers: L.Layer[] = [];

    // DRI (Drought Risk Index) Layer
    if (selectedLayers.includes('dri')) {
      const driLayer = L.tileLayer('https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/dri_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM', {
        attribution: 'GISTDA - DRI 7 days',
        opacity,
        maxZoom: 18,
      });
      
      driLayer.addTo(map);
      layers.push(driLayer);
    }

    // NDWI (Normalized Difference Water Index) Layer
    if (selectedLayers.includes('ndwi')) {
      const ndwiLayer = L.tileLayer('https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/ndwi_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM', {
        attribution: 'GISTDA - NDWI 7 days',
        opacity,
        maxZoom: 18,
      });
      
      ndwiLayer.addTo(map);
      layers.push(ndwiLayer);
    }

    // SMAP (Soil Moisture Active Passive) Layer
    if (selectedLayers.includes('smap')) {
      const smapLayer = L.tileLayer('https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/smap_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM', {
        attribution: 'GISTDA - SMAP 7 days',
        opacity,
        maxZoom: 18,
      });
      
      smapLayer.addTo(map);
      layers.push(smapLayer);
    }

    return () => {
      layers.forEach(layer => {
        map.removeLayer(layer);
      });
    };
  }, [map, selectedLayers, opacity]);

  return null;
};

export default DroughtWMSLayers;
