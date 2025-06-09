
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeavyRainFiltersProps {
  humidityFilter: number;
  onHumidityChange: (value: number) => void;
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
}

export const HeavyRainFilters: React.FC<HeavyRainFiltersProps> = ({
  humidityFilter,
  onHumidityChange,
  timeFilter,
  onTimeFilterChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ช่วงเวลาข้อมูล</Label>
        <Select value={timeFilter} onValueChange={onTimeFilterChange}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="realtime">เรียลไทม์ (ปัจจุบัน)</SelectItem>
            <SelectItem value="3days">3 วันล่าสุด</SelectItem>
            <SelectItem value="7days">7 วันล่าสุด</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
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
      
      <div className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded">
        <strong>ข้อมูลเซ็นเซอร์ฝน:</strong> แสดงตำแหน่งเซ็นเซอร์วัดความชื้นและสถานะฝนตก
      </div>
    </div>
  );
};
