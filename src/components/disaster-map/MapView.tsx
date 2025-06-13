
import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Earthquake, RainSensor, AirPollutionData } from './types';
import { GISTDAHotspot } from './useGISTDAData';
import { RainViewerData } from './useRainViewerData';
import { MapLayers } from './map-components/MapLayers';
import { MapMarkers } from './map-components/MapMarkers';
import { MapControls } from './MapControls';
import { MapOverlays } from './MapOverlays';
import { DebugInfo } from './DebugInfo';
import { DisasterType } from './DisasterMap';
import 'leaflet/dist/leaflet.css';
import { FloodDataPoint } from './hooks/useOpenMeteoFloodData';
import { OpenMeteoRainDataPoint } from './hooks/useOpenMeteoRainData';
import { UserLocationMarker } from './UserLocationMarker';
import { LocationControls } from './LocationControls';

interface MapViewProps {
  earthquakes: Earthquake[];
  rainSensors: RainSensor[];
  hotspots: GISTDAHotspot[];
  airStations: AirPollutionData[];
  rainData: RainViewerData | null;
  floodDataPoints: FloodDataPoint[];
  openMeteoRainData: OpenMeteoRainDataPoint[];
  selectedType: DisasterType;
  magnitudeFilter: number;
  humidityFilter: number;
  pm25Filter: number;
  droughtLayers: string[];
  floodTimeFilter: string;
  showFloodFrequency: boolean;
  isLoading: boolean;
}

export const MapView: React.FC<MapViewProps> = ({ 
  earthquakes, 
  rainSensors,
  hotspots,
  airStations,
  rainData,
  floodDataPoints,
  openMeteoRainData,
  selectedType,
  magnitudeFilter,
  humidityFilter,
  pm25Filter,
  droughtLayers,
  floodTimeFilter,
  showFloodFrequency,
  isLoading 
}) => {
  const [rainOverlayType, setRainOverlayType] = useState<'radar' | 'satellite'>('radar');
  const [rainTimeType, setRainTimeType] = useState<'past' | 'future'>('past');
  const [showRainOverlay, setShowRainOverlay] = useState(false);
  const [showModisWMS, setShowModisWMS] = useState(true);
  const [showViirsWMS, setShowViirsWMS] = useState(true);
  const [showBurnScar, setShowBurnScar] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);

  console.log('MapView props:', { 
    earthquakes: earthquakes.length, 
    rainSensors: rainSensors.length,
    hotspots: hotspots.length,
    airStations: airStations.length,
    rainData: rainData ? 'loaded' : 'null',
    floodDataPoints: floodDataPoints.length,
    openMeteoRainData: openMeteoRainData.length,
    selectedType, 
    droughtLayers,
    floodTimeFilter,
    showFloodFrequency,
    isLoading 
  });

  // Filter data based on current filters
  const filteredEarthquakes = earthquakes.filter(eq => eq.magnitude >= magnitudeFilter);
  const filteredRainSensors = rainSensors.filter(sensor => 
    (sensor.humidity || 0) >= humidityFilter
  );
  const filteredAirStations = airStations.filter(station =>
    (station.pm25 || 0) >= pm25Filter
  );

  console.log('Filtered data:', { 
    filteredEarthquakes: filteredEarthquakes.length, 
    filteredRainSensors: filteredRainSensors.length,
    filteredAirStations: filteredAirStations.length,
    hotspots: hotspots.length,
    openMeteoRainData: openMeteoRainData.length
  });

  // Thailand center coordinates
  const center: [number, number] = [13.7563, 100.5018];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        <UserLocationMarker showLocation={showUserLocation} />
        
        <MapLayers
          selectedType={selectedType}
          droughtLayers={droughtLayers}
          floodTimeFilter={floodTimeFilter}
          showFloodFrequency={showFloodFrequency}
          showRainOverlay={showRainOverlay}
          rainData={rainData}
          rainOverlayType={rainOverlayType}
          rainTimeType={rainTimeType}
          showModisWMS={showModisWMS}
          showViirsWMS={showViirsWMS}
          showBurnScar={showBurnScar}
        />
        
        {!isLoading && (
          <MapMarkers
            selectedType={selectedType}
            filteredEarthquakes={filteredEarthquakes}
            filteredRainSensors={filteredRainSensors}
            hotspots={hotspots}
            filteredAirStations={filteredAirStations}
            floodDataPoints={floodDataPoints}
            openMeteoRainData={openMeteoRainData}
          />
        )}
      </MapContainer>
      
      {/* Location Controls */}
      <LocationControls
        showUserLocation={showUserLocation}
        onToggleLocation={setShowUserLocation}
      />
      
      {/* Rain controls for heavy rain type */}
      {selectedType === 'heavyrain' && (
        <MapControls
          rainData={rainData}
          showRainOverlay={showRainOverlay}
          setShowRainOverlay={setShowRainOverlay}
          rainOverlayType={rainOverlayType}
          setRainOverlayType={setRainOverlayType}
          rainTimeType={rainTimeType}
          setRainTimeType={setRainTimeType}
        />
      )}
      
      {/* Overlays for loading only (removed coming soon for flood) */}
      <MapOverlays selectedType={selectedType} isLoading={isLoading} />
      
      {/* Debug information */}
      <DebugInfo
        selectedType={selectedType}
        isLoading={isLoading}
        rainSensors={rainSensors}
        filteredRainSensors={filteredRainSensors}
        humidityFilter={humidityFilter}
        rainData={rainData}
        hotspots={hotspots}
        airStations={airStations}
        filteredAirStations={filteredAirStations}
        pm25Filter={pm25Filter}
      />
    </div>
  );
};
