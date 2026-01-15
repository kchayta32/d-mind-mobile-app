
import React, { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-map-gl';

interface UserLocationMarkerProps {
  showLocation: boolean;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ showLocation }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { current: map } = useMap();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!showLocation) {
      setPosition(null);
      setError(null);
      return;
    }

    if (!navigator.geolocation) {
      setError('การระบุตำแหน่งไม่รองรับในเบราว์เซอร์นี้');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (location) => {
        const { latitude, longitude } = location.coords;
        const newPosition: [number, number] = [longitude, latitude]; // MapLibre uses [lng, lat]
        setPosition(newPosition);
        setError(null);

        // Center map on user location if map instance exists
        if (map) {
          map.flyTo({
            center: newPosition,
            zoom: 10
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('การเข้าถึงตำแหน่งถูกปฏิเสธ');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('ไม่สามารถระบุตำแหน่งได้');
            break;
          case error.TIMEOUT:
            setError('หมดเวลาในการระบุตำแหน่ง');
            break;
          default:
            setError('เกิดข้อผิดพลาดในการระบุตำแหน่ง');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [showLocation, map]);

  if (!showLocation || !position) {
    return null;
  }

  if (error) {
    console.error('Location error:', error);
    return null;
  }

  return (
    <>
      <Marker
        longitude={position[0]}
        latitude={position[1]}
        anchor="center"
        onClick={() => setShowPopup(!showPopup)}
        style={{ zIndex: 1000 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
          <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" strokeWidth="4" />
          <circle cx="16" cy="16" r="6" fill="white" />
          <circle cx="16" cy="16" r="3" fill="#3B82F6" />
        </svg>
      </Marker>

      {showPopup && (
        <Popup
          longitude={position[0]}
          latitude={position[1]}
          anchor="top"
          onClose={() => setShowPopup(false)}
          closeOnClick={false}
          offset={16}
        >
          <div className="text-center p-2">
            <div className="font-semibold text-blue-600 mb-2">📍 ตำแหน่งของคุณ</div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>ละติจูด: {position[1].toFixed(6)}</div>
              <div>ลองจิจูด: {position[0].toFixed(6)}</div>
              <div className="mt-2 text-xs text-blue-500">
                อัปเดตแบบเรียลไทม์
              </div>
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};
