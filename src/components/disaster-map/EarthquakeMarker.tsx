
import React, { useMemo } from 'react';
import { Earthquake } from './types';
import { MapLibreMarker } from './maplibre/MapLibreMarker';

interface EarthquakeMarkerProps {
  earthquake: Earthquake;
}

const EarthquakeMarkerComponent: React.FC<EarthquakeMarkerProps> = ({ earthquake }) => {
  const getMagnitudeDescription = (magnitude: number) => {
    if (magnitude < 3.0) return 'แผ่นดินไหวเล็กน้อย';
    if (magnitude < 4.0) return 'แผ่นดินไหวเล็ก';
    if (magnitude < 5.0) return 'แผ่นดินไหวปานกลาง';
    if (magnitude < 6.0) return 'แผ่นดินไหวแรง';
    if (magnitude < 7.0) return 'แผ่นดินไหวรุนแรง';
    return 'แผ่นดินไหวรุนแรงมาก';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Determine colors and size based on magnitude
  const { color, glowColor, size } = useMemo(() => {
    let color = '#22c55e'; // green for low magnitude
    let glowColor = 'rgba(34, 197, 94, 0.6)';
    let size = 14;

    if (earthquake.magnitude >= 7.0) {
      color = '#dc2626';
      glowColor = 'rgba(220, 38, 38, 0.7)';
      size = 28;
    } else if (earthquake.magnitude >= 6.0) {
      color = '#ea580c';
      glowColor = 'rgba(234, 88, 12, 0.7)';
      size = 24;
    } else if (earthquake.magnitude >= 5.0) {
      color = '#eab308';
      glowColor = 'rgba(234, 179, 8, 0.7)';
      size = 20;
    } else if (earthquake.magnitude >= 4.0) {
      color = '#65a30d';
      glowColor = 'rgba(101, 163, 13, 0.6)';
      size = 17;
    }

    return { color, glowColor, size };
  }, [earthquake.magnitude]);

  // Use latitude/longitude from the earthquake object
  const lat = earthquake.latitude || earthquake.lat;
  const lng = earthquake.longitude || earthquake.lng;

  const PopupContent = (
    <div className="p-2 min-w-64 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{
            background: `radial-gradient(circle, ${earthquake.magnitude >= 7.0 ? '#dc2626' :
              earthquake.magnitude >= 6.0 ? '#ea580c' :
                earthquake.magnitude >= 5.0 ? '#eab308' :
                  earthquake.magnitude >= 4.0 ? '#65a30d' : '#22c55e'
              })`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {earthquake.magnitude.toFixed(1)}
        </div>
        <h3 className="font-bold text-lg text-gray-800">แผ่นดินไหว</h3>
      </div>

      <div className="space-y-2 text-sm text-gray-800">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold text-gray-600">ขนาด:</span>
            <div className="text-lg font-bold text-red-600">{earthquake.magnitude.toFixed(1)} Mw</div>
          </div>
          <div>
            <span className="font-semibold text-gray-600">ความลึก:</span>
            <div className="text-lg font-bold text-blue-600">{earthquake.depth} กม.</div>
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-600">ระดับ:</span>
          <div className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ml-1 ${earthquake.magnitude >= 6.0 ? 'bg-red-500' :
            earthquake.magnitude >= 5.0 ? 'bg-orange-500' :
              earthquake.magnitude >= 4.0 ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
            {getMagnitudeDescription(earthquake.magnitude)}
          </div>
        </div>

        <div>
          <span className="font-semibold text-gray-600">ตำแหน่ง:</span>
          <div className="text-gray-700">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</div>
        </div>

        <div>
          <span className="font-semibold text-gray-600">เวลา:</span>
          <div className="text-gray-700">{formatDate(earthquake.time)}</div>
        </div>

        {earthquake.location && (
          <div>
            <span className="font-semibold text-gray-600">สถานที่:</span>
            <div className="text-gray-700">{earthquake.location}</div>
          </div>
        )}

        {earthquake.url && (
          <div className="mt-3 pt-2 border-t">
            <a
              href={earthquake.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              ดูรายละเอียดเพิ่มเติม →
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const [showPopup, setShowPopup] = React.useState(false);

  return (
    <MapLibreMarker
      latitude={lat}
      longitude={lng}
      showPopup={showPopup}
      popupContent={PopupContent}
      onClosePopup={() => setShowPopup(false)}
      onClick={() => setShowPopup(!showPopup)}
      className="cursor-pointer"
    >
      <div
        className="earthquake-marker"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle at 30% 30%, ${color}ee, ${color})`,
          border: '2.5px solid white',
          boxShadow: `0 2px 10px ${glowColor}, 0 0 0 3px ${glowColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: `${Math.max(9, size * 0.4)}px`,
          textShadow: '0 1px 3px rgba(0,0,0,0.9)'
        }}
        title={`ขนาด ${earthquake.magnitude} ${earthquake.location || ''}`}
      >
        {earthquake.magnitude.toFixed(1)}
      </div>
    </MapLibreMarker>
  );
};

const EarthquakeMarker = React.memo(EarthquakeMarkerComponent);

export default EarthquakeMarker;

