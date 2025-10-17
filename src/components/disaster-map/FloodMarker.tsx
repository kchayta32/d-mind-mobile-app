import React from 'react';
import { Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { FloodFeature } from './hooks/useGISTDAFloodData';

const floodIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
      border: 2px solid white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    ">
      <span style="font-size: 14px;">🌊</span>
    </div>
  `,
  className: 'flood-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

interface FloodMarkerProps {
  feature: FloodFeature;
  center: [number, number];
}

export const FloodMarker: React.FC<FloodMarkerProps> = ({ feature, center }) => {
  const { properties } = feature;
  const area = properties.f_area || 0;
  const areaInKm = (area / 1000000).toFixed(2);
  
  // Extract polygon coordinates for rendering
  const polygonPositions = feature.geometry.coordinates[0][0].map(
    coord => [coord[1], coord[0]] as [number, number]
  );

  return (
    <>
      {/* Render polygon */}
      <Polygon
        positions={polygonPositions}
        pathOptions={{
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.3,
          weight: 2
        }}
      />
      
      {/* Render marker at center */}
      <Marker position={center} icon={floodIcon}>
        <Popup maxWidth={300} className="flood-popup">
          <div className="p-2">
            <h3 className="font-bold text-base mb-2 text-blue-700">
              🌊 พื้นที่น้ำท่วม
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <span className="text-muted-foreground">จังหวัด:</span>
                <span className="font-medium">{properties.pv_tn || 'N/A'}</span>
                
                <span className="text-muted-foreground">อำเภอ:</span>
                <span className="font-medium">{properties.ap_tn || 'N/A'}</span>
                
                <span className="text-muted-foreground">ตำบล:</span>
                <span className="font-medium">{properties.tb_tn || 'N/A'}</span>
              </div>
              
              <div className="border-t pt-2">
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-muted-foreground">พื้นที่น้ำท่วม:</span>
                  <span className="font-semibold text-blue-600">{areaInKm} ตร.กม.</span>
                </div>
              </div>

              {(properties.population || properties.population_2) && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-muted-foreground">ประชากรที่อาจได้รับผลกระทบ:</span>
                  <span className="font-medium text-orange-600">
                    ~{Math.round(properties.population || properties.population_2 || 0)} คน
                  </span>
                </div>
              )}

              {properties.building > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-muted-foreground">อาคาร:</span>
                  <span className="font-medium">{properties.building} หลัง</span>
                </div>
              )}

              {properties.length_road > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="text-muted-foreground">ถนน:</span>
                  <span className="font-medium">{(properties.length_road / 1000).toFixed(2)} กม.</span>
                </div>
              )}

              {properties.file_name && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  ข้อมูลจาก: {properties.file_name}
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-1">
                อัพเดท: {new Date(properties._updatedAt).toLocaleString('th-TH')}
              </div>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
};
