import React, { useState, useMemo, useCallback } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl/maplibre';
import { GISTDAHotspot } from './useGISTDAData';
import { Flame, MapPin, Calendar, Clock, Satellite, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ClusteredHotspotMarkersProps {
  hotspots: GISTDAHotspot[];
  onSelectHotspot?: (hotspot: GISTDAHotspot) => void;
}

// Convert hotspots to GeoJSON FeatureCollection
function hotspotsToGeoJSON(hotspots: GISTDAHotspot[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: hotspots
      .filter((h) => {
        const lat = h.LATITUDE ?? (h.geometry?.coordinates ? h.geometry.coordinates[1] : undefined);
        const lng = h.LONGITUDE ?? (h.geometry?.coordinates ? h.geometry.coordinates[0] : undefined);
        return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
      })
      .map((h, index) => {
        const lat = h.LATITUDE ?? h.geometry!.coordinates[1];
        const lng = h.LONGITUDE ?? h.geometry!.coordinates[0];
        const p = h.properties || {};
        const frp = Number(p.frp ?? h.FRP ?? 0);
        const confidence = String(p.confidence ?? h.CONFIDENCE ?? 'nominal').toLowerCase();
        const brightness = Number(p.bright_ti4 ?? h.BRIGHTNESS ?? 300);

        // Color ramp based on FRP intensity & confidence
        let color = '#f97316'; // orange default
        if (frp >= 50 || brightness >= 350) {
          color = '#dc2626'; // critical red
        } else if (frp >= 20 || confidence === 'high') {
          color = '#ea580c'; // intense orange
        } else if (confidence === 'low') {
          color = '#eab308'; // yellow
        }

        return {
          type: 'Feature' as const,
          id: h.id || `hotspot-${index}`,
          properties: {
            id: h.id || `hotspot-${index}`,
            index,
            province: p.pv_tn || h.province || 'ไม่ระบุจังหวัด',
            district: p.ap_tn || p.amphoe || 'ไม่ระบุอำเภอ',
            subdistrict: p.tb_tn || p.tambon || 'ไม่ระบุตำบล',
            frp: frp.toFixed(1),
            confidence,
            brightness: brightness.toFixed(1),
            satellite: p.satellite || h.SATELLITE || 'VIIRS',
            date: p.th_date || h.ACQ_DATE || '',
            time: p.th_time || h.ACQ_TIME || '',
            color,
            riskLevel: p.risk_level || (frp > 30 ? 'high' : 'medium')
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [lng, lat]
          }
        };
      })
  };
}

export const ClusteredHotspotMarkers: React.FC<ClusteredHotspotMarkersProps> = ({
  hotspots,
  onSelectHotspot
}) => {
  const { current: map } = useMap();
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);

  const geojsonData = useMemo(() => hotspotsToGeoJSON(hotspots), [hotspots]);

  // Handle cluster click zoom or individual hotspot click
  const handleClick = useCallback(
    (e: any) => {
      if (!map) return;
      const features = e.features;
      if (!features || features.length === 0) return;

      const feature = features[0];
      const clusterId = feature.properties?.cluster_id;

      if (clusterId) {
        const source = map.getSource('gistda-hotspots') as any;
        if (source) {
          source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            map.easeTo({
              center: feature.geometry.coordinates,
              zoom: Math.min(zoom, 14),
              duration: 500
            });
          });
        }
      } else {
        const [longitude, latitude] = feature.geometry.coordinates;
        setPopupInfo({
          longitude,
          latitude,
          properties: feature.properties
        });
        if (onSelectHotspot && feature.properties?.index !== undefined) {
          const original = hotspots[feature.properties.index];
          if (original) onSelectHotspot(original);
        }
      }
    },
    [map, hotspots, onSelectHotspot]
  );

  React.useEffect(() => {
    if (!map) return;

    map.on('click', 'hotspot-clusters', handleClick);
    map.on('click', 'unclustered-hotspot-point', handleClick);

    const onEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const onLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('mouseenter', 'hotspot-clusters', onEnter);
    map.on('mouseleave', 'hotspot-clusters', onLeave);
    map.on('mouseenter', 'unclustered-hotspot-point', onEnter);
    map.on('mouseleave', 'unclustered-hotspot-point', onLeave);

    return () => {
      map.off('click', 'hotspot-clusters', handleClick);
      map.off('click', 'unclustered-hotspot-point', handleClick);
      map.off('mouseenter', 'hotspot-clusters', onEnter);
      map.off('mouseleave', 'hotspot-clusters', onLeave);
      map.off('mouseenter', 'unclustered-hotspot-point', onEnter);
      map.off('mouseleave', 'unclustered-hotspot-point', onLeave);
    };
  }, [map, handleClick]);

  return (
    <>
      <Source
        id="gistda-hotspots"
        type="geojson"
        data={geojsonData}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={45}
      >
        {/* Cluster circles */}
        <Layer
          id="hotspot-clusters"
          type="circle"
          filter={['has', 'point_count']}
          paint={{
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#f97316', // orange for < 10
              10,
              '#ea580c', // deep orange for < 50
              50,
              '#dc2626', // red for < 100
              100,
              '#991b1b' // dark red for >= 100
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              18,
              10,
              24,
              50,
              30,
              100,
              36
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9
          }}
        />

        {/* Cluster count text */}
        <Layer
          id="hotspot-cluster-count"
          type="symbol"
          filter={['has', 'point_count']}
          layout={{
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12
          }}
          paint={{
            'text-color': '#ffffff'
          }}
        />

        {/* Glow halo for single hotspots */}
        <Layer
          id="unclustered-hotspot-glow"
          type="circle"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': ['get', 'color'],
            'circle-radius': 12,
            'circle-opacity': 0.35,
            'circle-blur': 0.6
          }}
        />

        {/* Core circle for single hotspots */}
        <Layer
          id="unclustered-hotspot-point"
          type="circle"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': ['get', 'color'],
            'circle-radius': 7,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.95
          }}
        />
      </Source>

      {/* Interactive Popup */}
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          anchor="bottom"
          onClose={() => setPopupInfo(null)}
          closeButton={true}
          closeOnClick={false}
          className="z-50"
        >
          <div className="p-2 min-w-[200px] max-w-[260px] text-xs">
            <div className="flex items-center gap-1.5 font-bold text-sm text-red-600 dark:text-red-400 mb-1 border-b pb-1">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>จุดความร้อน VIIRS</span>
              <Badge variant="outline" className="ml-auto text-[10px] uppercase">
                {popupInfo.properties.satellite}
              </Badge>
            </div>

            <div className="space-y-1 text-slate-700 dark:text-slate-200 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium">
                  {popupInfo.properties.subdistrict} {popupInfo.properties.district}{' '}
                  {popupInfo.properties.province}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg mt-1">
                <div>
                  <span className="text-[10px] text-slate-500 block">พลังงาน (FRP)</span>
                  <span className="font-semibold text-orange-600">
                    {popupInfo.properties.frp} MW
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">อุณหภูมิ</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {popupInfo.properties.brightness} K
                  </span>
                </div>
              </div>

              {(popupInfo.properties.date || popupInfo.properties.time) && (
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span className="flex items-center gap-0.5">
                    <Calendar className="w-3 h-3" />
                    {popupInfo.properties.date}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {popupInfo.properties.time} น.
                  </span>
                </div>
              )}
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default React.memo(ClusteredHotspotMarkers);
