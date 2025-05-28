
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
    <div className="w-full h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">แผนที่ภัยพิบัติ</h2>
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
        <DisasterTypeSelector 
          selectedType={selectedType} 
          onTypeChange={setSelectedType} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Statistics and Filters */}
        <div className="lg:col-span-1 space-y-4">
          <StatisticsPanel 
            stats={currentData.stats} 
            isLoading={currentData.isLoading}
            disasterType={selectedType}
          />
          
          <FilterControls
            magnitudeFilter={magnitudeFilter}
            onMagnitudeChange={setMagnitudeFilter}
            humidityFilter={humidityFilter}
            onHumidityChange={setHumidityFilter}
            selectedType={selectedType}
          />
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {selectedType === 'earthquake' && 'แผนที่แผ่นดินไหว'}
                {selectedType === 'heavyrain' && 'แผนที่เซ็นเซอร์ฝน'}
                {selectedType === 'flood' && 'แผนที่น้ำท่วม (เร็วๆ นี้)'}
                {selectedType === 'wildfire' && 'แผนที่ไฟป่า (เร็วๆ นี้)'}
                {selectedType === 'storm' && 'แผนที่พายุ (เร็วๆ นี้)'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-60px)] min-h-[600px]">
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
    </div>
  );
};

export default DisasterMap;
