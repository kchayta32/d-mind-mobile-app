
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
  const renderFilters = () => {
    switch (selectedType) {
      case 'earthquake':
        return (
          <EarthquakeFilters
            magnitudeFilter={magnitudeFilter}
            onMagnitudeChange={onMagnitudeChange}
          />
        );

      case 'heavyrain':
        return (
          <HeavyRainFilters
            humidityFilter={humidityFilter}
            onHumidityChange={onHumidityChange}
          />
        );

      case 'wildfire':
        return (
          <WildfireFilters
            wildfireTimeFilter={wildfireTimeFilter}
            onWildfireTimeFilterChange={onWildfireTimeFilterChange}
          />
        );

      case 'airpollution':
        return (
          <AirPollutionFilters
            pm25Filter={pm25Filter}
            onPm25Change={onPm25Change}
          />
        );

      case 'drought':
        return (
          <DroughtFilters
            droughtLayers={droughtLayers}
            onDroughtLayersChange={onDroughtLayersChange}
          />
        );

      case 'flood':
        return (
          <FloodFilters
            floodTimeFilter={floodTimeFilter}
            onFloodTimeFilterChange={onFloodTimeFilterChange}
            showFloodFrequency={showFloodFrequency}
            onShowFloodFrequencyChange={onShowFloodFrequencyChange}
          />
        );

      default:
        return (
          <div className="text-sm text-gray-600">
            ไม่มีตัวกรองสำหรับประเภทภัยพิบัตินี้
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (selectedType) {
      case 'earthquake': return 'ตัวกรองแผ่นดินไหว';
      case 'heavyrain': return 'ตัวกรองฝนตก';
      case 'wildfire': return 'ตัวกรองไฟป่า';
      case 'airpollution': return 'ตัวกรองมลพิษอากาศ';
      case 'drought': return 'ตัวกรองภัยแล้ง';
      case 'flood': return 'ตัวกรองน้ำท่วม';
      default: return 'ตัวกรอง';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderFilters()}
      </CardContent>
    </Card>
  );
};

export default FilterControls;
