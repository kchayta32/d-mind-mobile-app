import React, { useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import { FloodFeature } from './hooks/useGISTDAFloodData';
import { MapLibreMarker } from './maplibre/MapLibreMarker';

interface FloodMarkerProps {
  feature: FloodFeature;
  center: [number, number];
}

const FloodMarkerComponent: React.FC<FloodMarkerProps> = ({ feature, center }) => {
  const { properties } = feature;
  const area = properties.f_area || 0;
  const areaInKm = (area / 1000000).toFixed(2);
  const [showPopup, setShowPopup] = useState(false);

  // Unique ID for source and layer
  const sourceId = `flood-source-${properties.id || Math.random()}`;
  const layerId = `flood-layer-${properties.id || Math.random()}`;

  const PopupContent = (
    <div className="p-2 min-w-[300px]">
      <div className="font-bold text-base mb-2 text-blue-700">
        🌊 พื้นที่น้ำท่วม
      </div>

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
  );

  return (
    <>
      {/* Render polygon */}
      <Source id={sourceId} type="geojson" data={feature as any}>
        <Layer 
          id={layerId}
          type="fill"
          paint={{
            'fill-color': '#3b82f6',
            'fill-opacity': 0.3
          }}
        />
      </Source>

      {/* Render marker at center */}
      <MapLibreMarker
        latitude={center[0]}
        longitude={center[1]}
        showPopup={showPopup}
        popupContent={PopupContent}
        onClosePopup={() => setShowPopup(false)}
        onClick={() => setShowPopup(!showPopup)}
        className="cursor-pointer"
      >
        <div className="flood-marker" style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)',
          border: '2.5px solid white',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 3px 12px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.2)'
        }}>
          <span style={{ fontSize: '15px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>🌊</span>
        </div>
      </MapLibreMarker>
    </>
  );
};

export const FloodMarker = React.memo(FloodMarkerComponent);

