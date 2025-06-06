
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { GISTDAHotspot, WildfireStats } from './useGISTDAData';

interface WildfireChartsProps {
  hotspots: GISTDAHotspot[];
  stats: WildfireStats;
}

export const WildfireCharts: React.FC<WildfireChartsProps> = ({ hotspots, stats }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#DC2626'; // High confidence - Red
    if (confidence >= 60) return '#EA580C'; // Medium-high confidence - Orange
    if (confidence >= 40) return '#EAB308'; // Medium confidence - Yellow
    return '#65A30D'; // Low confidence - Green
  };

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">สถิติไฟป่าโดยรวม</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.totalHotspots}</div>
              <div className="text-sm text-gray-600">จุดความร้อนทั้งหมด</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{stats.last24Hours}</div>
              <div className="text-sm text-gray-600">24 ชั่วโมงที่ผ่านมา</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-purple-600">{stats.highConfidence}</div>
              <div className="text-sm text-gray-600">ความเชื่อมั่นสูง</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">{stats.averageConfidence}%</div>
              <div className="text-sm text-gray-600">ความเชื่อมั่นเฉลี่ย</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thailand vs International Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">สถิติแยกตามภูมิภาค</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="thailand" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="thailand">ประเทศไทย</TabsTrigger>
              <TabsTrigger value="international">ต่างประเทศ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="thailand" className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-xl font-bold text-green-600">{stats.thailand.totalHotspots}</div>
                  <div className="text-sm text-gray-600">จุดความร้อน</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{stats.thailand.averageConfidence}%</div>
                  <div className="text-sm text-gray-600">ความเชื่อมั่นเฉลี่ย</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{stats.thailand.byProvince.length}</div>
                  <div className="text-sm text-gray-600">จังหวัดที่พบ</div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.thailand.byProvince.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                    fontSize={10}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value, 'จุดความร้อน']}
                    labelFormatter={(label) => `จังหวัด${label}`}
                  />
                  <Bar dataKey="count" name="จุดความร้อน" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="international" className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-xl font-bold text-red-600">{stats.international.totalHotspots}</div>
                  <div className="text-sm text-gray-600">จุดความร้อน</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-600">{stats.international.averageConfidence}%</div>
                  <div className="text-sm text-gray-600">ความเชื่อมั่นเฉลี่ย</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-blue-600">{stats.international.byCountry.length}</div>
                  <div className="text-sm text-gray-600">ประเทศที่พบ</div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.international.byCountry.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [value, 'จุดความร้อน']}
                    labelFormatter={(label) => `ประเทศ ${label}`}
                  />
                  <Bar dataKey="count" name="จุดความร้อน" fill="#EA580C" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">การกระจายตามระดับความเชื่อมั่น</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { confidence: 'สูง (80%+)', count: hotspots.filter(h => h.CONFIDENCE >= 80).length },
                { confidence: 'ปานกลาง-สูง (60-79%)', count: hotspots.filter(h => h.CONFIDENCE >= 60 && h.CONFIDENCE < 80).length },
                { confidence: 'ปานกลาง (40-59%)', count: hotspots.filter(h => h.CONFIDENCE >= 40 && h.CONFIDENCE < 60).length },
                { confidence: 'ต่ำ (<40%)', count: hotspots.filter(h => h.CONFIDENCE < 40).length }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="confidence" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                fontSize={10}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" name="จำนวน">
                {[
                  { confidence: 'สูง (80%+)', count: hotspots.filter(h => h.CONFIDENCE >= 80).length },
                  { confidence: 'ปานกลาง-สูง (60-79%)', count: hotspots.filter(h => h.CONFIDENCE >= 60 && h.CONFIDENCE < 80).length },
                  { confidence: 'ปานกลาง (40-59%)', count: hotspots.filter(h => h.CONFIDENCE >= 40 && h.CONFIDENCE < 60).length },
                  { confidence: 'ต่ำ (<40%)', count: hotspots.filter(h => h.CONFIDENCE < 40).length }
                ].map((entry, index) => {
                  const colors = ['#DC2626', '#EA580C', '#EAB308', '#65A30D'];
                  return <Cell key={`cell-${index}`} fill={colors[index]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Distribution */}
      {stats.timeDistribution && stats.timeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">การกระจายตามช่วงเวลา</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.timeDistribution.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time"
                  interval={0}
                  fontSize={10}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'จุดความร้อน']}
                  labelFormatter={(label) => `เวลา ${label}`}
                />
                <Bar dataKey="count" name="จุดความร้อน" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WildfireCharts;
