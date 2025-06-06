
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GISTDAHotspot, GISTDAStats } from './useGISTDAData';
import WildfireTimeChart from './charts/WildfireTimeChart';
import WildfireRegionChart from './charts/WildfireRegionChart';

interface WildfireChartsProps {
  hotspots: GISTDAHotspot[];
  stats: GISTDAStats;
}

const WildfireCharts: React.FC<WildfireChartsProps> = ({ hotspots, stats }) => {
  return (
    <div className="space-y-4">
      {/* 7-Day Wildfire Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">สรุปสถานการณ์ไฟป่า 7 วันล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <WildfireTimeChart hotspots={hotspots} />
        </CardContent>
      </Card>

      {/* Regional Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">การกระจายตามภูมิภาค</CardTitle>
        </CardHeader>
        <CardContent>
          <WildfireRegionChart hotspots={hotspots} />
        </CardContent>
      </Card>
    </div>
  );
};

export default WildfireCharts;
