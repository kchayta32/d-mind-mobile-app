import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  EarthquakeStats,
  RainSensorStats,
  AirPollutionStats,
  RainViewerStats
} from './types';
import { WildfireStats } from './useGISTDAData';
import { DroughtStats } from './hooks/useDroughtData';
import { FloodStats } from './hooks/useFloodData';
import { SinkholeStats } from '../../hooks/useSinkholeData';
import { DisasterType } from './types';

interface StatisticsWithRainViewer extends RainSensorStats {
  rainViewer?: RainViewerStats;
}

interface StatisticsPanelProps {
  stats: EarthquakeStats | StatisticsWithRainViewer | WildfireStats | AirPollutionStats | DroughtStats | FloodStats | SinkholeStats | null;
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

  const renderWildfireStats = (wildfireStats: WildfireStats) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{wildfireStats.totalHotspots}</div>
          <div className="text-xs text-gray-600">จุดความร้อนทั้งหมด</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{wildfireStats.highConfidence}</div>
          <div className="text-xs text-gray-600">ความเชื่อมั่นสูง</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{wildfireStats.thailand.totalHotspots}</div>
          <div className="text-xs text-gray-600">ในประเทศไทย</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{wildfireStats.international.totalHotspots}</div>
          <div className="text-xs text-gray-600">ต่างประเทศ</div>
        </div>
      </div>

      {/* Risk Assessment Summary */}
      <div className="border-t pt-2">
        <div className="text-xs text-gray-600 mb-1">การประเมินพื้นที่เสี่ยง:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">{wildfireStats.thailand.totalRiskArea.toLocaleString()}</div>
            <div className="text-gray-600">พื้นที่เสี่ยง (ไร่)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">{wildfireStats.thailand.byRiskLevel.length > 0 ? wildfireStats.thailand.byRiskLevel[0]?.count || 0 : 0}</div>
            <div className="text-gray-600">เสี่ยงสูงสุด</div>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          {wildfireStats.thailand.byRiskLevel.slice(0, 2).map((risk, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span>{risk.level}:</span>
              <span className="font-semibold">{risk.count} จุด ({risk.area.toLocaleString()} ไร่)</span>
            </div>
          ))}
        </div>
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

  const renderDroughtStats = (droughtStats: DroughtStats) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{droughtStats.nationalAverage.toFixed(1)}%</div>
          <div className="text-xs text-gray-600">เฉลี่ยทั่วประเทศ</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{droughtStats.topProvinces.length}</div>
          <div className="text-xs text-gray-600">จังหวัดเสี่ยงสูง</div>
        </div>
      </div>
      <div className="border-t pt-2">
        <div className="text-xs text-gray-600 mb-1">3 จังหวัดเสี่ยงสูงสุด:</div>
        <div className="space-y-1">
          {droughtStats.topProvinces.slice(0, 3).map((province, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span>{province.province}</span>
              <span className="font-semibold">{province.percentage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFloodStats = (floodStats: any) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{floodStats.currentFloods?.total || 0}</div>
          <div className="text-xs text-gray-600">พื้นที่น้ำท่วมปัจจุบัน</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{floodStats.waterObstructions?.totalHyacinthAreas || 0}</div>
          <div className="text-xs text-gray-600">สิ่งกีดขวางทางน้ำ</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">{floodStats.historicalData?.peakYear?.year || 'N/A'}</div>
          <div className="text-xs text-gray-600">ปีน้ำท่วมหนักสุด</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{Math.round((floodStats.historicalData?.peakYear?.area || 0) / 1000000)}</div>
          <div className="text-xs text-gray-600">ล้านไร่ (ปีสูงสุด)</div>
        </div>
      </div>

      {/* Historical Summary */}
      {floodStats.historicalData && (
        <div className="border-t pt-2">
          <div className="text-xs text-gray-600 mb-1">สถิติย้อนหลัง (2554-2566):</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">{Math.round((floodStats.historicalData.peakYear?.area || 0) / 1000000)}</div>
              <div className="text-gray-600">พื้นที่สูงสุด (ล้านไร่)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{floodStats.waterObstructions?.totalHyacinthAreas || 0}</div>
              <div className="text-gray-600">สิ่งกีดขวางทางน้ำ</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );



  const renderSinkholeStats = (sinkholeStats: SinkholeStats) => (
    <div className="grid grid-cols-2 gap-3">
      <div className="text-center">
        <div className="text-2xl font-bold text-amber-600">{sinkholeStats.totalIncidents}</div>
        <div className="text-xs text-gray-600">เหตุการณ์ทั้งหมด</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{sinkholeStats.highSeverity}</div>
        <div className="text-xs text-gray-600">ร้ายแรง</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-purple-600">{sinkholeStats.averageSize}</div>
        <div className="text-xs text-gray-600">ขนาดเฉลี่ย</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-blue-600">{sinkholeStats.affectedAreas}</div>
        <div className="text-xs text-gray-600">พื้นที่ได้รับผลกระทบ</div>
      </div>
    </div>
  );

  const getTitle = () => {
    switch (disasterType) {
      case 'earthquake': return 'สถิติแผ่นดินไหว';
      case 'heavyrain': return 'สถิติเซ็นเซอร์ฝน';

      case 'wildfire': return 'สถิติจุดความร้อน';
      case 'airpollution': return 'สถิติคุณภาพอากาศ';
      case 'drought': return 'สถิติภัยแล้ง';
      case 'flood': return 'สถิติน้ำท่วม';
      case 'sinkhole': return 'สถิติแผ่นดินยุบ/ดินทรุด';
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
        return renderWildfireStats(stats as WildfireStats);
      case 'airpollution':
        return renderAirPollutionStats(stats as AirPollutionStats);
      case 'drought':
        return renderDroughtStats(stats as DroughtStats);
      case 'flood':
        return renderFloodStats(stats);
      case 'sinkhole':
        return renderSinkholeStats(stats as SinkholeStats);
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
