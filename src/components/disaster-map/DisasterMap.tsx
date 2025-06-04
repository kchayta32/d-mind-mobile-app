
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapView } from './MapView';
import { StatisticsPanel } from './StatisticsPanel';
import { FilterControls } from './FilterControls';
import DisasterTypeSelector from './DisasterTypeSelector';
import { useEarthquakeData } from './useEarthquakeData';
import { useRainSensorData } from './useRainSensorData';
import { RefreshCw } from 'lucide-react';

export type DisasterType = 'earthquake' | 'heavyrain' | 'flood' | 'wildfire' | 'storm';

const DisasterMap: React.FC = () => {
  const [selectedType, setSelectedType] = useState<DisasterType>('earthquake');
  const [magnitudeFilter, setMagnitudeFilter] = useState<number>(0);
  const [humidityFilter, setHumidityFilter] = useState<number>(0);

  // Data hooks
  const earthquakeData = useEarthquakeData();
  const rainSensorData = useRainSensorData();

  const handleRefresh = () => {
    if (selectedType === 'earthquake') {
      earthquakeData.fetchEarthquakeData();
    } else if (selectedType === 'heavyrain') {
      rainSensorData.refetch();
    }
  };

  const getCurrentData = () => {
    switch (selectedType) {
      case 'earthquake':
        return {
          data: earthquakeData.earthquakes,
          stats: earthquakeData.statistics,
          isLoading: earthquakeData.refreshing,
          error: earthquakeData.error
        };
      case 'heavyrain':
        return {
          data: rainSensorData.sensors,
          stats: rainSensorData.stats,
          isLoading: rainSensorData.isLoading,
          error: rainSensorData.error
        };
      default:
        return {
          data: [],
          stats: null,
          isLoading: false,
          error: null
        };
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">แผนที่ภัยพิบัติ</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={currentData.isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${currentData.isLoading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>
          </div>

          {/* Disaster Type Selector - Full width card */}
          <Card className="w-full">
            <DisasterTypeSelector 
              selectedType={selectedType} 
              onTypeChange={setSelectedType} 
            />
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Stats and Filters */}
          <div className="xl:col-span-1 space-y-6">
            {/* Statistics Panel */}
            <StatisticsPanel 
              stats={currentData.stats} 
              isLoading={currentData.isLoading}
              disasterType={selectedType}
            />
            
            {/* Filter Controls */}
            <FilterControls
              magnitudeFilter={magnitudeFilter}
              onMagnitudeChange={setMagnitudeFilter}
              humidityFilter={humidityFilter}
              onHumidityChange={setHumidityFilter}
              selectedType={selectedType}
            />
          </div>

          {/* Map Section - Takes remaining space */}
          <div className="xl:col-span-3">
            <Card className="h-[700px] xl:h-[800px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>
                    {selectedType === 'earthquake' && 'แผนที่แผ่นดินไหว'}
                    {selectedType === 'heavyrain' && 'แผนที่เซ็นเซอร์ฝน'}
                    {selectedType === 'flood' && 'แผนที่น้ำท่วม (เร็วๆ นี้)'}
                    {selectedType === 'wildfire' && 'แผนที่ไฟป่า (เร็วๆ นี้)'}
                    {selectedType === 'storm' && 'แผนที่พายุ (เร็วๆ นี้)'}
                  </span>
                  {currentData.isLoading && (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      กำลังโหลด...
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <MapView 
                  earthquakes={selectedType === 'earthquake' ? earthquakeData.earthquakes : []}
                  rainSensors={selectedType === 'heavyrain' ? rainSensorData.sensors : []}
                  selectedType={selectedType}
                  magnitudeFilter={magnitudeFilter}
                  humidityFilter={humidityFilter}
                  isLoading={currentData.isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error Display */}
        {currentData.error && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-700">
                เกิดข้อผิดพลาด: {currentData.error.message}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DisasterMap;
