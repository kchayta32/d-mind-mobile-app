import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, MapPin, RefreshCw, Loader2, Thermometer, Droplets, Wind, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useTMDWeatherData,
    useTMDWeatherByRegion,
    weatherConditions,
    getWindDirection,
    formatTime,
    formatDate,
    HourlyForecast,
    THAI_REGIONS
} from '@/hooks/useTMDWeatherData';
import { useIsMobile } from '@/hooks/use-mobile';

const WeatherForecast: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [selectedRegion, setSelectedRegion] = useState<string>('current');

    // Use region hook if region selected (and not 'current'), otherwise use coordinates
    const isRegionSelected = selectedRegion && selectedRegion !== 'current';
    const coordinateQuery = useTMDWeatherData();
    const regionQuery = useTMDWeatherByRegion(isRegionSelected ? selectedRegion : '');

    // Select the active query based on whether region is selected
    const activeQuery = isRegionSelected ? regionQuery : coordinateQuery;
    const { data, isLoading, error, refetch, isRefetching } = activeQuery;

    // Group forecasts by date
    const groupedForecasts = React.useMemo(() => {
        if (!data?.forecasts) return {};

        return data.forecasts.reduce((acc, forecast) => {
            const dateKey = formatDate(forecast.time);
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(forecast);
            return acc;
        }, {} as Record<string, HourlyForecast[]>);
    }, [data]);

    const getConditionInfo = (condCode: number) => {
        return weatherConditions[condCode] || weatherConditions[1];
    };

    // Region selector component for reuse
    const RegionSelector = ({ className = "" }: { className?: string }) => (
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className={`bg-white/90 dark:bg-slate-800/90 border-0 rounded-xl shadow-lg ${className}`}>
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                <SelectValue placeholder="เลือกภูมิภาค" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
                {THAI_REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value} className="py-3">
                        <div>
                            <div className="font-medium">{region.label}</div>
                            <div className="text-xs text-gray-500">{region.description}</div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    if (isMobile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
                {/* Header */}
                <header className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white/90 hover:bg-white/20 rounded-xl"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Cloud className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">พยากรณ์อากาศ</h1>
                                <p className="text-white/70 text-xs">รายชั่วโมง จากกรมอุตุฯ</p>
                            </div>
                        </div>
                    </div>

                    {data?.location && (
                        <div className="flex items-center gap-2 mt-4 text-white/90">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">
                                {data.location.tambon && `${data.location.tambon}, `}
                                {data.location.amphoe && `${data.location.amphoe}, `}
                                {data.location.province}
                            </span>
                        </div>
                    )}
                </header>

                {/* Refresh Button */}
                <div className="px-4 -mt-4">
                    <Button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="w-full bg-white dark:bg-slate-800 text-blue-600 hover:bg-blue-50 shadow-lg rounded-2xl py-3"
                    >
                        {isRefetching ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        อัปเดตข้อมูล
                    </Button>
                </div>

                {/* Region Selector */}
                <div className="px-4 mt-3">
                    <RegionSelector className="w-full" />
                </div>

                {/* Content */}
                <main className="px-4 pt-5 space-y-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                            <p className="text-gray-500">กำลังโหลดข้อมูลพยากรณ์อากาศ...</p>
                        </div>
                    ) : error ? (
                        <Card className="border-red-200 bg-red-50">
                            <CardContent className="py-6 text-center">
                                <p className="text-red-600 mb-4">{(error as Error).message}</p>
                                <Button onClick={() => refetch()} variant="outline">
                                    ลองใหม่อีกครั้ง
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(groupedForecasts).map(([date, forecasts]: [string, HourlyForecast[]]) => (
                            <Card key={date} className="rounded-2xl shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold text-blue-700 dark:text-blue-300">
                                        {date}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-blue-50 dark:bg-slate-700">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300">เวลา</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">สภาพ</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                                        <Thermometer className="h-3 w-3 inline" />
                                                    </th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                                        <Droplets className="h-3 w-3 inline" />
                                                    </th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">
                                                        <Wind className="h-3 w-3 inline" />
                                                    </th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300">ฝน</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-slate-600">
                                                {forecasts.map((forecast, idx) => {
                                                    const condition = getConditionInfo(forecast.data.cond);
                                                    return (
                                                        <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50">
                                                            <td className="px-3 py-2.5 font-medium">{formatTime(forecast.time)}</td>
                                                            <td className="px-3 py-2.5 text-center">
                                                                <span className="text-lg" title={condition.label}>{condition.icon}</span>
                                                            </td>
                                                            <td className={`px-3 py-2.5 text-center font-semibold ${forecast.data.tc > 35 ? 'text-red-500' : forecast.data.tc < 25 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-200'}`}>
                                                                {forecast.data.tc.toFixed(1)}°
                                                            </td>
                                                            <td className="px-3 py-2.5 text-center text-blue-600">{forecast.data.rh}%</td>
                                                            <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-300">
                                                                {forecast.data.ws10m.toFixed(1)}
                                                            </td>
                                                            <td className={`px-3 py-2.5 text-center ${forecast.data.rain > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                                                                {forecast.data.rain > 0 ? `${forecast.data.rain.toFixed(1)}` : '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}

                    {/* Legend */}
                    <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-slate-800 dark:to-slate-700">
                        <CardContent className="py-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">คำอธิบาย</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <Thermometer className="h-3 w-3 text-red-400" />
                                    <span className="text-gray-600 dark:text-gray-300">อุณหภูมิ (°C)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Droplets className="h-3 w-3 text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">ความชื้น (%)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wind className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-300">ลม (m/s)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500">ฝน</span>
                                    <span className="text-gray-600 dark:text-gray-300">ปริมาณฝน (mm)</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attribution */}
                    <p className="text-center text-xs text-gray-400 pb-4">
                        ข้อมูลจาก กรมอุตุนิยมวิทยา (TMD)
                    </p>
                </main>
            </div>
        );
    }

    // Desktop layout
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            กลับหน้าหลัก
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">พยากรณ์อากาศรายชั่วโมง</h1>
                            {data?.location && (
                                <p className="text-gray-500 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {data.location.province}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <RegionSelector className="w-64" />
                        <Button onClick={() => refetch()} disabled={isRefetching}>
                            {isRefetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                            อัปเดต
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : error ? (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-8 text-center">
                            <p className="text-red-600 mb-4">{(error as Error).message}</p>
                            <Button onClick={() => refetch()}>ลองใหม่</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="shadow-lg">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-blue-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">วันที่/เวลา</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">สภาพอากาศ</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">อุณหภูมิ (°C)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">ความชื้น (%)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">ลม (m/s)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">ทิศลม</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">เมฆต่ำ (%)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">ฝน (mm)</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">ความกด (hPa)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {data?.forecasts.map((forecast, idx) => {
                                            const condition = getConditionInfo(forecast.data.cond);
                                            return (
                                                <tr key={idx} className="hover:bg-blue-50/50">
                                                    <td className="px-6 py-3">
                                                        <div className="font-medium">{formatDate(forecast.time)}</div>
                                                        <div className="text-sm text-gray-500">{formatTime(forecast.time)}</div>
                                                    </td>
                                                    <td className="px-6 py-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span className="text-2xl">{condition.icon}</span>
                                                            <span className={`text-sm ${condition.color}`}>{condition.label}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-6 py-3 text-center font-semibold ${forecast.data.tc > 35 ? 'text-red-500' : forecast.data.tc < 25 ? 'text-blue-500' : ''}`}>
                                                        {forecast.data.tc.toFixed(1)}
                                                    </td>
                                                    <td className="px-6 py-3 text-center text-blue-600">{forecast.data.rh}</td>
                                                    <td className="px-6 py-3 text-center">{forecast.data.ws10m.toFixed(1)}</td>
                                                    <td className="px-6 py-3 text-center text-gray-600">{getWindDirection(forecast.data.wd10m)}</td>
                                                    <td className="px-6 py-3 text-center text-gray-500">{forecast.data.cloudlow}</td>
                                                    <td className={`px-6 py-3 text-center ${forecast.data.rain > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                                                        {forecast.data.rain > 0 ? forecast.data.rain.toFixed(1) : '-'}
                                                    </td>
                                                    <td className="px-6 py-3 text-center text-gray-500">{forecast.data.slp.toFixed(0)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <p className="text-center text-sm text-gray-400 mt-6">
                    ข้อมูลพยากรณ์อากาศจาก กรมอุตุนิยมวิทยา (Thai Meteorological Department)
                </p>
            </div>
        </div>
    );
};

export default WeatherForecast;
