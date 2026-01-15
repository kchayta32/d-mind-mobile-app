import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, RefreshCw, Loader2, Thermometer, Droplets, Wind } from 'lucide-react';
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
    useTMDDailyWeatherData,
    useTMDDailyWeatherByRegion,
    weatherConditions,
    formatDailyDate,
    formatShortDate,
    DailyForecast,
    THAI_REGIONS
} from '@/hooks/useTMDDailyWeatherData';
import { useIsMobile } from '@/hooks/use-mobile';

const DailyWeatherForecast: React.FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [selectedRegion, setSelectedRegion] = useState<string>('current');

    // Use region hook if region selected (and not 'current'), otherwise use coordinates
    const isRegionSelected = selectedRegion && selectedRegion !== 'current';
    const coordinateQuery = useTMDDailyWeatherData();
    const regionQuery = useTMDDailyWeatherByRegion(isRegionSelected ? selectedRegion : '');

    // Select the active query based on whether region is selected
    const activeQuery = isRegionSelected ? regionQuery : coordinateQuery;
    const { data, isLoading, error, refetch, isRefetching } = activeQuery;

    const getConditionInfo = (condCode: number) => {
        return weatherConditions[condCode] || weatherConditions[1];
    };

    // Region selector component for reuse
    const RegionSelector = ({ className = "" }: { className?: string }) => (
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className={`bg-white/90 dark:bg-slate-800/90 border-0 rounded-xl shadow-lg ${className}`}>
                <MapPin className="w-4 h-4 mr-2 text-orange-500" />
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
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-24">
                {/* Header */}
                <header className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white pt-6 pb-8 px-5 rounded-b-3xl shadow-xl">
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
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">พยากรณ์อากาศ 7 วัน</h1>
                                <p className="text-white/70 text-xs">รายวัน จากกรมอุตุฯ</p>
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
                        className="w-full bg-white dark:bg-slate-800 text-orange-600 hover:bg-orange-50 shadow-lg rounded-2xl py-3"
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
                <main className="px-4 pt-5 space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-4" />
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
                        data?.forecasts.map((forecast, idx) => {
                            const condition = getConditionInfo(forecast.data.cond);
                            const isToday = idx === 0;
                            return (
                                <Card
                                    key={idx}
                                    className={`rounded-2xl shadow-sm border-0 overflow-hidden ${isToday
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                                        : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur'
                                        }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{condition.icon}</span>
                                                <div>
                                                    <p className={`font-semibold ${isToday ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                                                        {isToday ? 'วันนี้' : formatShortDate(forecast.time)}
                                                    </p>
                                                    <p className={`text-xs ${isToday ? 'text-white/80' : condition.color}`}>
                                                        {condition.label}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-xl font-bold ${isToday ? 'text-white' : 'text-red-500'}`}>
                                                        {forecast.data.tc_max.toFixed(0)}°
                                                    </span>
                                                    <span className={`text-lg ${isToday ? 'text-white/70' : 'text-blue-500'}`}>
                                                        / {forecast.data.tc_min.toFixed(0)}°
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-2 text-xs ${isToday ? 'text-white/80' : 'text-gray-500'}`}>
                                                    <span className="flex items-center gap-0.5">
                                                        <Droplets className="h-3 w-3" />
                                                        {forecast.data.rh}%
                                                    </span>
                                                    {forecast.data.rain > 0 && (
                                                        <span className="text-blue-400">
                                                            ฝน {forecast.data.rain.toFixed(0)}mm
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}

                    {/* Legend */}
                    <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-700">
                        <CardContent className="py-4">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">คำอธิบาย</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 font-bold">สูง°</span>
                                    <span className="text-gray-600 dark:text-gray-300">อุณหภูมิสูงสุด</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500 font-bold">ต่ำ°</span>
                                    <span className="text-gray-600 dark:text-gray-300">อุณหภูมิต่ำสุด</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Droplets className="h-3 w-3 text-blue-400" />
                                    <span className="text-gray-600 dark:text-gray-300">ความชื้น</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500">ฝน mm</span>
                                    <span className="text-gray-600 dark:text-gray-300">ปริมาณฝน 24 ชม.</span>
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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-8">
            <div className="max-w-4xl mx-auto">
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
                            <h1 className="text-2xl font-bold text-gray-800">พยากรณ์อากาศ 7 วัน</h1>
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
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                ) : error ? (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="py-8 text-center">
                            <p className="text-red-600 mb-4">{(error as Error).message}</p>
                            <Button onClick={() => refetch()}>ลองใหม่</Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data?.forecasts.map((forecast, idx) => {
                            const condition = getConditionInfo(forecast.data.cond);
                            const isToday = idx === 0;
                            return (
                                <Card
                                    key={idx}
                                    className={`${isToday ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white col-span-full md:col-span-2 lg:col-span-3' : ''}`}
                                >
                                    <CardContent className={`p-6 ${isToday ? '' : ''}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className={`${isToday ? 'text-5xl' : 'text-4xl'}`}>{condition.icon}</span>
                                                <div>
                                                    <p className={`font-bold ${isToday ? 'text-xl text-white' : 'text-lg text-gray-800'}`}>
                                                        {isToday ? 'วันนี้' : formatDailyDate(forecast.time)}
                                                    </p>
                                                    <p className={`${isToday ? 'text-white/80' : condition.color}`}>
                                                        {condition.label}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-3xl font-bold ${isToday ? 'text-white' : 'text-red-500'}`}>
                                                        {forecast.data.tc_max.toFixed(0)}°
                                                    </span>
                                                    <span className={`text-2xl ${isToday ? 'text-white/70' : 'text-blue-500'}`}>
                                                        / {forecast.data.tc_min.toFixed(0)}°
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-3 text-sm mt-1 ${isToday ? 'text-white/80' : 'text-gray-500'}`}>
                                                    <span className="flex items-center gap-1">
                                                        <Droplets className="h-4 w-4" />
                                                        {forecast.data.rh}%
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Wind className="h-4 w-4" />
                                                        {forecast.data.ws10m.toFixed(1)} m/s
                                                    </span>
                                                    {forecast.data.rain > 0 && (
                                                        <span className="text-blue-400">
                                                            ฝน {forecast.data.rain.toFixed(1)}mm
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                <p className="text-center text-sm text-gray-400 mt-6">
                    ข้อมูลพยากรณ์อากาศจาก กรมอุตุนิยมวิทยา (Thai Meteorological Department)
                </p>
            </div>
        </div>
    );
};

export default DailyWeatherForecast;
