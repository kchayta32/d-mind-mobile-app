import React, { Suspense, useRef, useMemo, useState } from 'react';
import Map, { NavigationControl, MapRef } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Earthquake, RainSensor, AirPollutionData, DisasterType } from './types';
import { GISTDAHotspot } from './useGISTDAData';
import { RainViewerData } from './useRainViewerData';
import { MapLayers } from './map-components/MapLayers';
import { MapMarkers } from './map-components/MapMarkers';
import { MapControls } from './MapControls';
import { MapOverlays } from './MapOverlays';
import { DebugInfo } from './DebugInfo';
import { RadarTimelinePlayer } from './RadarTimelinePlayer';
import { FloodDataPoint } from './hooks/useOpenMeteoFloodData';
import { FloodFeature } from './hooks/useGISTDAFloodData';
import { WaterHyacinthFeature } from '@/services/gistda/types';
import { SinkholeData } from '../../hooks/useSinkholeData';
import { UserLocationMarker } from './UserLocationMarker';
import { LocationControls } from './LocationControls';
import { MapLayerController } from './MapLayerController';
import { getMapStyle } from './maplibre/mapStyles';
import { useTheme } from '@/contexts/ThemeContext';

interface MapViewProps {
  earthquakes: Earthquake[];
  rainSensors: RainSensor[];
  hotspots: GISTDAHotspot[];
  airStations: AirPollutionData[];
  rainData: RainViewerData | null;
  gistdaFloodFeatures: FloodFeature[];
  waterHyacinthFeatures?: WaterHyacinthFeature[];
  floodDataPoints: FloodDataPoint[];
  sinkholes: SinkholeData[];
  selectedType: DisasterType;
  onTypeChange?: (type: DisasterType) => void;
  magnitudeFilter: number;
  humidityFilter: number;
  pm25Filter: number;
  droughtLayers: string[];
  setDroughtLayers?: (layers: string[]) => void;
  floodTimeFilter: string;
  setFloodTimeFilter?: (filter: '1day' | '3days' | '7days' | '30days') => void;
  showFloodFrequency: boolean;
  setShowFloodFrequency?: (show: boolean) => void;
  showWaterHyacinth?: boolean;
  setShowWaterHyacinth?: (show: boolean) => void;
  wildfireTimeFilter: string;
  setWildfireTimeFilter?: (filter: '1day' | '3days' | '7days' | '30days') => void;
  showBurnFreq: boolean;
  setShowBurnFreq?: (show: boolean) => void;
  showBurnScar?: boolean;
  setShowBurnScar?: (show: boolean) => void;
  tileFormat?: 'wmts' | 'tms';
  setTileFormat?: (format: 'wmts' | 'tms') => void;
  layerOpacity?: number;
  setLayerOpacity?: (opacity: number) => void;
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
  waterHyacinthFeatures = [],
  floodDataPoints,
  sinkholes,
  selectedType,
  onTypeChange,
  magnitudeFilter,
  humidityFilter,
  pm25Filter,
  droughtLayers,
  setDroughtLayers,
  floodTimeFilter,
  setFloodTimeFilter,
  showFloodFrequency,
  setShowFloodFrequency,
  showWaterHyacinth = false,
  setShowWaterHyacinth,
  wildfireTimeFilter,
  setWildfireTimeFilter,
  showBurnFreq,
  setShowBurnFreq,
  showBurnScar = false,
  setShowBurnScar,
  tileFormat = 'tms',
  setTileFormat,
  layerOpacity = 0.7,
  setLayerOpacity,
  isLoading,
  onLocationSelect
}) => {
  const { isDark } = useTheme();
  const [rainOverlayType, setRainOverlayType] = useState<'radar' | 'satellite'>('radar');
  const [rainTimeType, setRainTimeType] = useState<'past' | 'future'>('past');
  const [showRainOverlay, setShowRainOverlay] = useState(false);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const mapRef = useRef<MapRef>(null);

  // Local state fallbacks if setters are not provided
  const [localFloodTime, setLocalFloodTime] = useState<'1day' | '3days' | '7days' | '30days'>('3days');
  const [localFloodFreq, setLocalFloodFreq] = useState(true);
  const [localWaterHyacinth, setLocalWaterHyacinth] = useState(false);
  const [localWildfireTime, setLocalWildfireTime] = useState<'1day' | '3days' | '7days' | '30days'>('1day');
  const [localBurnFreq, setLocalBurnFreq] = useState(false);
  const [localBurnScar, setLocalBurnScar] = useState(false);
  const [localDroughtLayers, setLocalDroughtLayers] = useState<string[]>(['dri']);
  const [localTileFormat, setLocalTileFormat] = useState<'wmts' | 'tms'>('tms');
  const [localLayerOpacity, setLocalLayerOpacity] = useState(0.7);

  const activeFloodTime = (floodTimeFilter || localFloodTime) as any;
  const activeSetFloodTime = setFloodTimeFilter || setLocalFloodTime;
  const activeFloodFreq = showFloodFrequency ?? localFloodFreq;
  const activeSetFloodFreq = setShowFloodFrequency || setLocalFloodFreq;
  const activeWaterHyacinth = showWaterHyacinth ?? localWaterHyacinth;
  const activeSetWaterHyacinth = setShowWaterHyacinth || setLocalWaterHyacinth;

  const activeWildfireTime = (wildfireTimeFilter || localWildfireTime) as any;
  const activeSetWildfireTime = setWildfireTimeFilter || setLocalWildfireTime;
  const activeBurnFreq = showBurnFreq ?? localBurnFreq;
  const activeSetBurnFreq = setShowBurnFreq || setLocalBurnFreq;
  const activeBurnScar = showBurnScar ?? localBurnScar;
  const activeSetBurnScar = setShowBurnScar || setLocalBurnScar;

  const activeDroughtLayers = droughtLayers || localDroughtLayers;
  const activeSetDroughtLayers = setDroughtLayers || setLocalDroughtLayers;

  const activeTileFormat = tileFormat || localTileFormat;
  const activeSetTileFormat = setTileFormat || setLocalTileFormat;

  const activeOpacity = layerOpacity ?? localLayerOpacity;
  const activeSetOpacity = setLayerOpacity || setLocalLayerOpacity;

  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Get active frames count for rain overlay timer
  const rainFramesCount = useMemo(() => {
    if (!rainData) return 0;
    let frames: any[] = [];
    if (rainOverlayType === 'radar') {
      frames = rainTimeType === 'past' ? rainData.radar?.past || [] : rainData.radar?.nowcast || [];
    } else {
      frames = rainData.satellite?.infrared || [];
    }
    return frames.length;
  }, [rainData, rainOverlayType, rainTimeType]);

  React.useEffect(() => {
    if (!showRainOverlay || !isPlaying || rainFramesCount <= 1) {
      return;
    }
    const delay = playbackSpeed === 4 ? 400 : playbackSpeed === 2 ? 800 : 1500;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % rainFramesCount);
    }, delay);

    return () => clearInterval(interval);
  }, [showRainOverlay, isPlaying, rainFramesCount, playbackSpeed]);

  React.useEffect(() => {
    setCurrentFrameIndex(0);
  }, [rainOverlayType, rainTimeType]);

  React.useEffect(() => {
    if (!showRainOverlay) {
      setIsPlaying(false);
      setCurrentFrameIndex(0);
    }
  }, [showRainOverlay]);

  // Filter data based on current filters
  const filteredEarthquakes = useMemo(
    () => earthquakes.filter((eq) => eq.magnitude >= magnitudeFilter),
    [earthquakes, magnitudeFilter]
  );

  const filteredRainSensors = useMemo(
    () => rainSensors.filter((sensor) => (sensor.humidity || 0) >= humidityFilter),
    [rainSensors, humidityFilter]
  );

  const filteredAirStations = useMemo(
    () => airStations.filter((station) => (station.pm25 || 0) >= pm25Filter),
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
    <div className="relative h-full w-full z-0 overflow-hidden">
      {/* Floating Modern GIS Layer Controller */}
      {onTypeChange && (
        <MapLayerController
          selectedType={selectedType}
          onTypeChange={onTypeChange}
          floodTimeFilter={activeFloodTime}
          setFloodTimeFilter={activeSetFloodTime}
          showFloodFrequency={activeFloodFreq}
          setShowFloodFrequency={activeSetFloodFreq}
          showWaterHyacinth={activeWaterHyacinth}
          setShowWaterHyacinth={activeSetWaterHyacinth}
          wildfireTimeFilter={activeWildfireTime}
          setWildfireTimeFilter={activeSetWildfireTime}
          showBurnFreq={activeBurnFreq}
          setShowBurnFreq={activeSetBurnFreq}
          showBurnScar={activeBurnScar}
          setShowBurnScar={activeSetBurnScar}
          droughtLayers={activeDroughtLayers}
          setDroughtLayers={activeSetDroughtLayers}
          tileFormat={activeTileFormat}
          setTileFormat={activeSetTileFormat}
          layerOpacity={activeOpacity}
          setLayerOpacity={activeSetOpacity}
        />
      )}

      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={initialViewState}
        style={{ height: '100%', width: '100%' }}
        mapStyle={getMapStyle(isDark) as any}
        minZoom={4}
        maxZoom={18}
        maxPitch={85}
      >
        {/* Navigation Control with pitch/bearing */}
        <NavigationControl position="top-right" visualizePitch={true} showCompass={true} />

        {/* User Location Marker */}
        <UserLocationMarker showLocation={showUserLocation} />

        {/* Map Layers (WMS/WMTS/TMS, Rain Overlay, etc.) */}
        <MapLayers
          selectedType={selectedType}
          droughtLayers={activeDroughtLayers}
          floodTimeFilter={activeFloodTime}
          showFloodFrequency={activeFloodFreq}
          showRainOverlay={showRainOverlay}
          rainData={rainData}
          rainOverlayType={rainOverlayType}
          rainTimeType={rainTimeType}
          currentFrameIndex={currentFrameIndex}
          wildfireTimeFilter={activeWildfireTime}
          showBurnFreq={activeBurnFreq}
          showBurnScar={activeBurnScar}
          tileFormat={activeTileFormat}
          layerOpacity={activeOpacity}
        />

        {/* High-performance GPU-clustered & Vector Map Markers */}
        {!isLoading && (
          <MapMarkers
            selectedType={selectedType}
            filteredEarthquakes={filteredEarthquakes}
            filteredRainSensors={filteredRainSensors}
            hotspots={hotspots}
            filteredAirStations={filteredAirStations}
            gistdaFloodFeatures={gistdaFloodFeatures}
            waterHyacinthFeatures={waterHyacinthFeatures}
            showWaterHyacinth={activeWaterHyacinth}
            floodDataPoints={floodDataPoints}
            sinkholes={sinkholes}
          />
        )}
      </Map>

      {/* Location Controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        <LocationControls
          showUserLocation={showUserLocation}
          onToggleLocation={setShowUserLocation}
        />
      </div>

      {/* Rain controls for heavy rain type */}
      {selectedType === 'heavyrain' && (
        <div className="absolute top-32 right-4 z-20">
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

      {/* Radar Timeline Player */}
      {selectedType === 'heavyrain' && showRainOverlay && (
        <RadarTimelinePlayer
          rainData={rainData}
          currentFrameIndex={currentFrameIndex}
          setCurrentFrameIndex={setCurrentFrameIndex}
          rainOverlayType={rainOverlayType}
          rainTimeType={rainTimeType}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
        />
      )}

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

export default React.memo(MapView);
