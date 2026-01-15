import React from 'react';
import { ClusteredEarthquakeMarkers } from '../ClusteredEarthquakeMarkers';
import RainSensorMarker from '../RainSensorMarker';
import HotspotMarker from '../HotspotMarker';
import AirStationMarker from '../AirStationMarker';
import { FloodDataMarker } from '../FloodDataMarker';
import { FloodMarker } from '../FloodMarker';
import SinkholeMarker from '../SinkholeMarker';
import { FloodFeature } from '../hooks/useGISTDAFloodData';

interface MapMarkersProps {
  selectedType: string;
  filteredEarthquakes: any[];
  filteredRainSensors: any[];
  hotspots: any[];
  filteredAirStations: any[];
  floodDataPoints?: any[];
  gistdaFloodFeatures?: FloodFeature[];
  sinkholes?: any[];
}

const MapMarkersComponent: React.FC<MapMarkersProps> = ({
  selectedType,
  filteredEarthquakes,
  filteredRainSensors,
  hotspots,
  filteredAirStations,
  floodDataPoints = [],
  gistdaFloodFeatures = [],
  sinkholes = []
}) => {
  return (
    <>
      {/* Earthquake markers with clustering */}
      {selectedType === 'earthquake' && (
        <ClusteredEarthquakeMarkers earthquakes={filteredEarthquakes} />
      )}

      {/* Rain sensor markers */}
      {selectedType === 'heavyrain' && filteredRainSensors.map((sensor) => (
        <RainSensorMarker key={sensor.id} sensor={sensor} />
      ))}

      {/* Hotspot markers */}
      {selectedType === 'wildfire' && hotspots.map((hotspot, index) => (
        <HotspotMarker key={hotspot.id || index} hotspot={hotspot} />
      ))}

      {/* Air Station markers */}
      {selectedType === 'pm25' && filteredAirStations.map((station, index) => (
        <AirStationMarker key={station.station_id || index} station={station} />
      ))}

      {/* Flood Data markers (OpenMeteo) */}
      {selectedType === 'flood' && floodDataPoints.map((point, index) => (
        <FloodDataMarker key={point.id || index} floodPoint={point} />
      ))}

      {/* GISTDA Flood Features (Polygons) */}
      {selectedType === 'flood' && gistdaFloodFeatures.map((feature, index) => {
        const center: [number, number] = [
          feature.properties.center_lat || feature.geometry.coordinates[0][0][0][1],
          feature.properties.center_long || feature.geometry.coordinates[0][0][0][0]
        ];
        return (
          <FloodMarker
            key={feature.properties.id || index}
            feature={feature}
            center={center}
          />
        );
      })}

      {/* Sinkhole markers */}
      {selectedType === 'sinkhole' && sinkholes.map((sinkhole) => (
        <SinkholeMarker key={sinkhole.id} sinkhole={sinkhole} />
      ))}
    </>
  );
};

export const MapMarkers = React.memo(MapMarkersComponent);
