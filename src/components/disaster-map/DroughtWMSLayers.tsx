import React from 'react';
import { Source, Layer } from 'react-map-gl';

interface DroughtWMSLayersProps {
  selectedLayers: string[];
  opacity: number;
}

const DroughtWMSLayers: React.FC<DroughtWMSLayersProps> = ({ selectedLayers, opacity }) => {
  return (
    <>
      {/* DRI (Drought Risk Index) Layer */}
      {selectedLayers.includes('dri') && (
        <Source
          id="dri-source"
          type="raster"
          tiles={[
            'https://api-gateway.gistda.or.th/api/2.0/resources/maps/dri/7days/wmts/{z}/{x}/{y}.png?api_key=UIKDdatC5lgDcdrGxBJfyjHRlvRSvKQFGjY8A3mG00fj99MqcWCd2VxVTkcfkVX6'
          ]}
          tileSize={256}
        >
          <Layer
            id="dri-layer"
            type="raster"
            paint={{ 'raster-opacity': opacity }}
          />
        </Source>
      )}

      {/* NDWI (Normalized Difference Water Index) Layer */}
      {selectedLayers.includes('ndwi') && (
        <Source
          id="ndwi-source"
          type="raster"
          tiles={[
            'https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/ndwi_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM'
          ]}
          tileSize={256}
        >
          <Layer
            id="ndwi-layer"
            type="raster"
            paint={{ 'raster-opacity': opacity }}
          />
        </Source>
      )}

      {/* SMAP (Soil Moisture Active Passive) Layer */}
      {selectedLayers.includes('smap') && (
        <Source
          id="smap-source"
          type="raster"
          tiles={[
            'https://vallaris.dragonfly.gistda.or.th/core/api/maps/1.0-beta/maps/smap_7days/wmts/{z}/{x}/{y}.png?api_key=p8MB6HQYNFiJMbBigdrXVVC6mvwuj0EkVpXNxI17eogPueG7ed3UvdUDGMvdSLPM'
          ]}
          tileSize={256}
        >
          <Layer
            id="smap-layer"
            type="raster"
            paint={{ 'raster-opacity': opacity }}
          />
        </Source>
      )}
    </>
  );
};

export default DroughtWMSLayers;
