import React from 'react';
import { ClusteredEarthquakeMarkers } from '../ClusteredEarthquakeMarkers';
import { ClusteredHotspotMarkers } from '../ClusteredHotspotMarkers';
import { FloodVectorLayer } from '../FloodVectorLayer';
import { WaterHyacinthLayer } from '../WaterHyacinthLayer';
import RainSensorMarker from '../RainSensorMarker';
import AirStationMarker from '../AirStationMarker';
import { FloodDataMarker } from '../FloodDataMarker';
import SinkholeMarker from '../SinkholeMarker';
import { FloodFeature } from '../hooks/useGISTDAFloodData';
import { WaterHyacinthFeature } from '@/services/gistda/types';

interface MapMarkersProps {
  selectedType: string;
  filteredEarthquakes: any[];
  filteredRainSensors: any[];
  hotspots: any[];
  filteredAirStations: any[];
  floodDataPoints?: any[];
  gistdaFloodFeatures?: FloodFeature[];
  waterHyacinthFeatures?: WaterHyacinthFeature[];
  showWaterHyacinth?: boolean;
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
  waterHyacinthFeatures = [],
  showWaterHyacinth = false,
  sinkholes = []
}) => {
  return (
    <>
      {/* Earthquake markers with clustering */}
      {selectedType === 'earthquake' && (
        <ClusteredEarthquakeMarkers earthquakes={filteredEarthquakes} />
      )}

      {/* Rain sensor markers */}
      {selectedType === 'heavyrain' &&
        filteredRainSensors.map((sensor) => (
          <RainSensorMarker key={sensor.id} sensor={sensor} />
        ))}

      {/* High-performance GPU Clustered Hotspot markers (Eliminates lag for 1000+ points) */}
      {selectedType === 'wildfire' && (
        <ClusteredHotspotMarkers hotspots={hotspots} />
      )}

      {/* Air Station markers */}
      {selectedType === 'pm25' &&
        filteredAirStations.map((station, index) => (
          <AirStationMarker key={station.station_id || index} station={station} />
        ))}

      {/* Flood Data markers (OpenMeteo river monitoring) */}
      {selectedType === 'flood' &&
        floodDataPoints.map((point, index) => (
          <FloodDataMarker key={point.id || index} floodPoint={point} />
        ))}

      {/* Single GPU-accelerated Flood Vector Layer (Replaces hundreds of separate DOM layers) */}
      {selectedType === 'flood' && (
        <FloodVectorLayer features={gistdaFloodFeatures} />
      )}

      {/* Water Hyacinth obstruction layer */}
      {selectedType === 'flood' && showWaterHyacinth && (
        <WaterHyacinthLayer features={waterHyacinthFeatures} />
      )}

      {/* Sinkhole markers */}
      {selectedType === 'sinkhole' &&
        sinkholes.map((sinkhole) => (
          <SinkholeMarker key={sinkhole.id} sinkhole={sinkhole} />
        ))}
    </>
  );
};

export const MapMarkers = React.memo(MapMarkersComponent);
