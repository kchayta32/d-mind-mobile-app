
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDisasterStatistics } from '@/hooks/useDisasterStatistics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, MapPin, Calendar } from 'lucide-react';

const StatisticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30days');
  const { statistics, summary, isLoading } = useDisasterStatistics(dateRange);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = statistics.reduce((acc: any[], stat) => {
    const existing = acc.find(item => item.date === stat.date);
    if (existing) {
      existing[stat.disaster_type] = (existing[stat.disaster_type] || 0) + stat.count;
    } else {
      acc.push({
        date: stat.date,
        [stat.disaster_type]: stat.count
      });
    }
    return acc;
  }, []).slice(0, 10);

  // Province data for pie chart
  const provinceData = statistics.reduce((acc: Record<string, number>, stat) => {
    acc[stat.province] = (acc[stat.province] || 0) + stat.count;
    return acc;
  }, {});

  const pieData = Object.entries(provinceData).map(([province, count]) => ({
    name: province,
    value: count
  })).slice(0, 5);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดสถิติภัยพิบัติ</h1>
          <p className="text-gray-600">ภาพรวมสถานการณ์ภัยพิบัติในประเทศไทย</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="เลือกช่วงเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
            <SelectItem value="30days">30 วันที่ผ่านมา</SelectItem>
            <SelectItem value="1year">1 ปีที่ผ่านมา</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">เหตุการณ์ทั้งหมด</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalIncidents}</div>
              <p className="text-xs text-gray-600">เหตุการณ์ในช่วงเวลาที่เลือก</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">จังหวัดที่ได้รับผลกระทบมากที่สุด</CardTitle>
              <MapPin className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.mostAffectedProvince}</div>
              <p className="text-xs text-gray-600">อิงจากจำนวนเหตุการณ์</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ภัยพิบัติที่พบมากที่สุด</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.mostCommonDisaster}</div>
              <p className="text-xs text-gray-600">ประเภทภัยพิบัติ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">แนวโน้ม</CardTitle>
              {getTrendIcon(summary.recentTrend)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getTrendColor(summary.recentTrend)}`}>
                {summary.recentTrend === 'increasing' ? 'เพิ่มขึ้น' : 
                 summary.recentTrend === 'decreasing' ? 'ลดลง' : 'คงที่'}
              </div>
              <p className="text-xs text-gray-600">เทียบกับช่วงก่อนหน้า</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มเหตุการณ์ตามวันที่</CardTitle>
            <CardDescription>จำนวนเหตุการณ์ภัยพิบัติแยกตามประเภท</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="earthquake" stroke="#8884d8" name="แผ่นดินไหว" />
                <Line type="monotone" dataKey="flood" stroke="#82ca9d" name="น้ำท่วม" />
                <Line type="monotone" dataKey="wildfire" stroke="#ffc658" name="ไฟป่า" />
                <Line type="monotone" dataKey="airpollution" stroke="#ff7300" name="มลพิษอากาศ" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Province Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>การกระจายตามจังหวัด</CardTitle>
            <CardDescription>จังหวัดที่ได้รับผลกระทบมากที่สุด 5 อันดับแรก</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>สถิติรายละเอียดตามประเภท</CardTitle>
          <CardDescription>จำนวนเหตุการณ์แยกตามประเภทภัยพิบัติ</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="earthquake" fill="#8884d8" name="แผ่นดินไหว" />
              <Bar dataKey="flood" fill="#82ca9d" name="น้ำท่วม" />
              <Bar dataKey="wildfire" fill="#ffc658" name="ไฟป่า" />
              <Bar dataKey="airpollution" fill="#ff7300" name="มลพิษอากาศ" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsDashboard;
