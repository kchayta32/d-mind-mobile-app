
import React, { useState } from 'react';
import { MapView } from './MapView';
import DisasterTypeSelector from './DisasterTypeSelector';
import FilterControls from './FilterControls';
import StatisticsPanel from './StatisticsPanel';
import WildfireCharts from './WildfireCharts';
import AirPollutionCharts from './AirPollutionCharts';
import DroughtCharts from './DroughtCharts';
import { useEarthquakeData } from './useEarthquakeData';
import { useRainSensorData } from './useRainSensorData';
import { useGISTDAData } from './useGISTDAData';
import { useAirPollutionData } from './useAirPollutionData';
import { useRainViewerData } from './useRainViewerData';
import { useDroughtData } from './hooks/useDroughtData';

export type DisasterType = 'earthquake' | 'heavyrain' | 'wildfire' | 'airpollution' | 'drought' | 'flood' | 'storm';

const DisasterMap: React.FC = () => {
  const [selectedType, setSelectedType] = useState<DisasterType>('wildfire');
  const [magnitudeFilter, setMagnitudeFilter] = useState(1.0);
  const [humidityFilter, setHumidityFilter] = useState(0);
  const [pm25Filter, setPm25Filter] = useState(0);
  const [wildfireTimeFilter, setWildfireTimeFilter] = useState('3days');

  // Data hooks - now passing timeFilter for wildfire data
  const { earthquakes, stats: earthquakeStats, isLoading: isLoadingEarthquakes } = useEarthquakeData();
  const { sensors: rainSensors, stats: rainStats, isLoading: isLoadingRain } = useRainSensorData();
  const { hotspots, stats: wildfireStats, isLoading: isLoadingWildfire } = useGISTDAData(wildfireTimeFilter as any);
  const { stations: airStations, stats: airStats, isLoading: isLoadingAir } = useAirPollutionData();
  const { rainData, isLoading: isLoadingRainViewer } = useRainViewerData();
  const { stats: droughtStats, isLoading: isLoadingDrought } = useDroughtData();

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
      case 'wildfire': return wildfireStats;
      case 'airpollution': return airStats;
      case 'drought': return droughtStats;
      default: return null;
    }
  };

  const getCurrentLoading = () => {
    switch (selectedType) {
      case 'earthquake': return isLoadingEarthquakes;
      case 'heavyrain': return isLoadingRain || isLoadingRainViewer;
      case 'wildfire': return isLoadingWildfire;
      case 'airpollution': return isLoadingAir;
      case 'drought': return isLoadingDrought;
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
            selectedType={selectedType}
            magnitudeFilter={magnitudeFilter}
            humidityFilter={humidityFilter}
            pm25Filter={pm25Filter}
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
            pm25Filter={pm25Filter}
            onPm25Change={setPm25Filter}
            wildfireTimeFilter={wildfireTimeFilter}
            onWildfireTimeFilterChange={setWildfireTimeFilter}
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
        </div>
      </div>
    </div>
  );
};

export default DisasterMap;
