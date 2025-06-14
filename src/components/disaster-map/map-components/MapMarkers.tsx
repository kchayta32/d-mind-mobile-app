
import React from 'react';
import EarthquakeMarker from '../EarthquakeMarker';
import RainSensorMarker from '../RainSensorMarker';
import HotspotMarker from '../HotspotMarker';
import AirStationMarker from '../AirStationMarker';
import { FloodDataMarker } from '../FloodDataMarker';
import { OpenMeteoWeatherMarker } from '../OpenMeteoWeatherMarker';
import { Earthquake, RainSensor, AirPollutionData } from '../types';
import { GISTDAHotspot } from '../useGISTDAData';
import { FloodDataPoint } from '../hooks/useOpenMeteoFloodData';
import { OpenMeteoRainDataPoint } from '../hooks/useOpenMeteoRainData';
import { DisasterType } from '../DisasterMap';

interface MapMarkersProps {
  selectedType: DisasterType;
  filteredEarthquakes: Earthquake[];
  filteredRainSensors: RainSensor[];
  hotspots: GISTDAHotspot[];
  filteredAirStations: AirPollutionData[];
  floodDataPoints?: FloodDataPoint[];
  openMeteoRainData?: OpenMeteoRainDataPoint[];
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  selectedType,
  filteredEarthquakes,
  filteredRainSensors,
  hotspots,
  filteredAirStations,
  floodDataPoints = [],
  openMeteoRainData = []
}) => {
  console.log('MapMarkers rendering with:', {
    selectedType,
    filteredRainSensors: filteredRainSensors.length,
    filteredEarthquakes: filteredEarthquakes.length,
    hotspots: hotspots.length,
    filteredAirStations: filteredAirStations.length
  });

  return (
    <>
      {/* Earthquake markers */}
      {selectedType === 'earthquake' && filteredEarthquakes.map((earthquake) => (
        <EarthquakeMarker key={earthquake.id} earthquake={earthquake} />
      ))}

      {/* Rain sensor markers */}
      {selectedType === 'heavyrain' && filteredRainSensors.map((sensor) => {
        console.log('Rendering rain sensor:', sensor.id, sensor.coordinates);
        return (
          <RainSensorMarker key={sensor.id} sensor={sensor} />
        );
      })}

      {/* Open-Meteo rain data markers */}
      {selectedType === 'openmeteorain' && openMeteoRainData.map((dataPoint, index) => (
        <OpenMeteoWeatherMarker key={`openmeteo-${index}`} dataPoint={dataPoint} />
      ))}

      {/* Wildfire hotspot markers */}
      {selectedType === 'wildfire' && hotspots.map((hotspot) => (
        <HotspotMarker key={`${hotspot.geometry?.coordinates?.[1]}-${hotspot.geometry?.coordinates?.[0]}-${hotspot.ACQ_DATE}`} hotspot={hotspot} />
      ))}

      {/* Air pollution station markers */}
      {selectedType === 'airpollution' && filteredAirStations.map((station) => (
        <AirStationMarker key={station.id} station={station} />
      ))}

      {/* Flood data markers */}
      {selectedType === 'flood' && floodDataPoints.map((floodPoint, index) => (
        <FloodDataMarker key={`flood-${index}`} floodPoint={floodPoint} />
      ))}
    </>
  );
};
