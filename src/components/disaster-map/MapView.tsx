
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EarthquakeMarker from './EarthquakeMarker';
import { Earthquake } from './types';

interface MapViewProps {
  error: string | null;
  filteredEarthquakes: Earthquake[];
  handleRefresh: () => void;
}

const MapView: React.FC<MapViewProps> = ({ error, filteredEarthquakes, handleRefresh }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
          ลองอีกครั้ง
        </Button>
      </div>
    );
  }
  
  return (
    <MapContainer 
      center={[15.8700, 100.9925]} // Center of Thailand
      zoom={3} // Zoomed out to see more earthquakes globally
      style={{ height: '100%', width: '100%' }} 
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {filteredEarthquakes.map((earthquake) => (
        <EarthquakeMarker key={earthquake.id} earthquake={earthquake} />
      ))}
    </MapContainer>
  );
};

export default MapView;
