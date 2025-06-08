
import React from 'react';
import EarthquakeMarker from '../EarthquakeMarker';
import RainSensorMarker from '../RainSensorMarker';
import HotspotMarker from '../HotspotMarker';
import AirStationMarker from '../AirStationMarker';
import { Earthquake, RainSensor, AirPollutionData } from '../types';
import { GISTDAHotspot } from '../useGISTDAData';
import { DisasterType } from '../DisasterMap';

interface MapMarkersProps {
  selectedType: DisasterType;
  filteredEarthquakes: Earthquake[];
  filteredRainSensors: RainSensor[];
  hotspots: GISTDAHotspot[];
  filteredAirStations: AirPollutionData[];
  isLoading: boolean;
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  selectedType,
  filteredEarthquakes,
  filteredRainSensors,
  hotspots,
  filteredAirStations,
  isLoading
}) => {
  if (isLoading) return null;

  switch (selectedType) {
    case 'earthquake':
      console.log('Rendering earthquake markers:', filteredEarthquakes.length);
      return (
        <>
          {filteredEarthquakes.map((earthquake) => (
            <EarthquakeMarker key={earthquake.id} earthquake={earthquake} />
          ))}
        </>
      );
    
    case 'heavyrain':
      console.log('Rendering rain sensor markers:', filteredRainSensors.length);
      return (
        <>
          {filteredRainSensors.map((sensor) => (
            <RainSensorMarker key={`rain-sensor-${sensor.id}`} sensor={sensor} />
          ))}
        </>
      );
    
    case 'wildfire':
      console.log('Rendering hotspot markers:', hotspots.length);
      return (
        <>
          {hotspots.map((hotspot, index) => (
            <HotspotMarker key={`hotspot-${index}`} hotspot={hotspot} />
          ))}
        </>
      );

    case 'airpollution':
      console.log('Rendering air station markers:', filteredAirStations.length);
      return (
        <>
          {filteredAirStations.map((station) => (
            <AirStationMarker key={`air-station-${station.id}`} station={station} />
          ))}
        </>
      );
    
    case 'drought':
    case 'flood':
      // These use WMS layers only, no individual markers
      return null;
    
    default:
      return null;
  }
};
