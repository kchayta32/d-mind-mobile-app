
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Earthquake, RainSensor } from './types';
import EarthquakeMarker from './EarthquakeMarker';
import RainSensorMarker from './RainSensorMarker';
import { DisasterType } from './DisasterMap';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  earthquakes: Earthquake[];
  rainSensors: RainSensor[];
  selectedType: DisasterType;
  magnitudeFilter: number;
  humidityFilter: number;
  isLoading: boolean;
}

export const MapView: React.FC<MapViewProps> = ({ 
  earthquakes, 
  rainSensors,
  selectedType,
  magnitudeFilter,
  humidityFilter,
  isLoading 
}) => {
  // Filter data based on current filters
  const filteredEarthquakes = earthquakes.filter(eq => eq.magnitude >= magnitudeFilter);
  const filteredRainSensors = rainSensors.filter(sensor => 
    (sensor.humidity || 0) >= humidityFilter
  );

  // Thailand center coordinates
  const center: [number, number] = [13.7563, 100.5018];

  const renderMarkers = () => {
    switch (selectedType) {
      case 'earthquake':
        return filteredEarthquakes.map((earthquake) => (
          <EarthquakeMarker key={earthquake.id} earthquake={earthquake} />
        ));
      
      case 'heavyrain':
        return filteredRainSensors.map((sensor) => (
          <RainSensorMarker key={sensor.id} sensor={sensor} />
        ));
      
      default:
        return null;
    }
  };

  const renderComingSoon = () => {
    if (['flood', 'wildfire', 'storm'].includes(selectedType)) {
      return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-2">🚧 เร็วๆ นี้</h3>
            <p className="text-gray-600">
              แผนที่{selectedType === 'flood' ? 'น้ำท่วม' : selectedType === 'wildfire' ? 'ไฟป่า' : 'พายุ'}
              จะเปิดให้บริการเร็วๆ นี้
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {!isLoading && renderMarkers()}
      </MapContainer>
      
      {renderComingSoon()}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-[1000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      )}
    </div>
  );
};
