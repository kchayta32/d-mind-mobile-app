
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

  const getErrorMessage = (error: string | Error | null): string => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    return error.message || 'Unknown error occurred';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="sticky top-0 bg-white shadow-sm z-10 p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold text-gray-800">แผนที่ภัยพิบัติ</h1>
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

          {/* Disaster Type Selector */}
          <Card className="w-full">
            <DisasterTypeSelector 
              selectedType={selectedType} 
              onTypeChange={setSelectedType} 
            />
          </Card>
        </div>

        {/* Main Content - Vertical Stack Layout */}
        <div className="flex flex-col space-y-4 p-4">
          {/* Statistics and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Map Section - Full Width */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
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
            <CardContent className="p-0">
              <div className="h-[500px] md:h-[600px]">
                <MapView 
                  earthquakes={selectedType === 'earthquake' ? earthquakeData.earthquakes : []}
                  rainSensors={selectedType === 'heavyrain' ? rainSensorData.sensors : []}
                  selectedType={selectedType}
                  magnitudeFilter={magnitudeFilter}
                  humidityFilter={humidityFilter}
                  isLoading={currentData.isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {currentData.error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-700">
                  เกิดข้อผิดพลาด: {getErrorMessage(currentData.error)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisasterMap;
