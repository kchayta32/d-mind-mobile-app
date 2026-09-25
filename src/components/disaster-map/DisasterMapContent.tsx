import React, { Suspense } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOptimizedControls } from './MobileOptimizedControls';
import FilterControls from './FilterControls';
import StatisticsPanel from './StatisticsPanel';
import WildfireCharts from './WildfireCharts';
import AirPollutionCharts from './AirPollutionCharts';
import DroughtCharts from './DroughtCharts';
import FloodCharts from './FloodCharts';
import SinkholeNews from './SinkholeNews';
import { DisasterType } from './types';
import { useDisasterMapState } from './hooks/useDisasterMapState';
import { useDisasterMapData } from './hooks/useDisasterMapData';
import { useSinkholeData } from '../../hooks/useSinkholeData';

// Lazy load MapView to code-split maplibre-gl (reduces initial bundle by ~1MB)
const MapView = React.lazy(() => import('./MapView').then(m => ({ default: m.MapView })));

// Loading fallback for the map
const MapLoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">กำลังโหลดแผนที่...</span>
    </div>
  </div>
);

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
  const isMobile = useIsMobile();
  // ... (hooks)
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
    showBurnFreq,
    setShowBurnFreq,
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
    gistdaFloodFeatures,
    floodDataPoints,

    wildfireStats,
    airStats,
    droughtStats,
    floodStats,
    getCurrentStats,
    getCurrentLoading,
  } = useDisasterMapData(rainTimeFilter, wildfireTimeFilter, floodTimeFilter);

  const { sinkholes, stats: sinkholeStats } = useSinkholeData();

  // คำนวณจำนวนรายการที่ตรงตามตัวกรองปัจจุบันแบบไดนามิก
  const currentMatchCount = React.useMemo(() => {
    switch (selectedType) {
      case 'earthquake':
        return earthquakes.filter((e) => e.magnitude >= magnitudeFilter).length;
      case 'heavyrain':
        return rainSensors.filter((r) => (r.humidity ?? 0) >= humidityFilter).length;
      case 'wildfire':
        return hotspots.length;
      case 'airpollution':
        return airStations.filter((s) => (s.pm25 ?? 0) >= pm25Filter).length;
      case 'flood':
        return gistdaFloodFeatures.length + floodDataPoints.length;
      case 'sinkhole':
        return sinkholes.length;
      default:
        return 0;
    }
  }, [
    selectedType,
    earthquakes,
    magnitudeFilter,
    rainSensors,
    humidityFilter,
    hotspots,
    airStations,
    pm25Filter,
    gistdaFloodFeatures,
    floodDataPoints,
    sinkholes,
  ]);

  const handleResetFilters = React.useCallback(() => {
    setMagnitudeFilter(1.0);
    setHumidityFilter(0);
    setRainTimeFilter('realtime');
    setPm25Filter(0);
    setWildfireTimeFilter('3days');
    setShowBurnFreq(false);
    setDroughtLayers(['dri']);
    setFloodTimeFilter('3days');
    setShowFloodFrequency(true);
  }, [
    setMagnitudeFilter,
    setHumidityFilter,
    setRainTimeFilter,
    setPm25Filter,
    setWildfireTimeFilter,
    setShowBurnFreq,
    setDroughtLayers,
    setFloodTimeFilter,
    setShowFloodFrequency,
  ]);

  // Define content for Mobile Drawer (Split into Tabs)
  const FilterContent = () => (
    <div className="space-y-4">
      <FilterControls
        selectedType={selectedType}
        onTypeChange={onTypeChange}
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
        showBurnFreq={showBurnFreq}
        onShowBurnFreqChange={setShowBurnFreq}
        droughtLayers={droughtLayers}
        onDroughtLayersChange={setDroughtLayers}
        floodTimeFilter={floodTimeFilter}
        onFloodTimeFilterChange={setFloodTimeFilter}
        showFloodFrequency={showFloodFrequency}
        onShowFloodFrequencyChange={setShowFloodFrequency}
        onResetFilters={handleResetFilters}
        matchCount={currentMatchCount}
      />
    </div>
  );

  const StatsContent = () => (
    <div className="space-y-4">
      {/* Statistics Panel */}
      <StatisticsPanel
        stats={selectedType === 'sinkhole' ? sinkholeStats : getCurrentStats(selectedType)}
        isLoading={getCurrentLoading(selectedType)}
        disasterType={selectedType}
      />

      {/* Specific Charts for Wildfire */}
      {selectedType === 'wildfire' && wildfireStats && (
        <WildfireCharts
          hotspots={hotspots}
          stats={wildfireStats}
        />
      )}

      {/* Specific Charts for Air Pollution */}
      {selectedType === 'airpollution' && airStats && (
        <AirPollutionCharts
          stations={airStations}
          stats={airStats}
        />
      )}

      {/* Specific Charts for Drought */}
      {selectedType === 'drought' && droughtStats && (
        <DroughtCharts
          stats={droughtStats}
        />
      )}

      {/* Specific Charts for Flood */}
      {selectedType === 'flood' && floodStats && (
        <FloodCharts
          stats={floodStats}
        />
      )}

      {/* Sinkhole News Section */}
      {selectedType === 'sinkhole' && (
        <SinkholeNews />
      )}
    </div>
  );

  // Desktop Sidebar (Still uses both)
  const SidebarContent = () => (
    <div className="space-y-6">
      <FilterControls
        selectedType={selectedType}
        onTypeChange={onTypeChange}
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
        showBurnFreq={showBurnFreq}
        onShowBurnFreqChange={setShowBurnFreq}
        droughtLayers={droughtLayers}
        onDroughtLayersChange={setDroughtLayers}
        floodTimeFilter={floodTimeFilter}
        onFloodTimeFilterChange={setFloodTimeFilter}
        showFloodFrequency={showFloodFrequency}
        onShowFloodFrequencyChange={setShowFloodFrequency}
        onResetFilters={handleResetFilters}
        matchCount={currentMatchCount}
      />
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          สถิติ
        </h3>
        <StatsContent />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="relative h-full w-full flex flex-col">
        {/* Full Screen Map */}
        <div className="flex-1 w-full h-[100dvh] absolute inset-0 z-0">
          <Suspense fallback={<MapLoadingFallback />}>
            <MapView
              earthquakes={earthquakes}
              rainSensors={rainSensors}
              hotspots={hotspots}
              airStations={airStations}
              rainData={rainData}
              gistdaFloodFeatures={gistdaFloodFeatures}
              floodDataPoints={floodDataPoints}
              sinkholes={sinkholes}
              selectedType={selectedType}
              magnitudeFilter={magnitudeFilter}
              humidityFilter={humidityFilter}
              pm25Filter={pm25Filter}
              droughtLayers={droughtLayers}
              floodTimeFilter={floodTimeFilter}
              showFloodFrequency={showFloodFrequency}
              wildfireTimeFilter={wildfireTimeFilter}
              showBurnFreq={showBurnFreq}
              isLoading={getCurrentLoading(selectedType)}
              onLocationSelect={onLocationSelect}
            />
          </Suspense>
        </div>

        {/* Mobile Controls Drawer */}
        <MobileOptimizedControls
          selectedType={selectedType}
          onTypeChange={onTypeChange}
          filters={<FilterContent />}
          stats={<StatsContent />}
        />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Map */}
      <div className="lg:col-span-3 h-[400px] md:h-[500px] lg:h-full [&:has([data-state=open])]:pointer-events-none">
        <Suspense fallback={<MapLoadingFallback />}>
          <MapView
            earthquakes={earthquakes}
            rainSensors={rainSensors}
            hotspots={hotspots}
            airStations={airStations}
            rainData={rainData}
            gistdaFloodFeatures={gistdaFloodFeatures}
            floodDataPoints={floodDataPoints}
            sinkholes={sinkholes}
            selectedType={selectedType}
            magnitudeFilter={magnitudeFilter}
            humidityFilter={humidityFilter}
            pm25Filter={pm25Filter}
            droughtLayers={droughtLayers}
            floodTimeFilter={floodTimeFilter}
            showFloodFrequency={showFloodFrequency}
            wildfireTimeFilter={wildfireTimeFilter}
            showBurnFreq={showBurnFreq}
            isLoading={getCurrentLoading(selectedType)}
            onLocationSelect={onLocationSelect}
          />
        </Suspense>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-4 max-h-[600px] lg:max-h-full overflow-y-auto">
        <SidebarContent />
      </div>
    </div>
  );
};
