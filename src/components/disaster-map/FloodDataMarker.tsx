
import React, { useState } from 'react';
import { FloodDataPoint } from './hooks/useOpenMeteoFloodData';
import { FloodTimeSeriesChart } from './charts/FloodTimeSeriesChart';
import { MapLibreMarker } from './maplibre/MapLibreMarker';

interface FloodDataMarkerProps {
  floodPoint: FloodDataPoint;
}

export const FloodDataMarker: React.FC<FloodDataMarkerProps> = ({ floodPoint }) => {
  const [showPopup, setShowPopup] = useState(false);

  const currentDischarge = floodPoint.data.daily.river_discharge[7]; // Current day (index 7 in past_days=7)
  const maxDischarge = Math.max(...floodPoint.data.daily.river_discharge);

  const PopupContent = (
    <div className="p-2 min-w-[350px]">
      <FloodTimeSeriesChart
        data={floodPoint.data}
        locationName={floodPoint.locationName}
      />
      <div className="mt-3 text-xs space-y-1">
        <div className="flex justify-between">
          <span>การไหลปัจจุบัน:</span>
          <span className="font-semibold">{currentDischarge?.toFixed(2)} m³/s</span>
        </div>
        <div className="flex justify-between">
          <span>การไหลสูงสุด (7 เดือน):</span>
          <span className="font-semibold text-red-600">{maxDischarge?.toFixed(2)} m³/s</span>
        </div>
      </div>
    </div>
  );

  return (
    <MapLibreMarker
      latitude={floodPoint.lat}
      longitude={floodPoint.lon}
      showPopup={showPopup}
      popupContent={PopupContent}
      onClosePopup={() => setShowPopup(false)}
      onClick={() => setShowPopup(!showPopup)}
      className="cursor-pointer"
    >
      <div style={{
        backgroundColor: '#3b82f6',
        border: '2px solid white',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}>
        <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>💧</span>
      </div>
    </MapLibreMarker>
  );
};
