import React, { useState, useMemo, useCallback } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl/maplibre';
import { FloodFeature } from './hooks/useGISTDAFloodData';
import { Droplets, AlertTriangle, Building, Users, Home, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FloodVectorLayerProps {
  features: FloodFeature[];
  showLayer?: boolean;
  opacity?: number;
  onSelectFeature?: (feature: FloodFeature) => void;
}

export const FloodVectorLayer: React.FC<FloodVectorLayerProps> = ({
  features,
  showLayer = true,
  opacity = 0.5,
  onSelectFeature
}) => {
  const { current: map } = useMap();
  const [selectedInfo, setSelectedInfo] = useState<{
    lng: number;
    lat: number;
    properties: any;
  } | null>(null);

  // Consolidate all flood polygons into a SINGLE GeoJSON FeatureCollection for GPU rendering
  const geojsonData = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: 'FeatureCollection',
      features: features.map((f, index) => ({
        type: 'Feature',
        id: f.id || f.properties?._id || `flood-${index}`,
        geometry: f.geometry,
        properties: {
          ...f.properties,
          index,
          areaKm: ((f.properties?.f_area || 0) / 1_000_000).toFixed(2),
          province: f.properties?.pv_tn || 'ไม่ระบุจังหวัด',
          district: f.properties?.ap_tn || 'ไม่ระบุอำเภอ',
          subdistrict: f.properties?.tb_tn || 'ไม่ระบุตำบล',
          population: Math.round(f.properties?.population || f.properties?.population_2 || 0),
          buildings: f.properties?.building || 0
        }
      }))
    };
  }, [features]);

  // Handle click on flood polygon
  const handleClick = useCallback(
    (e: any) => {
      if (!map) return;
      const clickedFeatures = e.features;
      if (!clickedFeatures || clickedFeatures.length === 0) return;

      const f = clickedFeatures[0];
      const { lng, lat } = e.lngLat;

      setSelectedInfo({
        lng,
        lat,
        properties: f.properties
      });

      if (onSelectFeature && f.properties?.index !== undefined) {
        const original = features[f.properties.index];
        if (original) onSelectFeature(original);
      }
    },
    [map, features, onSelectFeature]
  );

  React.useEffect(() => {
    if (!map) return;

    map.on('click', 'flood-polygon-fill', handleClick);

    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('mouseenter', 'flood-polygon-fill', onEnter);
    map.on('mouseleave', 'flood-polygon-fill', onLeave);

    return () => {
      map.off('click', 'flood-polygon-fill', handleClick);
      map.off('mouseenter', 'flood-polygon-fill', onEnter);
      map.off('mouseleave', 'flood-polygon-fill', onLeave);
    };
  }, [map, handleClick]);

  if (!showLayer || features.length === 0) return null;

  return (
    <>
      <Source id="gistda-flood-vector-source" type="geojson" data={geojsonData}>
        {/* Fill layer with smooth opacity */}
        <Layer
          id="flood-polygon-fill"
          type="fill"
          paint={{
            'fill-color': '#0284c7', // vibrant blue
            'fill-opacity': opacity
          }}
        />
        {/* Border stroke */}
        <Layer
          id="flood-polygon-stroke"
          type="line"
          paint={{
            'line-color': '#0369a1',
            'line-width': 1.5,
            'line-opacity': Math.min(1, opacity + 0.3)
          }}
        />
      </Source>

      {/* Interactive Popup on clicked polygon */}
      {selectedInfo && (
        <Popup
          longitude={selectedInfo.lng}
          latitude={selectedInfo.lat}
          anchor="bottom"
          onClose={() => setSelectedInfo(null)}
          closeButton={true}
          closeOnClick={false}
          className="z-50"
        >
          <div className="p-2 min-w-[220px] max-w-[280px] text-xs">
            <div className="flex items-center gap-1.5 font-bold text-sm text-blue-700 dark:text-blue-400 mb-1 border-b pb-1">
              <Droplets className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>พื้นที่น้ำท่วมขัง (GISTDA)</span>
            </div>

            <div className="space-y-1.5 text-slate-700 dark:text-slate-200 mt-1">
              <div className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>
                  {selectedInfo.properties.subdistrict} {selectedInfo.properties.district}{' '}
                  {selectedInfo.properties.province}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 bg-blue-50 dark:bg-blue-950/40 p-2 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-500 block">ขนาดพื้นที่</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {selectedInfo.properties.areaKm} ตร.กม.
                  </span>
                </div>
                {selectedInfo.properties.population > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">ประชากรเสี่ยง</span>
                    <span className="font-bold text-orange-600">
                      ~{selectedInfo.properties.population.toLocaleString()} คน
                    </span>
                  </div>
                )}
                {selectedInfo.properties.buildings > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">อาคาร/บ้านเรือน</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedInfo.properties.buildings} หลัง
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default React.memo(FloodVectorLayer);
