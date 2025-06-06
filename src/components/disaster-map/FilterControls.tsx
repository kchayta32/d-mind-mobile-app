
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DisasterType } from './DisasterMap';

interface FilterControlsProps {
  selectedType: DisasterType;
  magnitudeFilter: number;
  onMagnitudeChange: (value: number) => void;
  humidityFilter: number;
  onHumidityChange: (value: number) => void;
  pm25Filter: number;
  onPm25Change: (value: number) => void;
  wildfireTimeFilter?: string;
  onWildfireTimeFilterChange?: (value: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedType,
  magnitudeFilter,
  onMagnitudeChange,
  humidityFilter,
  onHumidityChange,
  pm25Filter,
  onPm25Change,
  wildfireTimeFilter = '3days',
  onWildfireTimeFilterChange
}) => {
  const renderFilters = () => {
    switch (selectedType) {
      case 'earthquake':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="magnitude-filter" className="text-sm font-medium">
                ขนาดแผ่นดินไหวขั้นต่ำ: {magnitudeFilter}
              </Label>
              <Slider
                id="magnitude-filter"
                min={1.0}
                max={7.0}
                step={0.1}
                value={[magnitudeFilter]}
                onValueChange={(value) => onMagnitudeChange(value[0])}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'heavyrain':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="humidity-filter" className="text-sm font-medium">
                ความชื้นขั้นต่ำ: {humidityFilter}%
              </Label>
              <Slider
                id="humidity-filter"
                min={0}
                max={100}
                step={5}
                value={[humidityFilter]}
                onValueChange={(value) => onHumidityChange(value[0])}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      case 'wildfire':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="wildfire-time-filter" className="text-sm font-medium">
                ช่วงเวลาข้อมูล
              </Label>
              <Select 
                value={wildfireTimeFilter} 
                onValueChange={onWildfireTimeFilterChange}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">1 วันล่าสุด</SelectItem>
                  <SelectItem value="3days">3 วันล่าสุด</SelectItem>
                  <SelectItem value="7days">7 วันล่าสุด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'airpollution':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pm25-filter" className="text-sm font-medium">
                PM2.5 ขั้นต่ำ: {pm25Filter} μg/m³
              </Label>
              <Slider
                id="pm25-filter"
                min={0}
                max={200}
                step={5}
                value={[pm25Filter]}
                onValueChange={(value) => onPm25Change(value[0])}
                className="mt-2"
              />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center text-gray-500 py-4">
            ไม่มีตัวกรองสำหรับประเภทภัยนี้
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ตัวกรอง</CardTitle>
      </CardHeader>
      <CardContent>
        {renderFilters()}
      </CardContent>
    </Card>
  );
};

export default FilterControls;
