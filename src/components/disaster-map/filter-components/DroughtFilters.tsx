
import React from 'react';
import { Label } from '@/components/ui/label';

interface DroughtFiltersProps {
  droughtLayers: string[];
  onDroughtLayersChange: (layers: string[]) => void;
}

export const DroughtFilters: React.FC<DroughtFiltersProps> = ({
  droughtLayers,
  onDroughtLayersChange
}) => {
  const handleDroughtLayerToggle = (layer: string, checked: boolean) => {
    if (checked) {
      onDroughtLayersChange([...droughtLayers, layer]);
    } else {
      onDroughtLayersChange(droughtLayers.filter(l => l !== layer));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">ชั้นข้อมูลภัยแล้ง</Label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="dri" 
              className="rounded" 
              checked={droughtLayers.includes('dri')}
              onChange={(e) => handleDroughtLayerToggle('dri', e.target.checked)}
            />
            <label htmlFor="dri" className="text-xs">ดัชนีพื้นที่เสี่ยงภัยแล้ง (DRI)</label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="ndwi" 
              className="rounded" 
              checked={droughtLayers.includes('ndwi')}
              onChange={(e) => handleDroughtLayerToggle('ndwi', e.target.checked)}
            />
            <label htmlFor="ndwi" className="text-xs">ดัชนีความแตกต่างความชื้น (NDWI)</label>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="smap" 
              className="rounded" 
              checked={droughtLayers.includes('smap')}
              onChange={(e) => handleDroughtLayerToggle('smap', e.target.checked)}
            />
            <label htmlFor="smap" className="text-xs">ความชื้นดิน (SMAP)</label>
          </div>
        </div>
      </div>
    </div>
  );
};
