
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface FilterControlsProps {
  magnitudeFilter: number[];
  setMagnitudeFilter: (value: number[]) => void;
  timeFilter: string;
  setTimeFilter: (value: string) => void;
  filteredCount: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({ 
  magnitudeFilter, 
  setMagnitudeFilter, 
  timeFilter, 
  setTimeFilter,
  filteredCount 
}) => {
  return (
    <div className="px-4 pt-4 space-y-3">
      <div>
        <div className="flex justify-between">
          <label className="text-sm font-medium">Magnitude: {magnitudeFilter[0]}+</label>
        </div>
        <Slider 
          value={magnitudeFilter} 
          min={0}
          max={9}
          step={0.5}
          onValueChange={setMagnitudeFilter}
          className="mt-2"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">Time Period:</label>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} earthquake{filteredCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default FilterControls;
