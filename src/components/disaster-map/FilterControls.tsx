
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DisasterType } from './DisasterMap';

interface FilterControlsProps {
  magnitudeFilter: number;
  onMagnitudeChange: (value: number) => void;
  humidityFilter: number;
  onHumidityChange: (value: number) => void;
  pm25Filter: number;
  onPm25Change: (value: number) => void;
  selectedType: DisasterType;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  magnitudeFilter,
  onMagnitudeChange,
  humidityFilter,
  onHumidityChange,
  pm25Filter,
  onPm25Change,
  selectedType
}) => {
  const renderFilters = () => {
    switch (selectedType) {
      case 'earthquake':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                ขนาดแผ่นดินไหวขั้นต่ำ: {magnitudeFilter}
              </Label>
              <Slider
                value={[magnitudeFilter]}
                onValueChange={(value) => onMagnitudeChange(value[0])}
                max={9}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'heavyrain':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                ความชื้นขั้นต่ำ: {humidityFilter}%
              </Label>
              <Slider
                value={[humidityFilter]}
                onValueChange={(value) => onHumidityChange(value[0])}
                max={100}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 'airpollution':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                PM2.5 ขั้นต่ำ: {pm25Filter} μg/m³
              </Label>
              <Slider
                value={[pm25Filter]}
                onValueChange={(value) => onPm25Change(value[0])}
                max={200}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-gray-500 text-center py-4">
            ไม่มีตัวกรองสำหรับประเภทภัยนี้
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">ตัวกรองข้อมูล</CardTitle>
      </CardHeader>
      <CardContent>
        {renderFilters()}
      </CardContent>
    </Card>
  );
};

export default FilterControls;
