import React, { useState, useMemo, useCallback } from 'react';
import { Source, Layer, Popup, useMap } from 'react-map-gl';
import { Earthquake } from './types';

interface ClusteredEarthquakeMarkersProps {
  earthquakes: Earthquake[];
}

// Convert earthquakes to GeoJSON with properties for styling
function earthquakesToGeoJSON(earthquakes: Earthquake[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: earthquakes.map(eq => {
      const lat = eq.latitude || eq.lat;
      const lng = eq.longitude || eq.lng;

      // Determine color based on magnitude
      let color = '#22c55e';
      if (eq.magnitude >= 7.0) color = '#dc2626';
      else if (eq.magnitude >= 6.0) color = '#ea580c';
      else if (eq.magnitude >= 5.0) color = '#eab308';
      else if (eq.magnitude >= 4.0) color = '#65a30d';

      return {
        type: 'Feature' as const,
        properties: {
          id: eq.id,
          magnitude: eq.magnitude,
          depth: eq.depth,
          time: eq.time,
          location: eq.location || '',
          url: eq.url || '',
          color
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [lng, lat]
        }
      };
    })
  };
}

const getMagnitudeDescription = (magnitude: number) => {
  if (magnitude < 3.0) return 'แผ่นดินไหวเล็กน้อย';
  if (magnitude < 4.0) return 'แผ่นดินไหวเล็ก';
  if (magnitude < 5.0) return 'แผ่นดินไหวปานกลาง';
  if (magnitude < 6.0) return 'แผ่นดินไหวแรง';
  if (magnitude < 7.0) return 'แผ่นดินไหวรุนแรง';
  return 'แผ่นดินไหวรุนแรงมาก';
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

const ClusteredEarthquakeMarkers: React.FC<ClusteredEarthquakeMarkersProps> = ({ earthquakes }) => {
  const { current: map } = useMap();
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    properties: any;
  } | null>(null);

  const geojsonData = useMemo(() => earthquakesToGeoJSON(earthquakes), [earthquakes]);

  // Handle click on cluster or point
  const handleClick = useCallback((e: any) => {
    if (!map) return;

    const features = e.features;
    if (!features || features.length === 0) return;

    const feature = features[0];
    const clusterId = feature.properties?.cluster_id;

    if (clusterId) {
      // Clicked on a cluster - zoom in
      const source = map.getSource('earthquakes') as any;
      if (source) {
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          map.easeTo({
            center: feature.geometry.coordinates,
            zoom: Math.min(zoom, 14)
          });
        });
      }
    } else {
      // Clicked on individual earthquake - show popup
      const [longitude, latitude] = feature.geometry.coordinates;
      setPopupInfo({
        longitude,
        latitude,
        properties: feature.properties
      });
    }
  }, [map]);

  // Set up event listeners
  React.useEffect(() => {
    if (!map) return;

    map.on('click', 'clusters', handleClick);
    map.on('click', 'unclustered-point', handleClick);

    // Change cursor on hover
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = '';
    });

    return () => {
      map.off('click', 'clusters', handleClick);
      map.off('click', 'unclustered-point', handleClick);
    };
  }, [map, handleClick]);

  return (
    <>
      <Source
        id="earthquakes"
        type="geojson"
        data={geojsonData}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        {/* Cluster circles */}
        <Layer
          id="clusters"
          type="circle"
          filter={['has', 'point_count']}
          paint={{
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#22c55e',  // green for < 10
              10, '#eab308',  // yellow for < 50
              50, '#f97316',  // orange for < 100
              100, '#dc2626'  // red for >= 100
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,   // 20px for < 10
              10, 25,   // 25px for < 50
              50, 30,   // 30px for < 100
              100, 40   // 40px for >= 100
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff'
          }}
        />

        {/* Cluster count text */}
        <Layer
          id="cluster-count"
          type="symbol"
          filter={['has', 'point_count']}
          layout={{
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 14
          }}
          paint={{
            'text-color': '#ffffff'
          }}
        />

        {/* Unclustered earthquake points */}
        <Layer
          id="unclustered-point"
          type="circle"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': ['get', 'color'],
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'magnitude'],
              3, 8,
              5, 12,
              7, 18,
              9, 25
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
            'circle-opacity': 0.9
          }}
        />

        {/* Magnitude label on unclustered points */}
        <Layer
          id="unclustered-label"
          type="symbol"
          filter={['!', ['has', 'point_count']]}
          layout={{
            'text-field': ['number-format', ['get', 'magnitude'], { 'max-fraction-digits': 1 }],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-allow-overlap': true
          }}
          paint={{
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0,0,0,0.5)',
            'text-halo-width': 1
          }}
        />
      </Source>

      {/* Popup for selected earthquake */}
      {popupInfo && (
        <Popup
          longitude={popupInfo.longitude}
          latitude={popupInfo.latitude}
          onClose={() => setPopupInfo(null)}
          closeButton={true}
          closeOnClick={false}
          anchor="bottom"
        >
          <div className="p-2 min-w-64 bg-white rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: popupInfo.properties.color,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {Number(popupInfo.properties.magnitude).toFixed(1)}
              </div>
              <h3 className="font-bold text-lg text-gray-800">แผ่นดินไหว</h3>
            </div>

            <div className="space-y-2 text-sm text-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-semibold text-gray-600">ขนาด:</span>
                  <div className="text-lg font-bold text-red-600">
                    {Number(popupInfo.properties.magnitude).toFixed(1)} Mw
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">ความลึก:</span>
                  <div className="text-lg font-bold text-blue-600">
                    {popupInfo.properties.depth} กม.
                  </div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-600">ระดับ:</span>
                <div
                  className={`inline-block px-2 py-1 rounded text-white text-xs font-semibold ml-1 ${popupInfo.properties.magnitude >= 6.0 ? 'bg-red-500' :
                      popupInfo.properties.magnitude >= 5.0 ? 'bg-orange-500' :
                        popupInfo.properties.magnitude >= 4.0 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                >
                  {getMagnitudeDescription(popupInfo.properties.magnitude)}
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-600">ตำแหน่ง:</span>
                <div className="text-gray-700">
                  {popupInfo.latitude.toFixed(4)}°N, {popupInfo.longitude.toFixed(4)}°E
                </div>
              </div>

              <div>
                <span className="font-semibold text-gray-600">เวลา:</span>
                <div className="text-gray-700">{formatDate(popupInfo.properties.time)}</div>
              </div>

              {popupInfo.properties.location && (
                <div>
                  <span className="font-semibold text-gray-600">สถานที่:</span>
                  <div className="text-gray-700">{popupInfo.properties.location}</div>
                </div>
              )}

              {popupInfo.properties.url && (
                <div className="mt-3 pt-2 border-t">
                  <a
                    href={popupInfo.properties.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    ดูรายละเอียดเพิ่มเติม →
                  </a>
                </div>
              )}
            </div>
          </div>
        </Popup>
      )}
    </>
  );
};

export { ClusteredEarthquakeMarkers };
export default ClusteredEarthquakeMarkers;
