import React, { useState, useMemo, useCallback } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl/maplibre';
import { WaterHyacinthFeature } from '@/services/gistda/types';
import { AlertCircle, Waves, MapPin, Calendar } from 'lucide-react';

interface WaterHyacinthLayerProps {
  features: WaterHyacinthFeature[];
  showLayer?: boolean;
}

export const WaterHyacinthLayer: React.FC<WaterHyacinthLayerProps> = ({
  features = [],
  showLayer = true
}) => {
  const { current: map } = useMap();
  const [selectedPoint, setSelectedPoint] = useState<{
    lng: number;
    lat: number;
    properties: any;
  } | null>(null);

  // Convert water hyacinth features to GeoJSON
  const geojsonData = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: 'FeatureCollection',
      features: features.map((f, index) => ({
        type: 'Feature',
        id: f.id || `hyacinth-${index}`,
        geometry: f.geometry,
        properties: {
          ...f.properties,
          name: f.properties?.namt || f.properties?.name || 'คลอง/ลำน้ำ',
          basin: f.properties?.sb_name_t || f.properties?.mbasin_t || '',
          province: f.properties?.pv_tn || '',
          district: f.properties?.ap_tn || '',
          subdistrict: f.properties?.tb_tn || '',
          agency: f.properties?.agency || 'กรมส่งเสริมการปกครองท้องถิ่น',
          area: f.properties?.shape_area ? `${Math.round(f.properties.shape_area).toLocaleString()} ตร.ม.` : ''
        }
      }))
    };
  }, [features]);

  const handleClick = useCallback(
    (e: any) => {
      if (!map) return;
      const clickedFeatures = e.features;
      if (!clickedFeatures || clickedFeatures.length === 0) return;

      const f = clickedFeatures[0];
      const { lng, lat } = e.lngLat;

      setSelectedPoint({
        lng,
        lat,
        properties: f.properties
      });
    },
    [map]
  );

  React.useEffect(() => {
    if (!map) return;

    map.on('click', 'hyacinth-fill', handleClick);
    map.on('mouseenter', 'hyacinth-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'hyacinth-fill', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', 'hyacinth-fill', handleClick);
    };
  }, [map, handleClick]);

  if (!showLayer || features.length === 0) return null;

  return (
    <>
      <Source id="water-hyacinth-source" type="geojson" data={geojsonData}>
        <Layer
          id="hyacinth-fill"
          type="fill"
          paint={{
            'fill-color': '#10b981', // emerald green for water plants
            'fill-opacity': 0.65
          }}
        />
        <Layer
          id="hyacinth-stroke"
          type="line"
          paint={{
            'line-color': '#047857',
            'line-width': 1.5,
            'line-opacity': 0.85
          }}
        />
      </Source>

      {selectedPoint && (
        <Popup
          longitude={selectedPoint.lng}
          latitude={selectedPoint.lat}
          anchor="bottom"
          onClose={() => setSelectedPoint(null)}
          closeButton={true}
          closeOnClick={false}
          className="z-50"
        >
          <div className="p-2 min-w-[220px] max-w-[280px] text-xs">
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-1 border-b pb-1">
              <Waves className="w-4 h-4 text-emerald-600" />
              <span>สิ่งกีดขวางทางน้ำ (ผักตบชวา)</span>
            </div>

            <div className="space-y-1 text-slate-700 dark:text-slate-200 mt-1">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedPoint.properties.name}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>
                  {selectedPoint.properties.subdistrict} {selectedPoint.properties.district}{' '}
                  {selectedPoint.properties.province}
                </span>
              </div>
              {selectedPoint.properties.basin && (
                <div className="text-[10px] text-slate-500">
                  ลุ่มน้ำ: {selectedPoint.properties.basin}
                </div>
              )}
              {selectedPoint.properties.area && (
                <div className="text-[10px] text-emerald-600 font-medium">
                  ขนาดกักขวาง: {selectedPoint.properties.area}
                </div>
              )}
              <div className="text-[9px] text-slate-400 pt-1">
                หน่วยงานรับผิดชอบ: {selectedPoint.properties.agency}
              </div>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default React.memo(WaterHyacinthLayer);
