import React, { useState } from 'react';
import { AirPollutionData } from './types';
import { MapLibreMarker } from './maplibre/MapLibreMarker';

interface AirStationMarkerProps {
  station: AirPollutionData;
}

const AirStationMarker: React.FC<AirStationMarkerProps> = ({ station }) => {
  const [showPopup, setShowPopup] = useState(false);

  // Helper to get color
  const getMarkerColor = (pm25?: number) => {
    if (!pm25) return '#22c55e'; // default green
    if (pm25 > 150) return '#dc2626'; // red for hazardous
    if (pm25 > 100) return '#7c2d12'; // dark red for very unhealthy
    if (pm25 > 75) return '#ea580c'; // orange for unhealthy
    if (pm25 > 50) return '#eab308'; // yellow for moderate
    if (pm25 > 25) return '#65a30d'; // light green for fair
    return '#22c55e'; // green good
  };

  const getPM25Status = (pm25?: number) => {
    if (!pm25) return 'ไม่มีข้อมูล';
    if (pm25 <= 25) return 'ดีมาก';
    if (pm25 <= 50) return 'ดี';
    if (pm25 <= 75) return 'ปานกลาง';
    if (pm25 <= 100) return 'เริ่มมีผลกระทบต่อสุขภาพ';
    if (pm25 <= 150) return 'มีผลกระทบต่อสุขภาพ';
    return 'อันตรายต่อสุขภาพ';
  };

  const formatValue = (value?: number, unit: string = '') => {
    return value !== undefined ? `${value.toFixed(2)} ${unit}` : 'ไม่มีข้อมูล';
  };

  const color = getMarkerColor(station.pm25);

  const PopupContent = (
    <div className="p-2 min-w-[200px] bg-white rounded-lg shadow-md text-gray-800">
      <h3 className="font-bold text-sm mb-2">สถานีตรวจวัดคุณภาพอากาศ</h3>
      <div className="space-y-1 text-xs">
        <div><strong>ตำแหน่ง:</strong> {station.lat.toFixed(4)}, {station.lng.toFixed(4)}</div>
        <div><strong>PM2.5:</strong> {formatValue(station.pm25, 'μg/m³')}</div>
        <div><strong>สถานะ:</strong> <span className={`font-semibold ${station.pm25 && station.pm25 > 75 ? 'text-red-600' :
          station.pm25 && station.pm25 > 50 ? 'text-yellow-600' : 'text-green-600'
          }`}>
          {getPM25Status(station.pm25)}
        </span></div>

        <hr className="my-2" />
        <div className="text-xs text-gray-600">
          <div><strong>AOD443:</strong> {formatValue(station.aod443)}</div>
          <div><strong>NO2:</strong> {formatValue(station.no2trop)}</div>
          <div><strong>SO2:</strong> {formatValue(station.so2)}</div>
          <div><strong>O3:</strong> {formatValue(station.o3total)}</div>
          <div><strong>UVAI:</strong> {formatValue(station.uvai)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <MapLibreMarker
      latitude={station.lat}
      longitude={station.lng}
      showPopup={showPopup}
      popupContent={PopupContent}
      onClosePopup={() => setShowPopup(false)}
      onClick={() => setShowPopup(!showPopup)}
      className="cursor-pointer"
    >
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        border: '2px solid white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </MapLibreMarker>
  );
};

export default AirStationMarker;
