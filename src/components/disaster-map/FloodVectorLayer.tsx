import React, { useState, useMemo, useCallback } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl/maplibre';
import { FloodFeature } from './hooks/useGISTDAFloodData';
import { Droplets, Building, MapPin, Navigation, Satellite, Calendar } from 'lucide-react';
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
  opacity = 0.55,
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
      features: features.map((f, index) => {
        const p = f.properties || {};
        const areaSqM = p.f_area || p._area || 0;
        const areaRai = Math.round(areaSqM / 1600).toLocaleString();
        const areaKm = (areaSqM / 1_000_000).toFixed(2);
        const fileName = p.file_name || '';
        const isSentinel = Boolean(
          fileName &&
            (fileName.includes('S1') ||
              fileName.includes('Sentinel') ||
              fileName.includes('rd2') ||
              fileName.includes('sentinel'))
        );
        const roadLengthKm = p.length_road ? (p.length_road / 1000).toFixed(2) : '0';

        return {
          type: 'Feature' as const,
          id: f.id || p._id || `flood-${index}`,
          geometry: f.geometry,
          properties: {
            ...p,
            index,
            areaKm,
            areaRai,
            isSentinel,
            satelliteFile: fileName || 'GISTDA Sentinel Composite',
            roadLengthKm,
            province: p.pv_tn || 'ไม่ระบุจังหวัด',
            district: p.ap_tn || 'ไม่ระบุอำเภอ',
            subdistrict: p.tb_tn || 'ไม่ระบุตำบล',
            population: Math.round(p.population || p.population_2 || 0),
            buildings: p.building || 0,
            updatedAt: p._updatedAt || p._createdAt || new Date().toISOString()
          }
        };
      })
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
            'fill-color': '#0284c7', // vibrant sky blue
            'fill-opacity': opacity
          }}
        />
        {/* Border stroke */}
        <Layer
          id="flood-polygon-stroke"
          type="line"
          paint={{
            'line-color': '#0369a1',
            'line-width': 2,
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
          <div className="p-2 min-w-[240px] max-w-[300px] text-xs font-sans">
            <div className="flex items-center justify-between border-b pb-1.5 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-sm text-sky-800 dark:text-sky-300">
                <Droplets className="w-4 h-4 text-sky-500 animate-pulse" />
                <span>พื้นที่น้ำท่วมขัง</span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedInfo.properties.isSentinel
                    ? 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {selectedInfo.properties.isSentinel ? '🛰️ Sentinel-1 SAR' : 'GISTDA 2.0'}
              </Badge>
            </div>

            <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>
                  {selectedInfo.properties.subdistrict !== 'ไม่ระบุตำบล' && `${selectedInfo.properties.subdistrict} `}
                  {selectedInfo.properties.district !== 'ไม่ระบุอำเภอ' && `${selectedInfo.properties.district} `}
                  {selectedInfo.properties.province}
                </span>
              </div>

              {/* Area metric with Rai calculation */}
              <div className="flex justify-between items-baseline p-1.5 bg-sky-50 dark:bg-sky-950/40 rounded-lg border border-sky-100 dark:border-sky-900/60">
                <span className="text-[11px] text-slate-600 dark:text-slate-400">ขนาดพื้นที่น้ำท่วม:</span>
                <div className="text-right">
                  <span className="font-bold text-sky-700 dark:text-sky-300 text-sm">
                    {selectedInfo.properties.areaKm}
                  </span>
                  <span className="text-[11px] text-sky-600"> ตร.กม.</span>
                  <span className="text-[10px] text-slate-500 block">
                    (~{selectedInfo.properties.areaRai} ไร่)
                  </span>
                </div>
              </div>

              {/* Impact stats */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {selectedInfo.properties.population > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-950/30 p-1.5 rounded border border-orange-100 dark:border-orange-900/40">
                    <span className="text-[10px] text-slate-500 block">ประชากรในพื้นที่</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      ~{selectedInfo.properties.population.toLocaleString()} คน
                    </span>
                  </div>
                )}
                {selectedInfo.properties.buildings > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 block">สิ่งปลูกสร้าง</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedInfo.properties.buildings.toLocaleString()} หลัง
                    </span>
                  </div>
                )}
              </div>

              {/* Road length if affected */}
              {Number(selectedInfo.properties.roadLengthKm) > 0 && (
                <div className="flex items-center justify-between text-[11px] px-1 py-0.5 text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-slate-400" />
                    <span>ถนนในแนวท่วม:</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedInfo.properties.roadLengthKm} กม.
                  </span>
                </div>
              )}

              {/* Satellite metadata */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                <div className="flex items-center gap-1 truncate">
                  <Satellite className="w-3 h-3 text-sky-500 shrink-0" />
                  <span className="truncate"><strong>ข้อมูล:</strong> {selectedInfo.properties.satelliteFile}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    <strong>ตรวจวัดเมื่อ:</strong>{' '}
                    {new Date(selectedInfo.properties.updatedAt).toLocaleString('th-TH', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default React.memo(FloodVectorLayer);
