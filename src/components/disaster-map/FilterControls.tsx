
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  onWildfireTimeFilterChange
}) => {
  const renderEarthquakeFilters = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ขนาดแผ่นดินไหวขั้นต่ำ: {magnitudeFilter.toFixed(1)}</Label>
        <Slider
          value={[magnitudeFilter]}
          onValueChange={(value) => onMagnitudeChange(value[0])}
          max={8}
          min={1}
          step={0.1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1.0</span>
          <span>8.0</span>
        </div>
      </div>
    </div>
  );

  const renderRainFilters = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ความชื้นขั้นต่ำ: {humidityFilter}%</Label>
        <Slider
          value={[humidityFilter]}
          onValueChange={(value) => onHumidityChange(value[0])}
          max={100}
          min={0}
          step={5}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );

  const renderWildfireFilters = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ช่วงเวลาข้อมูล</Label>
        <Select value={wildfireTimeFilter} onValueChange={onWildfireTimeFilterChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="เลือกช่วงเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1day">1 วันที่ผ่านมา</SelectItem>
            <SelectItem value="3days">3 วันที่ผ่านมา</SelectItem>
            <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
            <SelectItem value="30days">30 วันที่ผ่านมา</SelectItem>
            <SelectItem value="all">ทั้งหมด</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderAirPollutionFilters = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">PM2.5 ขั้นต่ำ: {pm25Filter} μg/m³</Label>
        <Slider
          value={[pm25Filter]}
          onValueChange={(value) => onPm25Change(value[0])}
          max={200}
          min={0}
          step={5}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>200</span>
        </div>
      </div>
    </div>
  );

  const renderDroughtFilters = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        ข้อมูลภัยแล้งแสดงตามระดับความเสี่ยงของแต่ละจังหวัด
      </div>
    </div>
  );

  const getFilterTitle = () => {
    switch (selectedType) {
      case 'earthquake': return 'ตัวกรองแผ่นดินไหว';
      case 'heavyrain': return 'ตัวกรองฝนตก';
      case 'wildfire': return 'ตัวกรองไฟป่า';
      case 'airpollution': return 'ตัวกรองมลพิษอากาศ';
      case 'drought': return 'ข้อมูลภัยแล้ง';
      default: return 'ตัวกรอง';
    }
  };

  const renderFilters = () => {
    switch (selectedType) {
      case 'earthquake': return renderEarthquakeFilters();
      case 'heavyrain': return renderRainFilters();
      case 'wildfire': return renderWildfireFilters();
      case 'airpollution': return renderAirPollutionFilters();
      case 'drought': return renderDroughtFilters();
      default: return <div>ไม่มีตัวกรองสำหรับภัยพิบัติประเภทนี้</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{getFilterTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderFilters()}
      </CardContent>
    </Card>
  );
};

export default FilterControls;
