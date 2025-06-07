
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
  wildfireTimeFilter: string;
  onWildfireTimeFilterChange: (value: string) => void;
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
}) => {
  const renderFilters = () => {
    switch (selectedType) {
      case 'earthquake':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="magnitude-filter" className="text-sm font-medium">
                ขนาดแผ่นดินไหว: {magnitudeFilter}+
              </Label>
              <Slider
                id="magnitude-filter"
                min={1.0}
                max={8.0}
                step={0.1}
                value={[magnitudeFilter]}
                onValueChange={(value) => onMagnitudeChange(value[0])}
                className="w-full mt-2"
              />
            </div>
          </div>
        );

      case 'heavyrain':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="humidity-filter" className="text-sm font-medium">
                ความชื้น: {humidityFilter}%+
              </Label>
              <Slider
                id="humidity-filter"
                min={0}
                max={100}
                step={5}
                value={[humidityFilter]}
                onValueChange={(value) => onHumidityChange(value[0])}
                className="w-full mt-2"
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
              <Select value={wildfireTimeFilter} onValueChange={onWildfireTimeFilterChange}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">วันนี้ (ย้อนหลัง 1 วัน)</SelectItem>
                  <SelectItem value="3days">3 วันล่าสุด</SelectItem>
                  <SelectItem value="7days">7 วันล่าสุด</SelectItem>
                  <SelectItem value="30days">30 วันล่าสุด</SelectItem>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
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
                PM2.5: {pm25Filter}+ μg/m³
              </Label>
              <Slider
                id="pm25-filter"
                min={0}
                max={200}
                step={5}
                value={[pm25Filter]}
                onValueChange={(value) => onPm25Change(value[0])}
                className="w-full mt-2"
              />
            </div>
          </div>
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
