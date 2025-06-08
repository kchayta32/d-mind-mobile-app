
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FloodStats } from './hooks/useFloodData';

interface FloodChartsProps {
  stats: FloodStats | null;
}

const FloodCharts: React.FC<FloodChartsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">กำลังโหลดข้อมูลน้ำท่วม...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Chart 1: Recurrent Flood Frequency
  const frequencyChartData = stats.recurrentFloods.byFrequency.map(item => ({
    frequency: `${item.frequency} ครั้ง`,
    count: item.count,
    area: item.totalArea
  }));

  // Chart 2: Most Vulnerable Provinces (now vertical)
  const provinceChartData = stats.recurrentFloods.mostVulnerableProvinces.map(item => ({
    province: item.province,
    count: item.areaCount,
    area: item.totalArea
  }));

  // Chart 3: Current Flood Status
  const currentStatusData = [
    { name: 'เสี่ยงต่ำ', value: stats.currentFloods.bySeverity.low, color: '#22c55e' },
    { name: 'เสี่ยงปานกลาง', value: stats.currentFloods.bySeverity.medium, color: '#f59e0b' },
    { name: 'เสี่ยงสูง', value: stats.currentFloods.bySeverity.high, color: '#ef4444' },
    { name: 'เสี่ยงมาก', value: stats.currentFloods.bySeverity.severe, color: '#dc2626' }
  ];

  const chartConfig = {
    area: { label: 'พื้นที่ (ไร่)', color: '#3b82f6' },
    count: { label: 'จำนวนพื้นที่', color: '#06b6d4' },
    frequency: { label: 'ความถี่', color: '#8b5cf6' }
  };

  return (
    <div className="space-y-4">
      {/* Flood Frequency Analysis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">จำนวนน้ำท่วมซ้ำซาก</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48">
            <BarChart data={frequencyChartData}>
              <XAxis dataKey="frequency" fontSize={10} />
              <YAxis fontSize={10} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  name === 'count' ? 'จำนวนพื้นที่' : name === 'area' ? 'พื้นที่รวม (ไร่)' : name
                ]}
              />
              <Bar dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Most Vulnerable Provinces - Now Vertical Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">จังหวัดเสี่ยงน้ำท่วม</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={provinceChartData}>
              <XAxis dataKey="province" fontSize={10} angle={-45} textAnchor="end" height={80} />
              <YAxis fontSize={10} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  name === 'count' ? 'จำนวนพื้นที่' : name === 'area' ? 'พื้นที่รวม (ไร่)' : name
                ]}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Water Obstructions Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">สิ่งกีดขวางทางน้ำ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{stats.waterObstructions.totalHyacinthAreas}</div>
              <div className="text-xs text-gray-600">พื้นที่ผักตบชวา</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{stats.waterObstructions.totalCoverage}</div>
              <div className="text-xs text-gray-600">ครอบคลุม (กม²)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{stats.waterObstructions.avgCoveragePercent}%</div>
              <div className="text-xs text-gray-600">เฉลี่ยครอบคลุม</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{stats.waterObstructions.criticalAreas}</div>
              <div className="text-xs text-gray-600">พื้นที่วิกฤต</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FloodCharts;
