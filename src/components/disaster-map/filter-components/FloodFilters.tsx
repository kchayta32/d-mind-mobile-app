
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FloodFiltersProps {
  floodTimeFilter: string;
  onFloodTimeFilterChange: (value: string) => void;
  showFloodFrequency: boolean;
  onShowFloodFrequencyChange: (show: boolean) => void;
}

export const FloodFilters: React.FC<FloodFiltersProps> = ({
  floodTimeFilter,
  onFloodTimeFilterChange,
  showFloodFrequency,
  onShowFloodFrequencyChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ช่วงเวลาข้อมูลน้ำท่วม</Label>
        <Select value={floodTimeFilter} onValueChange={onFloodTimeFilterChange}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1day">วันนี้ (ย้อนหลัง 1 วัน)</SelectItem>
            <SelectItem value="3days">3 วันล่าสุด</SelectItem>
            <SelectItem value="7days">7 วันล่าสุด</SelectItem>
            <SelectItem value="30days">30 วันล่าสุด</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">ข้อมูลเพิ่มเติม</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="flood-freq" 
              className="rounded" 
              checked={showFloodFrequency}
              onChange={(e) => onShowFloodFrequencyChange(e.target.checked)}
            />
            <label htmlFor="flood-freq" className="text-xs">พื้นที่น้ำท่วมซ้ำซาก</label>
          </div>
        </div>
      </div>
    </div>
  );
};
