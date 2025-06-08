
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface HeavyRainFiltersProps {
  humidityFilter: number;
  onHumidityChange: (value: number) => void;
}

export const HeavyRainFilters: React.FC<HeavyRainFiltersProps> = ({
  humidityFilter,
  onHumidityChange
}) => {
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
};
