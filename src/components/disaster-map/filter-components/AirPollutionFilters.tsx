
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface AirPollutionFiltersProps {
  pm25Filter: number;
  onPm25Change: (value: number) => void;
}

export const AirPollutionFilters: React.FC<AirPollutionFiltersProps> = ({
  pm25Filter,
  onPm25Change
}) => {
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
};
