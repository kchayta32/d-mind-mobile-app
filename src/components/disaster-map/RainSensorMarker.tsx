
import React, { useState } from 'react';
import { RainSensor } from './types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Calendar, Gauge } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { MapLibreMarker } from './maplibre/MapLibreMarker';

interface RainSensorMarkerProps {
  sensor: RainSensor;
}

const RainSensorMarker: React.FC<RainSensorMarkerProps> = ({ sensor }) => {
  const [showPopup, setShowPopup] = useState(false);

  // Helper to get color values
  const getIconColor = (isRaining: boolean | null, humidity: number | null) => {
    const humidityValue = humidity || 0;
    if (isRaining) return '#3b82f6'; // Blue
    if (humidityValue > 80) return '#eab308'; // Yellow
    return '#10b981'; // Green
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'ไม่ระบุ';
    try {
      return format(new Date(dateString), 'PPP p', { locale: th });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusLabel = () => {
    if (sensor.is_raining === true) return 'กำลังฝนตก';
    if (sensor.humidity && sensor.humidity > 80) return 'ความชื้นสูง';
    return 'ปกติ';
  };

  const getStatusColor = () => {
    if (sensor.is_raining === true) return 'bg-blue-100 text-blue-800';
    if (sensor.humidity && sensor.humidity > 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Ensure coordinates exist and are valid
  if (!sensor.coordinates || !Array.isArray(sensor.coordinates) || sensor.coordinates.length !== 2) {
    // console.warn('Invalid coordinates for sensor:', sensor);
    return null;
  }

  const [lat, lng] = sensor.coordinates;
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    // console.warn('Invalid coordinate values for sensor:', sensor);
    return null;
  }

  const iconColor = getIconColor(sensor.is_raining, sensor.humidity);

  const PopupContent = (
    <Card className="border-0 shadow-none min-w-[250px]">
      <CardHeader className="pb-2 p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-blue-500" />
            เซ็นเซอร์ฝน #{sensor.id}
          </CardTitle>
          <Badge className={`text-[10px] px-1 py-0 ${getStatusColor()}`}>
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-3 pt-0">
        <div className="flex items-center gap-2 text-sm">
          <Gauge className="h-3.5 w-3.5 text-gray-500" />
          <span>ความชื้น: {sensor.humidity || 0}%</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CloudRain className="h-3.5 w-3.5 text-gray-500" />
          <span>สถานะ: {sensor.is_raining === true ? 'ฝนตก' : sensor.is_raining === false ? 'ไม่ฝนตก' : 'ไม่ระบุ'}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>อัพเดต: {formatDate(sensor.inserted_at || sensor.created_at)}</span>
        </div>

        {sensor.latitude && sensor.longitude && (
          <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
            พิกัด: {sensor.latitude.toFixed(4)}, {sensor.longitude.toFixed(4)}
          </div>
        )}
      </CardContent>
    </Card>
  );

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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill={iconColor} stroke="white" strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </MapLibreMarker>
  );
};

export default RainSensorMarker;
