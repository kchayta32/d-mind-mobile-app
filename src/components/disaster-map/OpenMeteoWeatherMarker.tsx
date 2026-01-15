import React, { useState } from 'react';
import { MapLibreMarker } from './maplibre/MapLibreMarker';
import { OpenMeteoRainDataPoint } from './hooks/useOpenMeteoRainData';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Droplets, Wind, Thermometer } from 'lucide-react';

// Weather code to icon mapping (simplified)
const getWeatherIcon = (code: number) => {
  if (code >= 61 && code <= 67) return <CloudRain className="w-4 h-4" />;
  if (code >= 51 && code <= 57) return <Droplets className="w-4 h-4" />;
  if (code >= 80 && code <= 82) return <CloudRain className="w-4 h-4" />;
  if (code >= 20 && code <= 30) return <Cloud className="w-4 h-4" />;
  return <Cloud className="w-4 h-4" />;
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'ท้องฟ้าแจ่มใส';
  if (code === 1) return 'เมฆบางส่วน';
  if (code === 2) return 'เมฆปานกลาง';
  if (code === 3) return 'เมฆมาก';
  if (code >= 45 && code <= 48) return 'หมอก';
  if (code >= 51 && code <= 57) return 'ฝนปรอยๆ';
  if (code >= 61 && code <= 67) return 'ฝนตก';
  if (code >= 80 && code <= 82) return 'ฝนฟ้าคะนอง';
  if (code >= 95 && code <= 99) return 'พายุฝนฟ้าคะนอง';
  return 'สภาพอากาศปกติ';
};

interface OpenMeteoWeatherMarkerProps {
  dataPoint: OpenMeteoRainDataPoint;
}

export const OpenMeteoWeatherMarker: React.FC<OpenMeteoWeatherMarkerProps> = ({ dataPoint }) => {
  const [showPopup, setShowPopup] = useState(false);
  const { weatherData, locationName, lat, lon } = dataPoint;
  const { current, daily } = weatherData;

  // Get today's forecast
  const todayRainSum = daily.rainSum[0];
  const todayPrecipitationSum = daily.precipitationSum[0];
  const todayPrecipitationProb = daily.precipitationProbabilityMax[0];

  // Determine marker color based on conditions
  const isRaining = current.rain > 0 || current.precipitation > 0;
  const isHeavyRain = current.rain > 5 || current.precipitation > 5;
  let color = '#3b82f6'; // Default blue
  if (isHeavyRain) color = '#ef4444'; // Red for heavy rain
  else if (isRaining) color = '#f59e0b'; // Orange for light rain

  const PopupContent = (
    <div className="space-y-3 p-2 min-w-[280px]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {getWeatherIcon(current.weatherCode)}
          {locationName}
        </h3>
        <Badge variant={current.rain > 0 ? "destructive" : "secondary"}>
          {getWeatherDescription(current.weatherCode)}
        </Badge>
      </div>

      {/* Current Conditions */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          <span>{current.temperature2m.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          <span>{current.relativeHumidity2m.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <CloudRain className="w-3 h-3" />
          <span>{current.precipitation.toFixed(1)} mm</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-3 h-3" />
          <span>{current.windSpeed10m.toFixed(1)} km/h</span>
        </div>
      </div>

      {/* Today's Forecast */}
      <div className="border-t pt-2">
        <h4 className="font-medium text-sm mb-2">พยากรณ์วันนี้:</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>ปริมาณฝน:</span>
            <span className="font-semibold">{todayRainSum.toFixed(1)} mm</span>
          </div>
          <div className="flex justify-between">
            <span>ปริมาณน้ำฝน:</span>
            <span className="font-semibold">{todayPrecipitationSum.toFixed(1)} mm</span>
          </div>
          <div className="flex justify-between">
            <span>โอกาสฝนตก:</span>
            <span className="font-semibold">{todayPrecipitationProb.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="text-xs text-gray-500 border-t pt-2">
        <div>พิกัด: {lat.toFixed(4)}, {lon.toFixed(4)}</div>
        <div>อัปเดตล่าสุด: {current.time.toLocaleTimeString('th-TH')}</div>
      </div>
    </div>
  );

  return (
    <MapLibreMarker
      latitude={lat}
      longitude={lon}
      showPopup={showPopup}
      popupContent={PopupContent}
      onClosePopup={() => setShowPopup(false)}
      onClick={() => setShowPopup(!showPopup)}
      className="cursor-pointer"
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: color,
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Cloud className="w-3 h-3 text-white" />
      </div>
    </MapLibreMarker>
  );
};
