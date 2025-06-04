import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, AlertTriangle, Clock, Droplets, Gauge, Flame, Satellite } from 'lucide-react';
import { EarthquakeStats, RainSensorStats, GISTDAStats } from './types';
import { DisasterType } from './DisasterMap';

interface StatisticsPanelProps {
  stats: EarthquakeStats | RainSensorStats | GISTDAStats | null;
  isLoading: boolean;
  disasterType: DisasterType;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ 
  stats, 
  isLoading,
  disasterType 
}) => {
  const renderEarthquakeStats = (earthquakeStats: EarthquakeStats) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Activity className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-2xl font-bold text-blue-700">{earthquakeStats.total}</p>
            <p className="text-sm text-gray-600">รวมทั้งหมด</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
          <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-2xl font-bold text-orange-700">{earthquakeStats.last24Hours}</p>
            <p className="text-sm text-gray-600">24 ชม. ที่แล้ว</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">ค่าเฉลี่ย:</span>
          <Badge variant="outline" className="ml-2">
            {earthquakeStats.averageMagnitude.toFixed(1)}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">สูงสุด:</span>
          <Badge variant="outline" className="text-red-600 ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            {earthquakeStats.maxMagnitude.toFixed(1)}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">รุนแรง:</span>
          <Badge variant={earthquakeStats.significantCount > 0 ? "destructive" : "secondary"} className="ml-2">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {earthquakeStats.significantCount}
          </Badge>
        </div>
      </div>
    </>
  );

  const renderRainSensorStats = (rainStats: RainSensorStats) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Droplets className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-2xl font-bold text-blue-700">{rainStats.total}</p>
            <p className="text-sm text-gray-600">เซ็นเซอร์ทั้งหมด</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
          <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-2xl font-bold text-orange-700">{rainStats.last24Hours}</p>
            <p className="text-sm text-gray-600">24 ชม. ที่แล้ว</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">กำลังฝนตก:</span>
          <Badge variant={rainStats.activeRaining > 0 ? "destructive" : "secondary"} className="ml-2">
            <Droplets className="h-3 w-3 mr-1" />
            {rainStats.activeRaining}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">ความชื้นเฉลี่ย:</span>
          <Badge variant="outline" className="ml-2">
            <Gauge className="h-3 w-3 mr-1" />
            {rainStats.averageHumidity}%
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">ความชื้นสูงสุด:</span>
          <Badge variant="outline" className="text-blue-600 ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            {rainStats.maxHumidity}%
          </Badge>
        </div>
      </div>
    </>
  );

  const renderGISTDAStats = (gistdaStats: GISTDAStats) => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Flame className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-2xl font-bold text-red-700">{gistdaStats.totalHotspots}</p>
            <p className="text-sm text-gray-600">จุดความร้อนทั้งหมด</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
          <Clock className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-2xl font-bold text-orange-700">{gistdaStats.last24Hours}</p>
            <p className="text-sm text-gray-600">24 ชม. ที่แล้ว</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">MODIS:</span>
          <Badge variant="outline" className="text-blue-600 ml-2">
            <Satellite className="h-3 w-3 mr-1" />
            {gistdaStats.modisCount}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">VIIRS:</span>
          <Badge variant="outline" className="text-red-600 ml-2">
            <Satellite className="h-3 w-3 mr-1" />
            {gistdaStats.viirsCount}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">ความเชื่อมั่นสูง:</span>
          <Badge variant={gistdaStats.highConfidenceCount > 0 ? "destructive" : "secondary"} className="ml-2">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {gistdaStats.highConfidenceCount}
          </Badge>
        </div>

        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="text-sm font-medium text-gray-700">ความเชื่อมั่นเฉลี่ย:</span>
          <Badge variant="outline" className="ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            {gistdaStats.averageConfidence}%
          </Badge>
        </div>
      </div>
    </>
  );

  const renderComingSoonStats = () => (
    <div className="text-center py-8">
      <div className="text-4xl mb-2">🚧</div>
      <p className="text-gray-500">สถิติจะเปิดให้บริการเร็วๆ นี้</p>
    </div>
  );

  const getTitle = () => {
    switch (disasterType) {
      case 'earthquake':
        return 'สถิติแผ่นดินไหว';
      case 'heavyrain':
        return 'สถิติเซ็นเซอร์ฝน';
      case 'flood':
        return 'สถิติน้ำท่วม';
      case 'wildfire':
        return 'สถิติไฟป่า';
      case 'storm':
        return 'สถิติพายุ';
      default:
        return 'สถิติ';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : stats ? (
          disasterType === 'earthquake' 
            ? renderEarthquakeStats(stats as EarthquakeStats)
            : disasterType === 'heavyrain'
            ? renderRainSensorStats(stats as RainSensorStats)
            : disasterType === 'wildfire'
            ? renderGISTDAStats(stats as GISTDAStats)
            : renderComingSoonStats()
        ) : (
          renderComingSoonStats()
        )}
      </CardContent>
    </Card>
  );
};
