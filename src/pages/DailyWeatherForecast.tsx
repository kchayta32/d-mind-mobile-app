import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Calendar, 
    MapPin, 
    RefreshCw, 
    Loader2, 
    Thermometer, 
    Droplets, 
    Wind,
    CloudRain,
    Compass,
    Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { getWindDirection } from '@/hooks/useTMDWeatherData';

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
            <SelectTrigger className={`bg-slate-900/50 border border-slate-800/80 rounded-xl shadow-lg focus:ring-1 focus:ring-amber-500 text-slate-200 backdrop-blur-md transition-all ${className}`}>
                <MapPin className="w-4 h-4 mr-2 text-amber-500" />
                <SelectValue placeholder="เลือกภูมิภาค" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950/95 border border-slate-800 text-slate-200 rounded-xl backdrop-blur-md">
                {THAI_REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value} className="py-2.5 hover:bg-slate-900 focus:bg-slate-900 text-slate-200 cursor-pointer">
                        <div>
                            <div className="font-medium text-slate-200">{region.label}</div>
                            <div className="text-[10px] text-slate-400">{region.description}</div>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    // Weather condition theme color helper
    const getConditionStyle = (condCode: number) => {
        switch (condCode) {
            case 1:
            case 12:
                return {
                    bg: 'from-amber-500/10 via-yellow-600/5 to-transparent',
                    border: 'border-amber-500/20 hover:border-amber-500/40',
                    glow: 'shadow-[0_0_35px_rgba(245,158,11,0.12)]',
                    accent: 'text-amber-400',
                    badgeBg: 'bg-amber-500/15 border-amber-500/25 text-amber-300'
                };
            case 8:
                return {
                    bg: 'from-purple-600/15 via-fuchsia-600/5 to-transparent',
                    border: 'border-purple-500/20 hover:border-purple-500/40',
                    glow: 'shadow-[0_0_35px_rgba(168,85,247,0.12)]',
                    accent: 'text-purple-400',
                    badgeBg: 'bg-purple-500/15 border-purple-500/25 text-purple-300'
                };
            case 5:
            case 6:
            case 7:
                return {
                    bg: 'from-blue-600/10 via-indigo-600/5 to-transparent',
                    border: 'border-blue-500/20 hover:border-blue-500/40',
                    glow: 'shadow-[0_0_35px_rgba(59,130,246,0.12)]',
                    accent: 'text-blue-400',
                    badgeBg: 'bg-blue-500/15 border-blue-500/25 text-blue-300'
                };
            default:
                return {
                    bg: 'from-slate-800/20 via-slate-900/5 to-transparent',
                    border: 'border-slate-800/80 hover:border-slate-700',
                    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.03)]',
                    accent: 'text-amber-400',
                    badgeBg: 'bg-slate-800/45 border-slate-700/50 text-slate-300'
                };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-slate-100 font-sans">
                {/* Ambient Glow */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
                
                <div className="z-10 flex flex-col items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-900/80 p-8 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.12)] text-center max-w-sm mx-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-400/25 rounded-full blur-md animate-ping" />
                        <Loader2 className="h-10 w-10 animate-spin text-amber-500 relative z-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mt-2">กำลังเชื่อมต่อข้อมูลพยากรณ์รายวัน</h3>
                    <p className="text-sm text-slate-400">ดึงข้อมูลพยากรณ์อากาศ 7 วันล่วงหน้าจากกรมอุตุนิยมวิทยา (TMD)...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-slate-100 font-sans">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="z-10 flex flex-col items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-red-500/20 p-8 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.15)] text-center max-w-sm mx-4">
                    <div className="p-3 bg-red-500/10 rounded-full border border-red-500/30">
                        <Calendar className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">การดึงข้อมูลรายวันล้มเหลว</h3>
                    <p className="text-sm text-slate-400">{(error as Error).message}</p>
                    <Button 
                        onClick={() => refetch()} 
                        className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all duration-300 border-0"
                    >
                        ลองใหม่อีกครั้ง
                    </Button>
                </div>
            </div>
        );
    }

    const todayForecast = data?.forecasts?.[0];
    const todayCondition = todayForecast ? getConditionInfo(todayForecast.data.cond) : weatherConditions[1];
    const todayStyle = todayForecast ? getConditionStyle(todayForecast.data.cond) : getConditionStyle(1);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans pb-16">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-orange-950/10 blur-[160px] pointer-events-none" />

            {/* Sticky Header */}
            <header className="sticky top-0 z-40 bg-slate-950/75 backdrop-blur-xl border-b border-slate-900/90 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="text-slate-400 hover:text-slate-100 hover:bg-slate-900/50 rounded-xl gap-2 border border-slate-900/50"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {!isMobile && "กลับหน้าหลัก"}
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-amber-500" />
                                <span>พยากรณ์อากาศ 7 วันล่วงหน้า</span>
                            </h1>
                            <p className="text-[11px] text-slate-400">พยากรณ์อากาศรายวันตามพิกัดดาวเทียมและภูมิภาคระบบนิเวศ</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <RegionSelector className="w-full sm:w-60" />
                        <Button 
                            onClick={() => refetch()} 
                            disabled={isRefetching}
                            className="bg-slate-900/60 border border-slate-800 hover:bg-slate-850 text-slate-200 rounded-xl px-4 py-2 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all duration-300"
                        >
                            {isRefetching ? (
                                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                            ) : (
                                <RefreshCw className="h-4 w-4 text-amber-500" />
                            )}
                            <span>อัปเดตข้อมูล</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="space-y-6">
                    {/* Location Info Banner */}
                    {data?.location && (
                        <div className="flex items-center gap-1.5 text-amber-400/90 text-xs bg-amber-950/20 border border-amber-500/20 px-3.5 py-1.5 rounded-full w-fit shadow-[0_0_10px_rgba(245,158,11,0.08)]">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>พื้นที่พยากรณ์อากาศ: </span>
                            <strong className="text-slate-200 font-semibold">
                                {data.location.tambon ? `ต.${data.location.tambon}, ` : ''}
                                {data.location.amphoe ? `อ.${data.location.amphoe}, ` : ''}
                                {data.location.province}
                            </strong>
                        </div>
                    )}

                    {/* Today's Big Glassmorphic Highlight Card */}
                    {todayForecast && (
                        <div className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl bg-gradient-to-br ${todayStyle.bg} ${todayStyle.border} ${todayStyle.glow} p-6 md:p-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] group`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 group-hover:scale-110" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
                                <div className="space-y-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${todayStyle.badgeBg}`}>
                                        สภาพอากาศวันนี้
                                    </span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-100 to-slate-200">
                                            {todayForecast.data.tc_max.toFixed(0)}
                                        </span>
                                        <span className="text-3xl text-amber-500 font-bold">°C</span>
                                        <span className="text-xl text-slate-400 px-2 font-light">/ {todayForecast.data.tc_min.toFixed(0)}°C</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-5xl leading-none">{todayCondition.icon}</span>
                                        <div>
                                            <p className={`text-2xl font-black ${todayCondition.color}`}>{todayCondition.label}</p>
                                            <p className="text-xs text-slate-400">อุณหภูมิต่ำสุดที่เหมาะสมในรอบวัน: {todayForecast.data.tc_min.toFixed(1)}°C</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Today details grid */}
                                <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-slate-900 rounded-2xl p-4 md:p-6 backdrop-blur-md">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ความชื้นสูงสุด</span>
                                        <div className="flex items-center gap-1.5 text-slate-200">
                                            <Droplets className="h-4 w-4 text-cyan-400" />
                                            <span className="text-lg font-bold">{todayForecast.data.rh.toFixed(0)} %</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ความเร็วลมสูงสุด</span>
                                        <div className="flex items-center gap-1.5 text-slate-200">
                                            <Wind className="h-4 w-4 text-teal-400" />
                                            <span className="text-lg font-bold">{todayForecast.data.ws10m.toFixed(1)} m/s</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ทิศทางลมหลัก</span>
                                        <div className="flex items-center gap-1.5 text-slate-200">
                                            <Compass className="h-4 w-4 text-amber-400" />
                                            <span className="text-sm font-semibold">{getWindDirection(todayForecast.data.wd10m)} ({todayForecast.data.wd10m}°)</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">ปริมาณน้ำฝนสะสม</span>
                                        <div className="flex items-center gap-1.5 text-slate-200">
                                            <CloudRain className="h-4 w-4 text-blue-400" />
                                            <span className="text-lg font-bold">{todayForecast.data.rain.toFixed(1)} มม.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remaining 6 Days Grid */}
                    <div className="space-y-4">
                        <h3 className="text-base font-bold text-slate-200 px-1">แนวโน้มสภาพอากาศรายวันล่วงหน้า</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data?.forecasts.slice(1).map((forecast, idx) => {
                                const condition = getConditionInfo(forecast.data.cond);
                                const style = getConditionStyle(forecast.data.cond);
                                
                                return (
                                    <div 
                                        key={idx}
                                        className={`relative overflow-hidden rounded-2xl border bg-slate-900/30 backdrop-blur-xl p-5 border-slate-900/90 transition-all duration-300 hover:translate-y-[-4px] hover:border-slate-800 hover:shadow-[0_4px_25px_rgba(245,158,11,0.06)] group`}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none transition-all duration-500 group-hover:bg-amber-500/10" />
                                        
                                        <div className="flex flex-col h-full justify-between gap-4 relative z-10">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                                                        {formatShortDate(forecast.time)}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">
                                                        {formatDailyDate(forecast.time).split(',')[0]}
                                                    </p>
                                                </div>
                                                <span className="text-4xl leading-none" title={condition.label}>
                                                    {condition.icon}
                                                </span>
                                            </div>

                                            <div>
                                                <span className={`text-[10px] font-bold ${condition.color} bg-slate-950/50 px-2 py-0.5 rounded border border-slate-850 block w-fit mb-3`}>
                                                    {condition.label}
                                                </span>
                                                
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-extrabold text-slate-100">
                                                        {forecast.data.tc_max.toFixed(0)}°
                                                    </span>
                                                    <span className="text-sm text-slate-400">/ {forecast.data.tc_min.toFixed(0)}°C</span>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-900/80 pt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Droplets className="h-3 w-3 text-cyan-400" />
                                                    ชื้น: {forecast.data.rh.toFixed(0)}%
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Wind className="h-3 w-3 text-teal-400" />
                                                    ลม: {forecast.data.ws10m.toFixed(1)} m/s
                                                </span>
                                                {forecast.data.rain > 0 && (
                                                    <span className="col-span-2 flex items-center gap-1 text-blue-400/90 font-medium">
                                                        <CloudRain className="h-3 w-3 text-blue-400" />
                                                        ฝนสะสม: {forecast.data.rain.toFixed(1)} มม.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Explainer and Legend */}
                    <div className="bg-gradient-to-br from-slate-900/30 to-slate-950/20 backdrop-blur-xl border border-slate-900/90 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.03)] grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                                <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                                <span>อุณหภูมิสูงสุด-ต่ำสุด</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                ค่าสูงสุดจำลองอุณหภูมิในช่วงกลางวัน และค่าต่ำสุดจำลองค่าในช่วงกลางคืน ซึ่งประเมินการเปลี่ยนแปลงของอุณหภูมิที่สะสมในอากาศ
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                                <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                                <span>ความชื้นและฝนรวม</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                วัดสัดส่วนของละอองไอน้ำสัมพัทธ์ในอากาศ และการประเมินปริมาณน้ำฝนสะสมเชิงปริมาตรรวม 24 ชั่วโมง (มม.)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                                <Wind className="h-3.5 w-3.5 text-teal-400" />
                                <span>กระแสลมและเมฆสะสม</span>
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                                ความเร็วลมสูงสุดเฉลี่ย และทิศทางดักจับทางอุตุนิยมวิทยาช่วยประเมินการเคลื่อนตัวของเมฆฝนและพายุในพื้นที่
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-12 text-center text-[10px] text-slate-600">
                <p>© D-MIND Weather Terminal • พยากรณ์อากาศเชื่อมโยง API Backend Gateway & Open-Meteo Fallback</p>
            </footer>
        </div>
    );
};

export default DailyWeatherForecast;
