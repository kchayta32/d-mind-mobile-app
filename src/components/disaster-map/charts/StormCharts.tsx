import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StormData, StormStats } from '../types';
import { Wind, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StormChartsProps {
  storms: StormData[];
  stats: StormStats | null;
}

export const StormCharts: React.FC<StormChartsProps> = ({ storms, stats }) => {
  if (!storms || storms.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Wind className="w-4 h-4 text-purple-600" />
            <span>สถานการณ์พายุหมุนเขตร้อน</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>ขณะนี้ไม่พบพายุหมุนเขตร้อนที่มีความรุนแรงในระยะประชิด</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chart data: Wind speeds by storm
  const chartData = storms.map(s => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
    wind: s.windSpeedKmH,
    category: s.category,
    alert: s.alertLevel
  })).sort((a, b) => b.wind - a.wind);

  const getBarColor = (alert: string) => {
    if (alert === 'Red') return '#ef4444';
    if (alert === 'Orange') return '#f97316';
    return '#3b82f6';
  };

  return (
    <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-800 dark:text-slate-100">
          <span className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-purple-600" />
            <span>เปรียบเทียบความเร็วลมพายุ ({storms.length} ลูก)</span>
          </span>
          <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200">
            NASA & GDACS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Bar Chart */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} unit=" km/h" />
              <Tooltip
                formatter={(val: any) => [`${val} กม./ชม.`, 'ความเร็วลมสูงสุด']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#1e293b'
                }}
              />
              <Bar dataKey="wind" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.alert)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Storm List */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {storms.map((storm) => (
            <div
              key={storm.id}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{storm.name}</span>
                  <Badge
                    variant={storm.alertLevel === 'Red' ? 'destructive' : 'secondary'}
                    className={`text-[10px] py-0 px-1.5 ${
                      storm.alertLevel === 'Orange' ? 'bg-orange-500 text-white' : ''
                    }`}
                  >
                    {storm.category}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  ความเร็วลม {storm.windSpeedKmH} กม./ชม. | ความกดอากาศ {storm.pressureHPa} hPa
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <span>{storm.source}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StormCharts;
