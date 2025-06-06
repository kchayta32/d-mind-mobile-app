
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Earthquake } from './types';

interface EarthquakeMarkerProps {
  earthquake: Earthquake;
}

const createEarthquakeIcon = (magnitude: number) => {
  // Modern gradient colors based on magnitude
  let color = '#22c55e'; // green for low magnitude
  let size = 12;
  
  if (magnitude >= 7.0) {
    color = '#dc2626'; // red for very high
    size = 24;
  } else if (magnitude >= 6.0) {
    color = '#ea580c'; // orange for high
    size = 20;
  } else if (magnitude >= 5.0) {
    color = '#eab308'; // yellow for moderate
    size = 16;
  } else if (magnitude >= 4.0) {
    color = '#65a30d'; // light green for low-moderate
    size = 14;
  }

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, ${color}, ${color}dd);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px ${color}33;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(8, size * 0.4)}px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        position: relative;
        animation: pulse 2s infinite;
      ">
        ${magnitude.toFixed(1)}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'earthquake-marker',
    iconSize: [size + 8, size + 8],
    iconAnchor: [size/2 + 4, size/2 + 4]
  });
};

const EarthquakeMarker: React.FC<EarthquakeMarkerProps> = ({ earthquake }) => {
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

  // Use latitude/longitude from the earthquake object
  const lat = earthquake.latitude || earthquake.lat;
  const lng = earthquake.longitude || earthquake.lng;

  return (
    <Marker
      position={[lat, lng]}
      icon={createEarthquakeIcon(earthquake.magnitude)}
    >
      <Popup className="earthquake-popup">
        <div className="p-2 min-w-64">
          <div className="flex items-center gap-2 mb-3">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ 
                background: `radial-gradient(circle, ${
                  earthquake.magnitude >= 7.0 ? '#dc2626' :
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
          
          <div className="space-y-2 text-sm">
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
              <div className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ml-1 ${
                earthquake.magnitude >= 6.0 ? 'bg-red-500' :
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
      </Popup>
    </Marker>
  );
};

export default EarthquakeMarker;
