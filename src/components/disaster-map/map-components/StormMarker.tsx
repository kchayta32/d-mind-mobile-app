import React, { useState, useMemo } from 'react';
import { Marker, Popup, Source, Layer } from 'react-map-gl/maplibre';
import { StormData } from '../types';
import { Badge } from '@/components/ui/badge';
import { Wind, Navigation, AlertTriangle, ShieldAlert, Globe2 } from 'lucide-react';

interface StormMarkerProps {
  storm: StormData;
}

// Generate a GeoJSON circular polygon for wind danger radius
function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center;
  const coords: [number, number][] = [];
  const distanceX = radiusInMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  const distanceY = radiusInMeters / 110540;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  // Close the polygon
  coords.push(coords[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    },
    properties: {}
  };
}

export const StormMarker: React.FC<StormMarkerProps> = ({ storm }) => {
  const [showPopup, setShowPopup] = useState(false);

  const lat = storm.latitude ?? storm.lat;
  const lng = storm.longitude ?? storm.lng;

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  const isHighAlert = storm.alertLevel === 'Red';
  const bgColor = isHighAlert ? '#ef4444' : storm.alertLevel === 'Orange' ? '#f97316' : '#3b82f6';
  const windSpeed = Number(storm.windSpeedKmH || 65);
  const radius = Math.min(300000, Math.max(90000, windSpeed * 1200));

  // Danger radius circle GeoJSON
  const circleGeoJSON = useMemo(() => {
    return createGeoJSONCircle([lng, lat], radius);
  }, [lng, lat, radius]);

  // Track history line GeoJSON
  const trackGeoJSON = useMemo<GeoJSON.Feature<GeoJSON.LineString> | null>(() => {
    const history = storm.trackHistory;
    if (!history || history.length < 2) return null;

    const coordinates = history
      .map((p) => [Number(p.longitude), Number(p.latitude)] as [number, number])
      .filter(([tlng, tlat]) => !isNaN(tlng) && !isNaN(tlat));

    if (coordinates.length < 2) return null;

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates
      },
      properties: {}
    };
  }, [storm.trackHistory]);

  return (
    <>
      {/* 1. Historical track path line */}
      {trackGeoJSON && (
        <Source id={`storm-track-${storm.id}`} type="geojson" data={trackGeoJSON}>
          <Layer
            id={`storm-track-line-${storm.id}`}
            type="line"
            paint={{
              'line-color': isHighAlert ? '#dc2626' : '#ea580c',
              'line-width': 2.5,
              'line-dasharray': [3, 2],
              'line-opacity': 0.85
            }}
          />
        </Source>
      )}

      {/* 2. Wind danger radius polygon */}
      <Source id={`storm-circle-${storm.id}`} type="geojson" data={circleGeoJSON}>
        <Layer
          id={`storm-circle-fill-${storm.id}`}
          type="fill"
          paint={{
            'fill-color': bgColor,
            'fill-opacity': 0.12
          }}
        />
        <Layer
          id={`storm-circle-line-${storm.id}`}
          type="line"
          paint={{
            'line-color': bgColor,
            'line-width': 1.5,
            'line-opacity': 0.6
          }}
        />
      </Source>

      {/* 3. Cyclone Center Animated Marker */}
      <Marker
        longitude={lng}
        latitude={lat}
        anchor="center"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setShowPopup(true);
        }}
      >
        <div className="relative flex items-center justify-center cursor-pointer group">
          {/* Animated Pulsing Ping Ring */}
          <div
            className="absolute w-10 h-10 rounded-full animate-ping pointer-events-none opacity-40"
            style={{ backgroundColor: bgColor }}
          />

          {/* Cyclone Pin */}
          <div
            className="w-8 h-8 rounded-full shadow-xl flex items-center justify-center text-white font-bold text-xs border-2 border-white transition-transform group-hover:scale-115 relative z-10"
            style={{ backgroundColor: bgColor }}
            title={`${storm.name} (${storm.category}) - ${windSpeed} กม./ชม.`}
          >
            {/* Spinning Cyclone Vortex Icon */}
            <svg
              className="w-5 h-5 animate-spin"
              style={{ animationDuration: isHighAlert ? '2s' : '4s' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
        </div>
      </Marker>

      {/* 4. Detailed Storm Popup */}
      {showPopup && (
        <Popup
          longitude={lng}
          latitude={lat}
          anchor="bottom"
          offset={20}
          onClose={() => setShowPopup(false)}
          closeOnClick={false}
          className="z-50"
        >
          <div className="p-1 space-y-2 min-w-[260px] max-w-[320px] text-xs font-sans text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-1.5">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                  พายุหมุนเขตร้อน
                </span>
                <h3 className="text-sm font-bold leading-tight">{storm.name}</h3>
              </div>
              <Badge
                variant={storm.alertLevel === 'Red' ? 'destructive' : 'secondary'}
                className={storm.alertLevel === 'Orange' ? 'bg-orange-500 text-white' : ''}
              >
                {storm.category}
              </Badge>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg text-xs border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">ความเร็วลม</div>
                  <div className="font-bold text-slate-900 dark:text-white">{windSpeed} กม./ชม.</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500">ความกดอากาศ</div>
                  <div className="font-bold text-slate-900 dark:text-white">{storm.pressureHPa || 995} hPa</div>
                </div>
              </div>
            </div>

            {/* Movement Direction & Speed */}
            {storm.movementDirection && (
              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between px-1">
                <span>ทิศทางการเคลื่อนที่:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {storm.movementDirection} ({storm.movementSpeedKmH || 15} กม./ชม.)
                </span>
              </div>
            )}

            {/* Affected Countries */}
            {storm.affectedCountries && storm.affectedCountries.length > 0 && (
              <div className="text-[11px] text-slate-600 dark:text-slate-300 px-1">
                <span className="font-medium">พื้นที่เสี่ยงผลกระทบ: </span>
                <span>{storm.affectedCountries.join(', ')}</span>
              </div>
            )}

            {/* Affected Population */}
            {storm.affectedPopulation && storm.affectedPopulation > 0 && (
              <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>ประชากรในพื้นที่เสี่ยง ~{storm.affectedPopulation.toLocaleString()} คน</span>
              </div>
            )}

            {/* Source and Time */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-1.5 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-blue-500" />
                <span>แหล่งข้อมูล: {storm.source}</span>
              </span>
              <span>{new Date(storm.updatedAt || Date.now()).toLocaleDateString('th-TH')}</span>
            </div>

            {/* Warning Advice */}
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md p-1.5 text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
              <span>คำแนะนำ: ติดตามประกาศเตือนภัยฝนตกหนัก คลื่นลมแรง และเตรียมพร้อมรับมือภัยพิบัติ</span>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export default React.memo(StormMarker);
