
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WildfireFiltersProps {
  wildfireTimeFilter: string;
  onWildfireTimeFilterChange: (value: string) => void;
}

export const WildfireFilters: React.FC<WildfireFiltersProps> = ({
  wildfireTimeFilter,
  onWildfireTimeFilterChange
}) => {
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
};
