
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Earthquake } from './types';

// Custom icon for earthquake markers
const earthquakeIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface EarthquakeMarkerProps {
  earthquake: Earthquake;
}

const EarthquakeMarker: React.FC<EarthquakeMarkerProps> = ({ earthquake }) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getMagnitudeColor = (magnitude: number) => {
    if (magnitude >= 6) return "destructive";
    if (magnitude >= 5) return "default"; // red
    if (magnitude >= 4) return "secondary"; // yellow
    return "outline"; // green or lower intensity
  };

  return (
    <Marker 
      key={earthquake.id} 
      position={[earthquake.coordinates[0], earthquake.coordinates[1]]}
      icon={earthquakeIcon}
    >
      <Popup>
        <div className="text-sm">
          <div className="font-bold">{earthquake.location}</div>
          <div>
            Magnitude: <Badge variant={getMagnitudeColor(earthquake.magnitude)}>
              {earthquake.magnitude}
            </Badge>
          </div>
          <div>Time: {formatTime(earthquake.time)}</div>
        </div>
      </Popup>
    </Marker>
  );
};

export default EarthquakeMarker;
