import React, { useState } from 'react';
import { MapView } from './MapView';
import DisasterTypeSelector from './DisasterTypeSelector';
import FilterControls from './FilterControls';
import StatisticsPanel from './StatisticsPanel';
import WildfireCharts from './WildfireCharts';
import AirPollutionCharts from './AirPollutionCharts';
import DroughtCharts from './DroughtCharts';
import FloodCharts from './FloodCharts';
import { useEarthquakeData } from './useEarthquakeData';
import { useRainSensorData } from './useRainSensorData';
import { useGISTDAData } from './useGISTDAData';
import { useAirPollutionData } from './useAirPollutionData';
import { useRainViewerData } from './useRainViewerData';
import { useDroughtData } from './hooks/useDroughtData';
import { useFloodStatistics } from './hooks/useFloodData';
import { useOpenMeteoFloodData } from './hooks/useOpenMeteoFloodData';
import { useOpenMeteoRainData } from './hooks/useOpenMeteoRainData';

export type DisasterType = 'earthquake' | 'heavyrain' | 'openmeteorain' | 'wildfire' | 'airpollution' | 'drought' | 'flood' | 'storm';

const DisasterMap: React.FC = () => {
  const [selectedType, setSelectedType] = useState<DisasterType>('wildfire');
  const [magnitudeFilter, setMagnitudeFilter] = useState(1.0);
  const [humidityFilter, setHumidityFilter] = useState(0);
  const [rainTimeFilter, setRainTimeFilter] = useState('realtime');
  const [pm25Filter, setPm25Filter] = useState(0);
  const [wildfireTimeFilter, setWildfireTimeFilter] = useState('3days');
  const [droughtLayers, setDroughtLayers] = useState(['dri']);
  const [floodTimeFilter, setFloodTimeFilter] = useState('7days');
  const [showFloodFrequency, setShowFloodFrequency] = useState(true);

  // Data hooks - now including Open-Meteo rain data
  const { earthquakes, stats: earthquakeStats, isLoading: isLoadingEarthquakes } = useEarthquakeData();
  const { sensors: rainSensors, stats: rainStats, isLoading: isLoadingRain } = useRainSensorData(rainTimeFilter);
  const { hotspots, stats: wildfireStats, isLoading: isLoadingWildfire } = useGISTDAData(wildfireTimeFilter as any);
  const { stations: airStations, stats: airStats, isLoading: isLoadingAir } = useAirPollutionData();
  const { rainData, isLoading: isLoadingRainViewer } = useRainViewerData();
  const { stats: droughtStats, isLoading: isLoadingDrought } = useDroughtData();
  const { data: floodStats, isLoading: isLoadingFlood } = useFloodStatistics();
  const { data: floodDataPoints, isLoading: isLoadingOpenMeteoFlood } = useOpenMeteoFloodData();
  const { data: openMeteoRainData, isLoading: isLoadingOpenMeteoRain } = useOpenMeteoRainData();

  // Enhanced rain stats with RainViewer data
  const enhancedRainStats = rainData ? {
    ...rainStats,
    rainViewer: {
      lastUpdated: new Date().toISOString(),
      totalFrames: (rainData.radar?.past?.length || 0) + (rainData.radar?.nowcast?.length || 0),
      pastFrames: rainData.radar?.past?.length || 0,
      futureFrames: rainData.radar?.nowcast?.length || 0
    }
  } : rainStats;

  // Get current stats and loading state
  const getCurrentStats = () => {
    switch (selectedType) {
      case 'earthquake': return earthquakeStats;
      case 'heavyrain': return enhancedRainStats;
      case 'openmeteorain': return {
        totalStations: openMeteoRainData?.length || 0,
        activeRainStations: openMeteoRainData?.filter(d => d.weatherData.current.rain > 0).length || 0,
        maxRainfall: Math.max(...(openMeteoRainData?.map(d => d.weatherData.current.rain) || [0])),
        avgTemperature: openMeteoRainData?.reduce((sum, d) => sum + d.weatherData.current.temperature2m, 0) / (openMeteoRainData?.length || 1) || 0,
        lastUpdated: openMeteoRainData?.[0]?.weatherData.current.time.toISOString() || new Date().toISOString()
      };
      case 'wildfire': return wildfireStats;
      case 'airpollution': return airStats;
      case 'drought': return droughtStats;
      case 'flood': return floodStats;
      default: return null;
    }
  };

  const getCurrentLoading = () => {
    switch (selectedType) {
      case 'earthquake': return isLoadingEarthquakes;
      case 'heavyrain': return isLoadingRain || isLoadingRainViewer;
      case 'openmeteorain': return isLoadingOpenMeteoRain;
      case 'wildfire': return isLoadingWildfire;
      case 'airpollution': return isLoadingAir;
      case 'drought': return isLoadingDrought;
      case 'flood': return isLoadingFlood || isLoadingOpenMeteoFlood;
      default: return false;
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Type Selector */}
      <DisasterTypeSelector 
        selectedType={selectedType} 
        onTypeChange={setSelectedType}
      />
      
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Map */}
        <div className="lg:col-span-3 h-[500px] lg:h-full">
          <MapView
            earthquakes={earthquakes}
            rainSensors={rainSensors}
            hotspots={hotspots}
            airStations={airStations}
            rainData={rainData}
            floodDataPoints={floodDataPoints || []}
            openMeteoRainData={openMeteoRainData || []}
            selectedType={selectedType}
            magnitudeFilter={magnitudeFilter}
            humidityFilter={humidityFilter}
            pm25Filter={pm25Filter}
            droughtLayers={droughtLayers}
            floodTimeFilter={floodTimeFilter}
            showFloodFrequency={showFloodFrequency}
            isLoading={getCurrentLoading()}
          />
        </div>
        
        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-4 max-h-[600px] lg:max-h-full overflow-y-auto">
          {/* Filter Controls */}
          <FilterControls
            selectedType={selectedType}
            magnitudeFilter={magnitudeFilter}
            onMagnitudeChange={setMagnitudeFilter}
            humidityFilter={humidityFilter}
            onHumidityChange={setHumidityFilter}
            rainTimeFilter={rainTimeFilter}
            onRainTimeFilterChange={setRainTimeFilter}
            pm25Filter={pm25Filter}
            onPm25Change={setPm25Filter}
            wildfireTimeFilter={wildfireTimeFilter}
            onWildfireTimeFilterChange={setWildfireTimeFilter}
            droughtLayers={droughtLayers}
            onDroughtLayersChange={setDroughtLayers}
            floodTimeFilter={floodTimeFilter}
            onFloodTimeFilterChange={setFloodTimeFilter}
            showFloodFrequency={showFloodFrequency}
            onShowFloodFrequencyChange={setShowFloodFrequency}
          />
          
          {/* Statistics Panel */}
          <StatisticsPanel
            stats={getCurrentStats()}
            isLoading={getCurrentLoading()}
            disasterType={selectedType}
          />
          
          {/* Specific Charts for Wildfire */}
          {selectedType === 'wildfire' && (
            <WildfireCharts 
              hotspots={hotspots}
              stats={wildfireStats}
            />
          )}
          
          {/* Specific Charts for Air Pollution */}
          {selectedType === 'airpollution' && (
            <AirPollutionCharts 
              stations={airStations}
              stats={airStats}
            />
          )}

          {/* Specific Charts for Drought */}
          {selectedType === 'drought' && (
            <DroughtCharts 
              stats={droughtStats}
            />
          )}

          {/* Specific Charts for Flood */}
          {selectedType === 'flood' && (
            <FloodCharts 
              stats={floodStats}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterMap;
