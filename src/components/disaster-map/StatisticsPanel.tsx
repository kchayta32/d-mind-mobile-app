
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  EarthquakeStats, 
  RainSensorStats, 
  AirPollutionStats 
} from './types';
import { GISTDAStats } from './useGISTDAData';
import { DisasterType } from './DisasterMap';

interface StatisticsWithRainViewer extends RainSensorStats {
  rainViewer?: {
    lastUpdated: string;
    totalFrames: number;
    pastFrames: number;
    futureFrames: number;
  };
}

interface StatisticsPanelProps {
  stats: EarthquakeStats | StatisticsWithRainViewer | GISTDAStats | AirPollutionStats | null;
  isLoading: boolean;
  disasterType: DisasterType;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats, isLoading, disasterType }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">สถิติข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">สถิติข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">ไม่มีข้อมูลสถิติ</p>
        </CardContent>
      </Card>
    );
  }

  const renderEarthquakeStats = (earthquakeStats: EarthquakeStats) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{earthquakeStats.total}</div>
        <div className="text-xs text-gray-600">แผ่นดินไหวทั้งหมด</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{earthquakeStats.major}</div>
        <div className="text-xs text-gray-600">ขนาดใหญ่ (6.0+)</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-blue-600">{earthquakeStats.averageMagnitude}</div>
        <div className="text-xs text-gray-600">ขนาดเฉลี่ย</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-green-600">{earthquakeStats.last24Hours}</div>
        <div className="text-xs text-gray-600">24 ชม. ล่าสุด</div>
      </div>
    </div>
  );

  const renderRainSensorStats = (rainStats: StatisticsWithRainViewer) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{rainStats.total}</div>
          <div className="text-xs text-gray-600">เซ็นเซอร์ทั้งหมด</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{rainStats.activeRaining}</div>
          <div className="text-xs text-gray-600">กำลังตกฝน</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{rainStats.averageHumidity}%</div>
          <div className="text-xs text-gray-600">ความชื้นเฉลี่ย</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">{rainStats.maxHumidity}%</div>
          <div className="text-xs text-gray-600">ความชื้นสูงสุด</div>
        </div>
      </div>
      {rainStats.rainViewer && (
        <div className="border-t pt-2">
          <div className="text-xs text-gray-600 mb-1">เรดาร์ฝน RainViewer:</div>
          <div className="flex justify-between text-xs">
            <span>เฟรมย้อนหลัง: {rainStats.rainViewer.pastFrames}</span>
            <span>เฟรมพยากรณ์: {rainStats.rainViewer.futureFrames}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderWildfireStats = (wildfireStats: GISTDAStats) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{wildfireStats.totalHotspots}</div>
        <div className="text-xs text-gray-600">จุดความร้อนทั้งหมด</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{wildfireStats.highConfidenceCount}</div>
        <div className="text-xs text-gray-600">ความเชื่อมั่นสูง</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-blue-600">{wildfireStats.modisCount}</div>
        <div className="text-xs text-gray-600">MODIS</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-purple-600">{wildfireStats.viirsCount}</div>
        <div className="text-xs text-gray-600">VIIRS</div>
      </div>
    </div>
  );

  const renderAirPollutionStats = (airStats: AirPollutionStats) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{airStats.totalStations}</div>
        <div className="text-xs text-gray-600">สถานีทั้งหมด</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{airStats.unhealthyStations}</div>
        <div className="text-xs text-gray-600">ไม่ดีต่อสุขภาพ</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-purple-600">{airStats.averagePM25}</div>
        <div className="text-xs text-gray-600">PM2.5 เฉลี่ย</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-orange-600">{airStats.maxPM25}</div>
        <div className="text-xs text-gray-600">PM2.5 สูงสุด</div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (disasterType) {
      case 'earthquake': return 'สถิติแผ่นดินไหว';
      case 'heavyrain': return 'สถิติเซ็นเซอร์ฝน';
      case 'wildfire': return 'สถิติจุดความร้อน';
      case 'airpollution': return 'สถิติคุณภาพอากาศ';
      default: return 'สถิติข้อมูล';
    }
  };

  const renderStats = () => {
    switch (disasterType) {
      case 'earthquake':
        return renderEarthquakeStats(stats as EarthquakeStats);
      case 'heavyrain':
        return renderRainSensorStats(stats as StatisticsWithRainViewer);
      case 'wildfire':
        return renderWildfireStats(stats as GISTDAStats);
      case 'airpollution':
        return renderAirPollutionStats(stats as AirPollutionStats);
      default:
        return <p className="text-sm text-gray-600">ไม่รองรับการแสดงสถิติสำหรับประเภทนี้</p>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          {getTitle()}
          <Badge variant="secondary" className="text-xs">
            อัปเดตล่าสุด
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStats()}
      </CardContent>
    </Card>
  );
};

export default StatisticsPanel;
