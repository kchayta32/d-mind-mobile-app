import React, { Suspense, useRef, useMemo } from 'react';
import Map, { NavigationControl, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Earthquake, RainSensor, AirPollutionData } from './types';
import { GISTDAHotspot } from './useGISTDAData';
import { RainViewerData } from './useRainViewerData';
import { MapLayers } from './map-components/MapLayers';
import { MapMarkers } from './map-components/MapMarkers';
import { MapControls } from './MapControls';
import { MapOverlays } from './MapOverlays';
import { DebugInfo } from './DebugInfo';
import { DisasterType } from './types';
import { FloodDataPoint } from './hooks/useOpenMeteoFloodData';
import { FloodFeature } from './hooks/useGISTDAFloodData';
import { SinkholeData } from '../../hooks/useSinkholeData';
import { UserLocationMarker } from './UserLocationMarker';
import { LocationControls } from './LocationControls';
import { getMapStyle } from './maplibre/mapStyles';

interface MapViewProps {
  earthquakes: Earthquake[];
  rainSensors: RainSensor[];
  hotspots: GISTDAHotspot[];
  airStations: AirPollutionData[];
  rainData: RainViewerData | null;
  gistdaFloodFeatures: FloodFeature[];
  floodDataPoints: FloodDataPoint[];
  sinkholes: SinkholeData[];
  selectedType: DisasterType;
  magnitudeFilter: number;
  humidityFilter: number;
  pm25Filter: number;
  droughtLayers: string[];
  floodTimeFilter: string;
  showFloodFrequency: boolean;
  wildfireTimeFilter: string;
  showBurnFreq: boolean;
  isLoading: boolean;
  onLocationSelect?: (lat: number, lon: number, name: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  earthquakes,
  rainSensors,
  hotspots,
  airStations,
  rainData,
  gistdaFloodFeatures,
  floodDataPoints,
  sinkholes,
  selectedType,
  magnitudeFilter,
  humidityFilter,
  pm25Filter,
  droughtLayers,
  floodTimeFilter,
  showFloodFrequency,
  wildfireTimeFilter,
  showBurnFreq,
  isLoading,
  onLocationSelect
}) => {
  const [rainOverlayType, setRainOverlayType] = React.useState<'radar' | 'satellite'>('radar');
  const [rainTimeType, setRainTimeType] = React.useState<'past' | 'future'>('past');
  const [showRainOverlay, setShowRainOverlay] = React.useState(false);
  const [showUserLocation, setShowUserLocation] = React.useState(false);
  const mapRef = useRef<MapRef>(null);

  // Filter data based on current filters
  const filteredEarthquakes = useMemo(() =>
    earthquakes.filter(eq => eq.magnitude >= magnitudeFilter),
    [earthquakes, magnitudeFilter]
  );

  const filteredRainSensors = useMemo(() =>
    rainSensors.filter(sensor => (sensor.humidity || 0) >= humidityFilter),
    [rainSensors, humidityFilter]
  );

  const filteredAirStations = useMemo(() =>
    airStations.filter(station => (station.pm25 || 0) >= pm25Filter),
    [airStations, pm25Filter]
  );

  // Thailand center coordinates
  const initialViewState = {
    longitude: 100.5018,
    latitude: 13.7563,
    zoom: 6,
    pitch: 0,
    bearing: 0
  };

  return (
    <div className="relative h-full w-full z-0">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={initialViewState}
        style={{ height: '100%', width: '100%' }}
        mapStyle={getMapStyle() as any}
        minZoom={4}
        maxZoom={18}
        maxPitch={85}
      >
        {/* Navigation Control with pitch/bearing */}
        <NavigationControl position="top-right" visualizePitch={true} showCompass={true} />

        {/* User Location Marker */}
        <UserLocationMarker showLocation={showUserLocation} />

        {/* Map Layers (WMS, Rain Overlay, etc.) */}
        <MapLayers
          selectedType={selectedType}
          droughtLayers={droughtLayers}
          floodTimeFilter={floodTimeFilter}
          showFloodFrequency={showFloodFrequency}
          showRainOverlay={showRainOverlay}
          rainData={rainData}
          rainOverlayType={rainOverlayType}
          rainTimeType={rainTimeType}
          wildfireTimeFilter={wildfireTimeFilter}
          showBurnFreq={showBurnFreq}
        />

        {/* Map Markers */}
        {!isLoading && (
          <MapMarkers
            selectedType={selectedType}
            filteredEarthquakes={filteredEarthquakes}
            filteredRainSensors={filteredRainSensors}
            hotspots={hotspots}
            filteredAirStations={filteredAirStations}
            gistdaFloodFeatures={gistdaFloodFeatures}
            floodDataPoints={floodDataPoints}
            sinkholes={sinkholes}
          />
        )}
      </Map>

      {/* Location Controls */}
      <div className="absolute top-20 right-4 z-[1000] flex flex-col gap-2">
        <LocationControls
          showUserLocation={showUserLocation}
          onToggleLocation={setShowUserLocation}
        />
      </div>

      {/* Rain controls for heavy rain type */}
      {selectedType === 'heavyrain' && (
        <div className="absolute top-32 right-4 z-[1000]">
          <MapControls
            rainData={rainData}
            showRainOverlay={showRainOverlay}
            setShowRainOverlay={setShowRainOverlay}
            rainOverlayType={rainOverlayType}
            setRainOverlayType={setRainOverlayType}
            rainTimeType={rainTimeType}
            setRainTimeType={setRainTimeType}
          />
        </div>
      )}

      {/* Overlays for loading */}
      <MapOverlays selectedType={selectedType} isLoading={isLoading} />

      {/* Debug information - Hidden on mobile */}
      <div className="hidden lg:block">
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
    </div>
  );
};
