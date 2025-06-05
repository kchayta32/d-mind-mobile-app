
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AirPollutionData, AirPollutionStats } from './types';

interface AirPollutionChartsProps {
  stations: AirPollutionData[];
  stats: AirPollutionStats;
}

export const AirPollutionCharts: React.FC<AirPollutionChartsProps> = ({ stations, stats }) => {
  // Process data for provincial PM2.5 averages
  const provincialData = stations.reduce((acc, station) => {
    const province = station.province || 'ไม่ระบุ';
    const pm25 = station.pm25 || 0;
    
    if (!acc[province]) {
      acc[province] = { province, pm25Sum: 0, count: 0, average: 0 };
    }
    
    acc[province].pm25Sum += pm25;
    acc[province].count++;
    acc[province].average = Math.round(acc[province].pm25Sum / acc[province].count);
    
    return acc;
  }, {} as Record<string, { province: string; pm25Sum: number; count: number; average: number }>);

  const provincialChart = Object.values(provincialData)
    .sort((a, b) => b.average - a.average)
    .slice(0, 10); // Top 10 provinces

  // Get PM2.5 quality color
  const getPM25Color = (value: number) => {
    if (value <= 25) return '#10B981'; // Good - Green
    if (value <= 50) return '#F59E0B'; // Moderate - Yellow
    if (value <= 75) return '#EF4444'; // Unhealthy for sensitive - Orange
    return '#DC2626'; // Unhealthy - Red
  };

  // Get quality label
  const getPM25Label = (value: number) => {
    if (value <= 25) return 'ดี';
    if (value <= 50) return 'ปานกลาง';
    if (value <= 75) return 'เริ่มมีผลกระทบต่อสุขภาพ';
    return 'มีผลกระทบต่อสุขภาพ';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">สถิติคุณภาพอากาศ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalStations}</div>
              <div className="text-sm text-gray-600">สถานีทั้งหมด</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.unhealthyStations}</div>
              <div className="text-sm text-gray-600">ไม่ดีต่อสุขภาพ</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">{stats.averagePM25}</div>
              <div className="text-sm text-gray-600">PM2.5 เฉลี่ย</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">{stats.maxPM25}</div>
              <div className="text-sm text-gray-600">PM2.5 สูงสุด</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provincial PM2.5 Averages Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ค่าเฉลี่ย PM2.5 รายจังหวัด</CardTitle>
          <p className="text-sm text-gray-600">ข้อมูลรายวัน (μg/m³)</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={provincialChart}
              margin={{ top: 5, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="province" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis 
                label={{ value: 'PM2.5 (μg/m³)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value: number) => [
                  `${value} μg/m³ (${getPM25Label(value)})`,
                  'PM2.5'
                ]}
                labelFormatter={(label) => `จังหวัด${label}`}
              />
              <Bar dataKey="average" name="PM2.5 เฉลี่ย">
                {provincialChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPM25Color(entry.average)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* PM2.5 Quality Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">เกณฑ์คุณภาพอากาศ PM2.5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>ดี (0-25)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>ปานกลาง (26-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>เริ่มมีผลกระทบ (51-75)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>มีผลกระทบ (76+)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AirPollutionCharts;
