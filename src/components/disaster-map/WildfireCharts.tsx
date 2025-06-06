
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GISTDAHotspot, GISTDAStats } from './useGISTDAData';

interface WildfireChartsProps {
  hotspots: GISTDAHotspot[];
  stats: GISTDAStats;
}

export const WildfireCharts: React.FC<WildfireChartsProps> = ({ hotspots, stats }) => {
  // Process land use data for MODIS (lu_name)
  const modisLandUseData = hotspots
    .filter(h => h.properties.instrument === 'MODIS')
    .reduce((acc, hotspot) => {
      const landUse = hotspot.properties.lu_name || 'ไม่ระบุ';
      acc[landUse] = (acc[landUse] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const modisLandUseChart = [
    { name: 'พื้นที่ริมทางหลวง', value: modisLandUseData['พื้นที่ริมทางหลวง'] || 0, color: '#87CEEB' },
    { name: 'พื้นที่เกษตร', value: modisLandUseData['พื้นที่เกษตร'] || 0, color: '#4682B4' },
    { name: 'ป่าสงวนแห่งชาติ', value: modisLandUseData['ป่าสงวนแห่งชาติ'] || 0, color: '#191970' }
  ].filter(item => item.value > 0);

  // Process land use data for VIIRS (lu_name) 
  const viirsLandUseData = hotspots
    .filter(h => h.properties.instrument === 'VIIRS')
    .reduce((acc, hotspot) => {
      const landUse = hotspot.properties.lu_name || 'ไม่ระบุ';
      acc[landUse] = (acc[landUse] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const viirsLandUseChart = [
    { name: 'เขต สปภ.', value: viirsLandUseData['เขต สปก.'] || 0, color: '#8B0000' },
    { name: 'พื้นที่เกษตร', value: viirsLandUseData['พื้นที่เกษตร'] || 0, color: '#FFB6C1' },
    { name: 'ป่าสงวนแห่งชาติ', value: viirsLandUseData['ป่าสงวนแห่งชาติ'] || 0, color: '#DC143C' },
    { name: 'ชุมชนและอื่น ๆ', value: viirsLandUseData['ชุมชนและอื่น ๆ'] || 0, color: '#800000' }
  ].filter(item => item.value > 0);

  // Generate daily trend data for the last 7 days
  const generateDailyTrend = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHotspots = hotspots.filter(h => h.properties.acq_date === dateStr);
      const viirsCount = dayHotspots.filter(h => h.properties.instrument === 'VIIRS').length;
      const modisCount = dayHotspots.filter(h => h.properties.instrument === 'MODIS').length;
      
      days.push({
        date: date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' }),
        VIIRS: viirsCount,
        MODIS: modisCount,
        total: viirsCount + modisCount
      });
    }
    
    return days;
  };

  const dailyTrendData = generateDailyTrend();

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">สถิติจุดความร้อน 3 วันล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.modisCount}</div>
              <div className="text-sm text-gray-600">MODIS</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.viirsCount}</div>
              <div className="text-sm text-gray-600">VIIRS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Disaster Situation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-center">สรุปสถานการณ์ภัยพิบัติย้อนหลัง 7 วัน</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="w-full h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyTrendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  labelFormatter={(label) => `วันที่: ${label}`}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                />
                <Bar 
                  dataKey="VIIRS" 
                  stackId="a" 
                  fill="#DC2626" 
                  name="VIIRS"
                  radius={[0, 0, 0, 0]}
                />
                <Bar 
                  dataKey="MODIS" 
                  stackId="a" 
                  fill="#2563EB" 
                  name="MODIS"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* MODIS Land Use Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">จุดความร้อน MODIS ตามประเภทพื้นที่</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={modisLandUseChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {modisLandUseChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* VIIRS Land Use Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">จุดความร้อน VIIRS ตามประเภทพื้นที่</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={viirsLandUseChart}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {viirsLandUseChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default WildfireCharts;
