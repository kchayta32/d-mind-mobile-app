
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create custom icon for user location
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

interface UserLocationMarkerProps {
  position: [number, number];
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  return (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>
        <div className="text-center">
          <strong>ตำแหน่งของคุณ</strong>
          <br />
          <small>
            {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </small>
        </div>
      </Popup>
    </Marker>
  );
};
