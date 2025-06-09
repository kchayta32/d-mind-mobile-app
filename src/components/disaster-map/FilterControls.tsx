import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisasterType } from './DisasterMap';
import { EarthquakeFilters } from './filter-components/EarthquakeFilters';
import { HeavyRainFilters } from './filter-components/HeavyRainFilters';
import { WildfireFilters } from './filter-components/WildfireFilters';
import { AirPollutionFilters } from './filter-components/AirPollutionFilters';
import { DroughtFilters } from './filter-components/DroughtFilters';
import { FloodFilters } from './filter-components/FloodFilters';

interface FilterControlsProps {
  selectedType: DisasterType;
  magnitudeFilter: number;
  onMagnitudeChange: (value: number) => void;
  humidityFilter: number;
  onHumidityChange: (value: number) => void;
  rainTimeFilter: string;
  onRainTimeFilterChange: (value: string) => void;
  pm25Filter: number;
  onPm25Change: (value: number) => void;
  wildfireTimeFilter: string;
  onWildfireTimeFilterChange: (value: string) => void;
  droughtLayers: string[];
  onDroughtLayersChange: (layers: string[]) => void;
  floodTimeFilter: string;
  onFloodTimeFilterChange: (value: string) => void;
  showFloodFrequency: boolean;
  onShowFloodFrequencyChange: (show: boolean) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedType,
  magnitudeFilter,
  onMagnitudeChange,
  humidityFilter,
  onHumidityChange,
  rainTimeFilter,
  onRainTimeFilterChange,
  pm25Filter,
  onPm25Change,
  wildfireTimeFilter,
  onWildfireTimeFilterChange,
  droughtLayers,
  onDroughtLayersChange,
  floodTimeFilter,
  onFloodTimeFilterChange,
  showFloodFrequency,
  onShowFloodFrequencyChange,
}) => {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-700 text-lg">ตัวกรองข้อมูล</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedType === 'earthquake' && (
          <EarthquakeFilters
            magnitudeFilter={magnitudeFilter}
            onMagnitudeChange={onMagnitudeChange}
          />
        )}
        
        {selectedType === 'heavyrain' && (
          <HeavyRainFilters
            humidityFilter={humidityFilter}
            onHumidityChange={onHumidityChange}
            timeFilter={rainTimeFilter}
            onTimeFilterChange={onRainTimeFilterChange}
          />
        )}

        {selectedType === 'wildfire' && (
          <WildfireFilters
            wildfireTimeFilter={wildfireTimeFilter}
            onWildfireTimeFilterChange={onWildfireTimeFilterChange}
          />
        )}

        {selectedType === 'airpollution' && (
          <AirPollutionFilters
            pm25Filter={pm25Filter}
            onPm25Change={onPm25Change}
          />
        )}

        {selectedType === 'drought' && (
          <DroughtFilters
            droughtLayers={droughtLayers}
            onDroughtLayersChange={onDroughtLayersChange}
          />
        )}

        {selectedType === 'flood' && (
          <FloodFilters
            floodTimeFilter={floodTimeFilter}
            onFloodTimeFilterChange={onFloodTimeFilterChange}
            showFloodFrequency={showFloodFrequency}
            onShowFloodFrequencyChange={onShowFloodFrequencyChange}
          />
        )}

        {selectedType !== 'earthquake' && selectedType !== 'heavyrain' && selectedType !== 'wildfire' && selectedType !== 'airpollution' && selectedType !== 'drought' && selectedType !== 'flood' && (
          <div className="text-sm text-gray-600">
            ไม่มีตัวกรองสำหรับประเภทภัยพิบัตินี้
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterControls;
