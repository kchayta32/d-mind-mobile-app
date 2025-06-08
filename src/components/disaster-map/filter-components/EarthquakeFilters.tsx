
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface EarthquakeFiltersProps {
  magnitudeFilter: number;
  onMagnitudeChange: (value: number) => void;
}

export const EarthquakeFilters: React.FC<EarthquakeFiltersProps> = ({
  magnitudeFilter,
  onMagnitudeChange
}) => {
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
};
