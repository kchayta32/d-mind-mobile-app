
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloodHistoricalChart } from './charts/FloodHistoricalChart';
import { FloodStats } from './hooks/useFloodData';

interface FloodChartsProps {
  stats: FloodStats | null;
}

const FloodCharts: React.FC<FloodChartsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">กราฟสถิติน้ำท่วม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">ไม่มีข้อมูลสถิติ</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Historical Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">สถิติย้อนหลัง</CardTitle>
        </CardHeader>
        <CardContent>
          <FloodHistoricalChart data={[]} />
        </CardContent>
      </Card>

      {/* Current Statistics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">สถิติปัจจุบัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {stats.currentFloods?.affectedAreas || 0}
              </div>
              <div className="text-xs text-gray-600">พื้นที่น้ำท่วมปัจจุบัน</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {stats.waterObstructions?.totalHyacinthAreas || 0}
              </div>
              <div className="text-xs text-gray-600">สิ่งกีดขวางทางน้ำ</div>
            </div>
          </div>
          
          {stats.historicalData && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-600 mb-2">ข้อมูลเพิ่มเติม:</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>ปีที่น้ำท่วมหนักสุด:</span>
                  <span className="font-semibold">{stats.historicalData.peakYear?.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>พื้นที่สูงสุด:</span>
                  <span className="font-semibold">
                    {stats.historicalData.peakYear?.area?.toLocaleString() || 0} ไร่
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloodCharts;
