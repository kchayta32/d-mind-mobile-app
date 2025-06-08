
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

    // DRI (Drought Risk Index) Layer - Red tones for high risk
    if (selectedLayers.includes('dri')) {
      const driLayer = L.tileLayer('https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/dri_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM', {
        attribution: 'GISTDA - DRI 7 days',
        opacity,
        maxZoom: 18,
      });
      
      driLayer.addTo(map);
      layers.push(driLayer);
    }

    // NDWI (Normalized Difference Water Index) Layer - Blue tones for water content
    if (selectedLayers.includes('ndwi')) {
      const ndwiLayer = L.tileLayer('https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/ndwi_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM', {
        attribution: 'GISTDA - NDWI 7 days',
        opacity,
        maxZoom: 18,
      });
      
      ndwiLayer.addTo(map);
      layers.push(ndwiLayer);
    }

    // SMAP (Soil Moisture Active Passive) Layer - Brown/Green tones for soil moisture
    if (selectedLayers.includes('smap')) {
      const smapLayer = L.tileLayer('https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/smap_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM', {
        attribution: 'GISTDA - SMAP 7 days',
        opacity,
        maxZoom: 18,
      });
      
      smapLayer.addTo(map);
      layers.push(smapLayer);
    }

    // Add custom drought severity color overlay if needed
    if (selectedLayers.length > 0) {
      // Create a legend for drought colors
      const legend = L.control({ position: 'bottomright' });
      
      legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'drought-legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        div.style.fontSize = '12px';
        
        let legendContent = '<strong>ระดับภัยแล้ง</strong><br>';
        
        if (selectedLayers.includes('dri')) {
          legendContent += '<div><span style="background: #8B0000; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>สูงมาก</div>';
          legendContent += '<div><span style="background: #FF4500; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>สูง</div>';
          legendContent += '<div><span style="background: #FFA500; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>ปานกลาง</div>';
          legendContent += '<div><span style="background: #FFFF00; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>ต่ำ</div>';
        }
        
        if (selectedLayers.includes('ndwi')) {
          legendContent += '<br><strong>ความชื้นน้ำ</strong><br>';
          legendContent += '<div><span style="background: #000080; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>สูง</div>';
          legendContent += '<div><span style="background: #4169E1; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>ปานกลาง</div>';
          legendContent += '<div><span style="background: #87CEEB; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>ต่ำ</div>';
        }
        
        if (selectedLayers.includes('smap')) {
          legendContent += '<br><strong>ความชื้นดิน</strong><br>';
          legendContent += '<div><span style="background: #228B22; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>ชื้น</div>';
          legendContent += '<div><span style="background: #9ACD32; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>ปานกลาง</div>';
          legendContent += '<div><span style="background: #D2691E; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span>แห้ง</div>';
        }
        
        div.innerHTML = legendContent;
        return div;
      };
      
      legend.addTo(map);
      layers.push(legend as any);
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
