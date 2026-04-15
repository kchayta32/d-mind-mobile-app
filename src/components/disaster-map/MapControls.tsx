
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RainViewerData } from './useRainViewerData';

interface MapControlsProps {
  rainData: RainViewerData | null;
  showRainOverlay: boolean;
  setShowRainOverlay: (show: boolean) => void;
  rainOverlayType: 'radar' | 'satellite';
  setRainOverlayType: (type: 'radar' | 'satellite') => void;
  rainTimeType: 'past' | 'future';
  setRainTimeType: (type: 'past' | 'future') => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  rainData,
  showRainOverlay,
  setShowRainOverlay,
  rainOverlayType,
  setRainOverlayType,
  rainTimeType,
  setRainTimeType
}) => {
  if (!rainData) return null;

  return (
    <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg w-full md:w-auto dark:border-gray-700">
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium dark:text-gray-200">เรดาร์ฝน:</span>
            <Button
              size="sm"
              variant={showRainOverlay ? "default" : "outline"}
              onClick={() => setShowRainOverlay(!showRainOverlay)}
            >
              {showRainOverlay ? 'ซ่อน' : 'แสดง'}
            </Button>
          </div>
          
          {showRainOverlay && (
            <Tabs value={rainOverlayType} onValueChange={(value) => setRainOverlayType(value as 'radar' | 'satellite')}>
              <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
                <TabsTrigger value="radar" className="text-xs">Radar</TabsTrigger>
                <TabsTrigger value="satellite" className="text-xs">Satellite</TabsTrigger>
              </TabsList>
              
              <TabsContent value="radar" className="mt-2">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={rainTimeType === 'past' ? "default" : "outline"}
                    onClick={() => setRainTimeType('past')}
                    className="text-xs"
                  >
                    ย้อนหลัง
                  </Button>
                  <Button
                    size="sm"
                    variant={rainTimeType === 'future' ? "default" : "outline"}
                    onClick={() => setRainTimeType('future')}
                    className="text-xs"
                  >
                    พยากรณ์
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
