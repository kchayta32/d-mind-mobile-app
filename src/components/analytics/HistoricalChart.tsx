
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useHistoricalData, DateRange } from '@/hooks/useHistoricalData';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import {
    Calendar,
    Download,
    TrendingUp,
    AlertTriangle,
    FileText,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

const DISASTER_COLORS: Record<string, string> = {
    earthquake: '#F97316',
    flood: '#3B82F6',
    wildfire: '#EF4444',
    storm: '#8B5CF6',
    landslide: '#D97706',
    other: '#6B7280'
};

const DISASTER_LABELS: Record<string, string> = {
    earthquake: 'แผ่นดินไหว',
    flood: 'น้ำท่วม',
    wildfire: 'ไฟป่า',
    storm: 'พายุ',
    landslide: 'ดินถล่ม',
    other: 'อื่นๆ'
};

const SEVERITY_COLORS = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

interface HistoricalChartProps {
    className?: string;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ className }) => {
    const {
        dateRange,
        setDateRange,
        startDate,
        endDate,
        isLoading,
        processedData,
        exportData,
        exportCSV
    } = useHistoricalData();

    return (
        <div className={className}>
            {/* Controls */}
            <Card className="mb-4">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-700">ช่วงเวลา:</span>
                            <Select
                                value={dateRange}
                                onValueChange={(v) => setDateRange(v as DateRange)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">7 วัน</SelectItem>
                                    <SelectItem value="30d">30 วัน</SelectItem>
                                    <SelectItem value="90d">90 วัน</SelectItem>
                                    <SelectItem value="1y">1 ปี</SelectItem>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-gray-500">
                                {format(startDate, 'd MMM yyyy', { locale: th })} - {format(endDate, 'd MMM yyyy', { locale: th })}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={exportCSV}>
                                <FileText className="h-4 w-4 mr-1.5" />
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportData}>
                                <Download className="h-4 w-4 mr-1.5" />
                                JSON
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700">
                            {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : processedData.totalIncidents}
                        </div>
                        <div className="text-sm text-blue-600">รายงานทั้งหมด</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-amber-700">{processedData.totalAlerts}</div>
                        <div className="text-sm text-amber-600">การแจ้งเตือน</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-700">{processedData.resolvedIncidents}</div>
                        <div className="text-sm text-green-600">แก้ไขแล้ว</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-700">
                            {processedData.totalIncidents > 0
                                ? Math.round((processedData.resolvedIncidents / processedData.totalIncidents) * 100)
                                : 0}%
                        </div>
                        <div className="text-sm text-purple-600">อัตราแก้ไข</div>
                    </CardContent>
                </Card>
            </div>

            {/* Time Series Chart */}
            <Card className="mb-4">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        แนวโน้มรายงานรายวัน
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={processedData.timeSeries}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => format(new Date(value), 'd/M')}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    labelFormatter={(value) => format(new Date(value), 'd MMM yyyy', { locale: th })}
                                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="incidents"
                                    name="รายงาน"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="alerts"
                                    name="แจ้งเตือน"
                                    stroke="#F97316"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Type Breakdown */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            ประเภทภัยพิบัติ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-[250px] flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : processedData.typeBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={processedData.typeBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${DISASTER_LABELS[name] || name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        labelLine={false}
                                    >
                                        {processedData.typeBreakdown.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={DISASTER_COLORS[entry.name] || DISASTER_COLORS.other}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [value, DISASTER_LABELS[name as string] || name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-gray-500">
                                ไม่มีข้อมูล
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Severity Distribution */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">การกระจายระดับความรุนแรง</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-[250px] flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={processedData.severityDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="level"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(v) => `ระดับ ${v}`}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={(value) => [value, 'จำนวน']}
                                        labelFormatter={(value) => `ระดับความรุนแรง ${value}`}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {processedData.severityDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={SEVERITY_COLORS[entry.level - 1]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HistoricalChart;
