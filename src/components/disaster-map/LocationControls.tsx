
import React from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, MapPinOff } from 'lucide-react';

interface LocationControlsProps {
  showUserLocation: boolean;
  onToggleLocation: (show: boolean) => void;
}

export const LocationControls: React.FC<LocationControlsProps> = ({
  showUserLocation,
  onToggleLocation
}) => {
  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium dark:text-gray-200">ตำแหน่งของฉัน</span>
        </div>
        
        <Button
          onClick={() => onToggleLocation(!showUserLocation)}
          variant={showUserLocation ? "default" : "outline"}
          size="sm"
          className="w-full"
        >
          {showUserLocation ? (
            <>
              <MapPinOff className="w-4 h-4 mr-2" />
              ซ่อนตำแหน่ง
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              แสดงตำแหน่ง
            </>
          )}
        </Button>
        
        {showUserLocation && (
          <p className="text-xs text-muted-foreground mt-2">
            กำลังติดตามตำแหน่งของคุณ
          </p>
        )}
      </div>
    </div>
  );
};
