import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Cloud, 
    MapPin, 
    RefreshCw, 
    Loader2, 
    Thermometer, 
    Droplets, 
    Wind, 
    Compass, 
    Gauge,
    ChevronDown 
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
import {
    ResponsiveContainer,
    ComposedChart,
    Area,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';

// Helper to determine day labels like "วันนี้", "วันพรุ่งนี้"
const getDayLabel = (timeIsoString: string) => {
    const today = new Date();
    const targetDate = new Date(timeIsoString);
    
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetZero = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    const diffTime = targetZero.getTime() - todayZero.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'วันนี้';
    if (diffDays === 1) return 'วันพรุ่งนี้';
    if (diffDays === 2) return 'วันมะรืนนี้';
    
    return formatDate(timeIsoString);
};

// Helper to find the representative forecast closest to midday
const getRepresentativeForecast = (forecasts: HourlyForecast[]) => {
    const noonForecast = forecasts.find(f => {
        const hour = new Date(f.time).getHours();
        return hour >= 11 && hour <= 13;
    });
    return noonForecast || forecasts[0];
};

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

    // Group forecasts by date (as in the original code structure)
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

    // Transform forecasts into Recharts-friendly data (next 24 hours)
    const chartData = React.useMemo(() => {
        if (!data?.forecasts) return [];
        return data.forecasts.slice(0, 24).map((forecast) => ({
            time: formatTime(forecast.time),
            temp: forecast.data.tc,
            rain: forecast.data.rain,
        }));
    }, [data]);

    // Grouped daily forecast summaries for the horizontal list
    const dailyForecastsSummary = React.useMemo(() => {
        return (Object.entries(groupedForecasts) as [string, HourlyForecast[]][]).map(([dayLabel, forecasts]) => {
            const temps = forecasts.map(f => f.data.tc);
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);

            const repForecast = getRepresentativeForecast(forecasts);
            const condition = getConditionInfo(repForecast.data.cond);

            let dayDisplay = dayLabel;
            if (forecasts.length > 0) {
                dayDisplay = getDayLabel(forecasts[0].time);
            }

            return {
                dayLabel: dayDisplay,
                minTemp,
                maxTemp,
                condition,
            };
        });
    }, [groupedForecasts]);

    const currentForecast = data?.forecasts?.[0];
    const condition = currentForecast ? getConditionInfo(currentForecast.data.cond) : weatherConditions[1];

    // Compute today's min and max temperatures
    const todayForecasts = data?.forecasts.filter(f => getDayLabel(f.time) === 'วันนี้') || [];
    const todayMin = todayForecasts.length ? Math.min(...todayForecasts.map(f => f.data.tc)) : (currentForecast?.data.tc ?? 0);
    const todayMax = todayForecasts.length ? Math.max(...todayForecasts.map(f => f.data.tc)) : (currentForecast?.data.tc ?? 0);

    // Weather card dynamic style based on weather conditions
    const getConditionStyle = (condCode: number) => {
        switch (condCode) {
            case 1:
            case 12:
                return {
                    bg: 'from-amber-500/10 via-yellow-600/5 to-transparent',
                    border: 'border-amber-500/25 hover:border-amber-500/40',
                    glow: 'shadow-[0_0_35px_rgba(245,158,11,0.12)]',
                    accent: 'text-amber-455',
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
            case 9:
            case 10:
                return {
                    bg: 'from-cyan-500/10 via-teal-600/5 to-transparent',
                    border: 'border-cyan-500/20 hover:border-cyan-500/40',
                    glow: 'shadow-[0_0_35px_rgba(6,182,212,0.12)]',
                    accent: 'text-cyan-400',
                    badgeBg: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-300'
                };
            default:
                return {
                    bg: 'from-slate-800/15 via-slate-900/5 to-transparent',
                    border: 'border-slate-800/80 hover:border-slate-700',
                    glow: 'shadow-[0_0_30px_rgba(34,211,238,0.04)]',
                    accent: 'text-cyan-400',
                    badgeBg: 'bg-slate-850/50 border-slate-750/55 text-slate-300'
                };
        }
    };

    const cardStyle = currentForecast ? getConditionStyle(currentForecast.data.cond) : getConditionStyle(1);

    // Weather Statistics Configuration
    const stats = [
        {
            label: 'อุณหภูมิ',
            value: currentForecast ? `${currentForecast.data.tc.toFixed(1)} °C` : 'N/A',
            icon: Thermometer,
            iconColor: 'text-rose-400',
            glowColor: 'shadow-[0_0_15px_rgba(244,63,94,0.12)] border-rose-500/15 bg-rose-950/15',
            textColor: 'text-rose-100',
            desc: 'อุณหภูมิอากาศจริงในขณะนั้น'
        },
        {
            label: 'ความชื้นสัมพัทธ์',
            value: currentForecast ? `${currentForecast.data.rh.toFixed(0)} %` : 'N/A',
            icon: Droplets,
            iconColor: 'text-cyan-400',
            glowColor: 'shadow-[0_0_15px_rgba(6,182,212,0.12)] border-cyan-500/15 bg-cyan-950/15',
            textColor: 'text-cyan-100',
            desc: 'ความชื้นสัมพัทธ์ในชั้นบรรยากาศ'
        },
        {
            label: 'ความเร็วลม',
            value: currentForecast ? `${currentForecast.data.ws10m.toFixed(1)} m/s` : 'N/A',
            icon: Wind,
            iconColor: 'text-teal-400',
            glowColor: 'shadow-[0_0_15px_rgba(20,184,166,0.12)] border-teal-500/15 bg-teal-950/15',
            textColor: 'text-teal-100',
            desc: 'ความเร็วลมเฉลี่ยระดับผิวพื้น 10 เมตร'
        },
        {
            label: 'ทิศทางลม',
            value: currentForecast ? getWindDirection(currentForecast.data.wd10m) : 'N/A',
            icon: Compass,
            iconColor: 'text-amber-400',
            glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.12)] border-amber-500/15 bg-amber-950/15',
            textColor: 'text-amber-100',
            desc: currentForecast ? `ทางทิศวิทยาศาสตร์ (${currentForecast.data.wd10m}°)` : 'ทิศทางกระแสลมพัดตามองศา'
        },
        {
            label: 'สัดส่วนเมฆต่ำ',
            value: currentForecast ? `${currentForecast.data.cloudlow} %` : 'N/A',
            icon: Cloud,
            iconColor: 'text-sky-400',
            glowColor: 'shadow-[0_0_15px_rgba(56,189,248,0.12)] border-sky-500/15 bg-sky-950/15',
            textColor: 'text-sky-100',
            desc: 'สัดส่วนของเมฆชั้นต่ำปกคลุม'
        },
        {
            label: 'ความกดอากาศ',
            value: currentForecast ? `${currentForecast.data.slp.toFixed(0)} hPa` : 'N/A',
            icon: Gauge,
            iconColor: 'text-fuchsia-400',
            glowColor: 'shadow-[0_0_15px_rgba(217,70,239,0.12)] border-fuchsia-500/15 bg-fuchsia-950/15',
            textColor: 'text-fuchsia-100',
            desc: 'ความกดอากาศระดับน้ำทะเลปานกลาง'
        }
    ];

    // Custom tooltips for Recharts
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.8)] text-xs space-y-1.5">
                    <p className="text-slate-400 font-semibold mb-1">เวลา {label}</p>
                    {payload.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-300">{item.name}:</span>
                            <span className="font-bold text-slate-100">
                                {item.value.toFixed(1)}{item.name === 'อุณหภูมิ' ? ' °C' : ' มม.'}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Region Selector Component
    const RegionSelector = ({ className = "" }: { className?: string }) => (
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className={`bg-slate-900/50 border border-slate-800/80 rounded-xl shadow-lg focus:ring-1 focus:ring-cyan-500 text-slate-200 backdrop-blur-md transition-all ${className}`}>
                <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-slate-100 font-sans">
                {/* Background Glow */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
                
                <div className="z-10 flex flex-col items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-900/80 p-8 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] text-center max-w-sm mx-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400/25 rounded-full blur-md animate-ping" />
                        <Loader2 className="h-10 w-10 animate-spin text-cyan-400 relative z-10" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mt-2">กำลังเชื่อมต่อข้อมูลสถานีตรวจวัด</h3>
                    <p className="text-sm text-slate-400">ดึงข้อมูลพยากรณ์อากาศล่าสุดจากกรมอุตุนิยมวิทยา (TMD)...</p>
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
                        <Cloud className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200">การดึงข้อมูลล้มเหลว</h3>
                    <p className="text-sm text-slate-400">{(error as Error).message}</p>
                    <Button 
                        onClick={() => refetch()} 
                        className="mt-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 border-0"
                    >
                        ลองใหม่อีกครั้ง
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans pb-12">
            {/* Cinematic Ambient Glow Backgrounds */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />

            {/* Premium Header */}
            <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-slate-900/80 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
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
                                <Cloud className="h-5 w-5 text-cyan-400" />
                                <span>พยากรณ์อากาศระบบกึ่งอัตโนมัติ</span>
                            </h1>
                            <p className="text-[11px] text-slate-400">ดึงข้อมูลและพยากรณ์ตามพิกัดและภูมิภาคเชิงนิเวศวิทยา</p>
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
                                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                            ) : (
                                <RefreshCw className="h-4 w-4 text-cyan-400" />
                            )}
                            <span>อัปเดตข้อมูล</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left/Main Column: Hero Summary, Stats Grid, and Recharts Chart */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Current Location Badge */}
                        <div className="flex flex-col gap-2">
                            {data?.location && (
                                <div className="flex items-center gap-1.5 text-cyan-400/90 text-xs bg-cyan-950/20 border border-cyan-500/20 px-3.5 py-1.5 rounded-full w-fit shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>สถานีตรวจวัด: </span>
                                    <strong className="text-slate-200 font-semibold">
                                        {data.location.tambon ? `ต.${data.location.tambon}, ` : ''}
                                        {data.location.amphoe ? `อ.${data.location.amphoe}, ` : ''}
                                        {data.location.province}
                                    </strong>
                                </div>
                            )}
                        </div>

                        {/* Current Weather Hero Card (Dynamic condition based styling) */}
                        <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-gradient-to-br ${cardStyle.bg} ${cardStyle.border} ${cardStyle.glow} p-6 transition-all duration-500 hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-110" />
                            <div className="space-y-2.5 relative z-10">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${cardStyle.badgeBg}`}>
                                    สภาพอากาศปัจจุบัน
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-6.5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-50 via-slate-100 to-slate-200">
                                        {currentForecast?.data.tc.toFixed(1) ?? '0.0'}
                                    </span>
                                    <span className={`text-2xl font-bold ${cardStyle.accent}`}>°C</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-3.5xl leading-none">{condition.icon}</span>
                                    <span className={`text-lg font-black ${condition.color}`}>{condition.label}</span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center gap-3">
                                    <span>ต่ำสุด <strong className="text-blue-400 font-medium">{todayMin.toFixed(1)}°C</strong></span>
                                    <span className="text-slate-800">|</span>
                                    <span>สูงสุด <strong className="text-rose-400 font-medium">{todayMax.toFixed(1)}°C</strong></span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-start md:items-end text-left md:text-right justify-between md:h-full min-h-[90px] gap-2 relative z-10">
                                <div className="text-xs text-slate-500">
                                    ข้อมูลเวลา: {currentForecast ? formatTime(currentForecast.time) : '-'} น.
                                </div>
                                <div className="text-sm text-slate-350 font-semibold bg-slate-950/40 px-3.5 py-2.5 rounded-xl border border-slate-900">
                                    {data?.location.tambon ? `ต.${data.location.tambon} ` : ''}
                                    {data?.location.amphoe ? `อ.${data.location.amphoe} ` : ''}
                                    {data?.location.province ? `จ.${data.location.province}` : ''}
                                </div>
                            </div>
                        </div>

                        {/* 6 Stats Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {stats.map((stat, index) => {
                                const IconComponent = stat.icon;
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)] ${stat.glowColor}`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-semibold text-slate-450">{stat.label}</span>
                                            <div className={`p-1.5 rounded-lg bg-slate-950/60 ${stat.iconColor}`}>
                                                <IconComponent className="h-4.5 w-4.5 drop-shadow-[0_0_4px_currentColor]" />
                                            </div>
                                        </div>
                                        <div className={`text-xl font-black tracking-tight ${stat.textColor}`}>
                                            {stat.value}
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-1 leading-snug">{stat.desc}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recharts Hourly Forecast Chart */}
                        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900/90 p-5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.06)]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                                <div>
                                    <h3 className="text-base font-bold text-slate-200">กราฟพยากรณ์รายชั่วโมง</h3>
                                    <p className="text-xs text-slate-400">อุณหภูมิ (°C) และปริมาณฝนสะสม (มม.) ใน 24 ชั่วโมงข้างหน้า</p>
                                </div>
                                <div className="flex items-center gap-4 text-[11px] bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-900 w-fit">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                                        <span className="text-slate-350 font-medium">อุณหภูมิ</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]" />
                                        <span className="text-slate-350 font-medium">ปริมาณฝน</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full" style={{ height: isMobile ? 220 : 320 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorTempGlow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35}/>
                                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorRainGlow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" strokeOpacity={0.25} vertical={false} />
                                        <XAxis 
                                            dataKey="time" 
                                            stroke="#475569" 
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis 
                                            yAxisId="left"
                                            stroke="#475569" 
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={['auto', 'auto']}
                                            tickFormatter={(value) => `${value}°`}
                                            dx={-5}
                                        />
                                        <YAxis 
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#475569" 
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            domain={[0, 'auto']}
                                            tickFormatter={(value) => value > 0 ? `${value} มม.` : '0'}
                                            dx={5}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e293b', strokeWidth: 1.5 }} />
                                        <Area 
                                            yAxisId="left"
                                            type="monotone" 
                                            dataKey="temp" 
                                            name="อุณหภูมิ" 
                                            stroke="#22d3ee" 
                                            strokeWidth={2.5}
                                            fillOpacity={1} 
                                            fill="url(#colorTempGlow)" 
                                            activeDot={{ r: 6, stroke: '#020617', strokeWidth: 2, fill: '#22d3ee' }}
                                        />
                                        <Bar 
                                            yAxisId="right"
                                            dataKey="rain" 
                                            name="ปริมาณฝน" 
                                            fill="url(#colorRainGlow)" 
                                            radius={[3, 3, 0, 0]}
                                            maxBarSize={15}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Grouped Daily Forecast Rows & Info explanation */}
                    <div className="space-y-6">
                        
                        {/* Daily Forecast glass rows */}
                        <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-900/90 p-5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.06)] flex flex-col gap-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-200">แนวโน้มสภาพอากาศรายวัน</h3>
                                <p className="text-xs text-slate-400">ดึงข้อมูลจัดกลุ่มรายวันล่วงหน้า 7 วัน</p>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                {dailyForecastsSummary.map((day, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between p-4 bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-xl hover:border-cyan-500/25 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.02)] group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-slate-200 w-16 group-hover:text-cyan-400 transition-colors">
                                                {day.dayLabel}
                                            </span>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-3xl leading-none" title={day.condition.label}>
                                                    {day.condition.icon}
                                                </span>
                                                <span className={`text-xs font-semibold ${day.condition.color}`}>
                                                    {day.condition.label}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-500 block">ต่ำสุด</span>
                                                <span className="text-xs font-bold text-blue-400">{day.minTemp.toFixed(0)}°</span>
                                            </div>
                                            <div className="h-6 w-[1px] bg-slate-800" />
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-500 block">สูงสุด</span>
                                                <span className="text-xs font-bold text-rose-400">{day.maxTemp.toFixed(0)}°</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Custom Legend / Explainer Card */}
                        <div className="bg-gradient-to-br from-slate-900/30 to-slate-950/20 backdrop-blur-xl border border-slate-900/90 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.04)]">
                            <h3 className="text-sm font-bold text-slate-200 mb-3.5">คู่มือคำอธิบายดัชนีอากาศ</h3>
                            <div className="space-y-3.5 text-[11px] text-slate-400">
                                <div className="flex items-start gap-2.5">
                                    <Thermometer className="h-3.5 w-3.5 text-rose-455 mt-0.5" />
                                    <div>
                                        <span className="text-slate-300 font-semibold block">อุณหภูมิ (°C)</span>
                                        <span>อุณหภูมิจริงที่สัมผัสได้ ค่าปกติเฉลี่ย 25°C - 35°C</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Droplets className="h-3.5 w-3.5 text-cyan-400 mt-0.5" />
                                    <div>
                                        <span className="text-slate-300 font-semibold block">ความชื้นสัมพัทธ์ (%)</span>
                                        <span>ปริมาณไอน้ำสัมพัทธ์ในอากาศ ค่าปกติคือ 60% - 80%</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Wind className="h-3.5 w-3.5 text-teal-400 mt-0.5" />
                                    <div>
                                        <span className="text-slate-300 font-semibold block">ความเร็วลม (m/s)</span>
                                        <span>วัดอัตราความเร็วกระแสลมพัดเฉลี่ยระดับความสูง 10 เมตร</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Footer Attribution */}
            <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-8 text-center text-[10px] text-slate-650">
                <p>© D-MIND Weather Terminal • ข้อมูลประมวลผลและเชื่อมโยง API โดย กรมอุตุนิยมวิทยา (TMD) และ Open-Meteo Fallback</p>
            </footer>
        </div>
    );
};

export default WeatherForecast;
