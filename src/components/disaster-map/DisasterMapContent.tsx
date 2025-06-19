
import React from 'react';
import { MapView } from './MapView';
import FilterControls from './FilterControls';
import StatisticsPanel from './StatisticsPanel';
import WildfireCharts from './WildfireCharts';
import AirPollutionCharts from './AirPollutionCharts';
import DroughtCharts from './DroughtCharts';
import FloodCharts from './FloodCharts';
import { DisasterType } from './DisasterMap';
import { useDisasterMapState } from './hooks/useDisasterMapState';
import { useDisasterMapData } from './hooks/useDisasterMapData';

interface DisasterMapContentProps {
  selectedType: DisasterType;
  onTypeChange: (type: DisasterType) => void;
  onLocationSelect: (lat: number, lon: number, name: string) => void;
}

export const DisasterMapContent: React.FC<DisasterMapContentProps> = ({
  selectedType,
  onTypeChange,
  onLocationSelect
}) => {
  const {
    magnitudeFilter,
    setMagnitudeFilter,
    humidityFilter,
    setHumidityFilter,
    rainTimeFilter,
    setRainTimeFilter,
    pm25Filter,
    setPm25Filter,
    wildfireTimeFilter,
    setWildfireTimeFilter,
    droughtLayers,
    setDroughtLayers,
    floodTimeFilter,
    setFloodTimeFilter,
    showFloodFrequency,
    setShowFloodFrequency,
  } = useDisasterMapState();

  const {
    earthquakes,
    rainSensors,
    hotspots,
    airStations,
    rainData,
    floodDataPoints,
    openMeteoRainData,
    wildfireStats,
    airStats,
    droughtStats,
    floodStats,
    getCurrentStats,
    getCurrentLoading,
  } = useDisasterMapData(rainTimeFilter, wildfireTimeFilter);

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Map */}
      <div className="lg:col-span-3 h-[400px] md:h-[500px] lg:h-full">
        <MapView
          earthquakes={earthquakes}
          rainSensors={rainSensors}
          hotspots={hotspots}
          airStations={airStations}
          rainData={rainData}
          floodDataPoints={floodDataPoints}
          openMeteoRainData={openMeteoRainData}
          selectedType={selectedType}
          magnitudeFilter={magnitudeFilter}
          humidityFilter={humidityFilter}
          pm25Filter={pm25Filter}
          droughtLayers={droughtLayers}
          floodTimeFilter={floodTimeFilter}
          showFloodFrequency={showFloodFrequency}
          isLoading={getCurrentLoading(selectedType)}
          onLocationSelect={onLocationSelect}
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
          stats={getCurrentStats(selectedType)}
          isLoading={getCurrentLoading(selectedType)}
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
  );
};
