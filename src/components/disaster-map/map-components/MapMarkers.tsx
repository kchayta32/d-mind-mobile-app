
import React from 'react';
import ClusteredEarthquakeMarkers from '../ClusteredEarthquakeMarkers';
import RainSensorMarker from '../RainSensorMarker';
import HotspotMarker from '../HotspotMarker';
import AirStationMarker from '../AirStationMarker';
import { FloodDataMarker } from '../FloodDataMarker';
import { FloodMarker } from '../FloodMarker';
import { OpenMeteoWeatherMarker } from '../OpenMeteoWeatherMarker';
import SinkholeMarker from '../SinkholeMarker';
import { Earthquake, RainSensor, AirPollutionData } from '../types';
import { GISTDAHotspot } from '../useGISTDAData';
import { FloodDataPoint } from '../hooks/useOpenMeteoFloodData';
import { FloodFeature, getFloodCenter } from '../hooks/useGISTDAFloodData';
import { OpenMeteoRainDataPoint } from '../hooks/useOpenMeteoRainData';
import { SinkholeData } from '../../../hooks/useSinkholeData';
import { DisasterType } from '../DisasterMap';

interface MapMarkersProps {
  selectedType: DisasterType;
  filteredEarthquakes: Earthquake[];
  filteredRainSensors: RainSensor[];
  hotspots: GISTDAHotspot[];
  filteredAirStations: AirPollutionData[];
  floodDataPoints?: FloodDataPoint[];
  gistdaFloodFeatures?: FloodFeature[];
  openMeteoRainData?: OpenMeteoRainDataPoint[];
  sinkholes: SinkholeData[];
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  selectedType,
  filteredEarthquakes,
  filteredRainSensors,
  hotspots,
  filteredAirStations,
  floodDataPoints = [],
  gistdaFloodFeatures = [],
  openMeteoRainData = [],
  sinkholes
}) => {
  console.log('MapMarkers rendering with:', {
    selectedType,
    filteredRainSensors: filteredRainSensors.length,
    filteredEarthquakes: filteredEarthquakes.length,
    hotspots: hotspots.length,
    filteredAirStations: filteredAirStations.length,
    openMeteoRainData: openMeteoRainData.length,
    gistdaFloodFeatures: gistdaFloodFeatures.length
  });

  return (
    <>
      {/* Earthquake markers with clustering */}
      {selectedType === 'earthquake' && (
        <ClusteredEarthquakeMarkers earthquakes={filteredEarthquakes} />
      )}

      {/* Rain sensor markers */}
      {selectedType === 'heavyrain' && filteredRainSensors.map((sensor) => {
        console.log('Rendering rain sensor:', sensor.id, sensor.coordinates);
        return (
          <RainSensorMarker key={sensor.id} sensor={sensor} />
        );
      })}

      {/* Open-Meteo rain data markers */}
      {selectedType === 'openmeteorain' && openMeteoRainData.map((dataPoint, index) => (
        <OpenMeteoWeatherMarker 
          key={`openmeteo-${dataPoint.locationName}-${index}`} 
          dataPoint={dataPoint} 
        />
      ))}

      {/* Wildfire hotspot markers */}
      {selectedType === 'wildfire' && hotspots.map((hotspot) => (
        <HotspotMarker key={`${hotspot.geometry?.coordinates?.[1]}-${hotspot.geometry?.coordinates?.[0]}-${hotspot.ACQ_DATE}`} hotspot={hotspot} />
      ))}

      {/* Air pollution station markers */}
      {selectedType === 'airpollution' && filteredAirStations.map((station) => (
        <AirStationMarker key={station.id} station={station} />
      ))}

      {/* GISTDA Flood markers */}
      {selectedType === 'flood' && gistdaFloodFeatures.map((feature, index) => {
        const center = getFloodCenter(feature);
        return (
          <FloodMarker key={`gistda-flood-${feature.id}-${index}`} feature={feature} center={center} />
        );
      })}

      {/* Open-Meteo Flood data markers (river discharge) */}
      {selectedType === 'flood' && floodDataPoints.map((floodPoint, index) => (
        <FloodDataMarker key={`flood-river-${index}`} floodPoint={floodPoint} />
      ))}

      {/* Sinkhole markers */}
      {selectedType === 'sinkhole' && sinkholes.map((sinkhole) => (
        <SinkholeMarker key={sinkhole.id} sinkhole={sinkhole} />
      ))}
    </>
  );
};
