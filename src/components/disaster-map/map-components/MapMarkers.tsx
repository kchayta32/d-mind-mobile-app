import React from 'react';
import { ClusteredEarthquakeMarkers } from '../ClusteredEarthquakeMarkers';
import { ClusteredHotspotMarkers } from '../ClusteredHotspotMarkers';
import { FloodVectorLayer } from '../FloodVectorLayer';
import { WaterHyacinthLayer } from '../WaterHyacinthLayer';
import { CrowdsourcedFloodMarkers } from '../CrowdsourcedFloodMarkers';
import { StormMarker } from './StormMarker';
import RainSensorMarker from '../RainSensorMarker';
import AirStationMarker from '../AirStationMarker';
import { FloodDataMarker } from '../FloodDataMarker';
import { FloodFeature } from '../hooks/useGISTDAFloodData';
import { WaterHyacinthFeature } from '@/services/gistda/types';
import { CrowdsourcedFloodReport, StormData } from '../types';

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
  crowdsourcedReports?: CrowdsourcedFloodReport[];
  storms?: StormData[];
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
  crowdsourcedReports = [],
  storms = []
}) => {
  return (
    <>
      {/* 1. Earthquake markers with clustering */}
      {selectedType === 'earthquake' && (
        <ClusteredEarthquakeMarkers earthquakes={filteredEarthquakes} />
      )}

      {/* 2. Rain sensor markers */}
      {selectedType === 'heavyrain' &&
        filteredRainSensors.map((sensor) => (
          <RainSensorMarker key={sensor.id} sensor={sensor} />
        ))}

      {/* 3. High-performance GPU Clustered Hotspot markers */}
      {selectedType === 'wildfire' && (
        <ClusteredHotspotMarkers hotspots={hotspots} />
      )}

      {/* 4. Air Station markers (PM2.5 / Air Pollution) */}
      {(selectedType === 'pm25' || selectedType === 'airpollution') &&
        filteredAirStations.map((station, index) => (
          <AirStationMarker key={station.id || station.station_id || index} station={station} />
        ))}

      {/* 5. Flood Data markers (OpenMeteo river monitoring) */}
      {selectedType === 'flood' &&
        floodDataPoints.map((point, index) => (
          <FloodDataMarker key={point.id || index} floodPoint={point} />
        ))}

      {/* 6. Single GPU-accelerated Flood Vector Layer (GISTDA Sentinel Polygons) */}
      {selectedType === 'flood' && (
        <FloodVectorLayer features={gistdaFloodFeatures} />
      )}

      {/* 7. Crowdsourced Citizen Flood Ground Truth Markers */}
      {selectedType === 'flood' && crowdsourcedReports.length > 0 && (
        <CrowdsourcedFloodMarkers reports={crowdsourcedReports} />
      )}

      {/* 8. Water Hyacinth obstruction layer */}
      {selectedType === 'flood' && showWaterHyacinth && (
        <WaterHyacinthLayer features={waterHyacinthFeatures} />
      )}

      {/* 9. Tropical Cyclones & Storm Markers */}
      {selectedType === 'storm' &&
        storms.map((storm) => (
          <StormMarker key={storm.id} storm={storm} />
        ))}
    </>
  );
};

export const MapMarkers = React.memo(MapMarkersComponent);
export default MapMarkers;
