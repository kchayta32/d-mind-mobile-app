import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  Droplet,
  Mountain,
  Flame,
  RefreshCw,
  Clock,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useDailyDisasterStats } from '@/hooks/useDailyDisasterStats';

const DailyStatsCard: React.FC = () => {
  const {
    stats,
    hourlyTrend,
    isLoading,
    isRefetching,
    lastUpdatedText,
    refetch,
  } = useDailyDisasterStats();

  const statItems = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      count: stats.earthquakes,
      labelTh: 'แผ่นดินไหว',
      labelEn: 'Earthquakes',
      color: 'text-yellow-600 dark:text-yellow-400',
      borderHover: 'hover:border-yellow-300 dark:hover:border-yellow-700',
    },
    {
      icon: <Droplet className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      count: stats.floods,
      labelTh: 'น้ำท่วม',
      labelEn: 'Floods',
      color: 'text-blue-600 dark:text-blue-400',
      borderHover: 'hover:border-blue-300 dark:hover:border-blue-700',
    },
    {
      icon: <Mountain className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
      count: stats.landslides,
      labelTh: 'ดินถล่ม',
      labelEn: 'Landslides',
      color: 'text-orange-600 dark:text-orange-400',
      borderHover: 'hover:border-orange-300 dark:hover:border-orange-700',
    },
    {
      icon: <Flame className="w-6 h-6 text-red-600 dark:text-red-400" />,
      count: stats.wildfires,
      labelTh: 'ไฟป่า',
      labelEn: 'Wildfires',
      color: 'text-red-600 dark:text-red-400',
      borderHover: 'hover:border-red-300 dark:hover:border-red-700',
    },
  ];

  const maxHourlyCount = useMemo(() => {
    return Math.max(...hourlyTrend.map((h) => h.total), 1);
  }, [hourlyTrend]);

  const peakHour = useMemo(() => {
    if (!hourlyTrend.length) return null;
    return hourlyTrend.reduce((max, cur) => (cur.total > max.total ? cur : max), hourlyTrend[0]);
  }, [hourlyTrend]);

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <CardContent className="p-5 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200/70 dark:border-slate-700/70">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                สถิติภัยพิบัติ 24 ชั่วโมงล่าสุด
              </h3>
              <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                24h Summary
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last 24 Hours Disaster Statistics • อัพเดททุกชั่วโมง • Hourly updates
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                อัปเดตล่าสุด:{' '}
                <strong className="text-slate-700 dark:text-slate-200 font-medium">
                  {lastUpdatedText || (isLoading ? 'กำลังโหลด...' : '-')}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="h-8 px-3 text-xs gap-1.5 border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-300 ${
                  isRefetching || isLoading ? 'animate-spin text-blue-600 dark:text-blue-400' : ''
                }`}
              />
              <span>{isRefetching ? 'กำลังรีเฟรช...' : 'รีเฟรชข้อมูล'}</span>
            </Button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-slate-800/90 rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-700/60 transition-all ${item.borderHover}`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-700/70">
                  {item.icon}
                </div>
                <div className={`text-3xl font-extrabold tracking-tight ${item.color}`}>
                  {isLoading ? '-' : item.count}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.labelTh}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.labelEn}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 24-Hour Timeline / Sparkline Visualization */}
        <div className="bg-white/80 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/70 dark:border-slate-700/70 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
                การกระจายตัวของเหตุการณ์รายชั่วโมง (24 ชม. ล่าสุด)
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>
                รวมทั้งหมด:{' '}
                <strong className="text-slate-800 dark:text-slate-100">
                  {isLoading ? '-' : stats.total}
                </strong>{' '}
                เหตุการณ์
              </span>
              {peakHour && peakHour.total > 0 && (
                <span className="hidden sm:inline">
                  • สูงสุดช่วง {peakHour.hourLabel} ({peakHour.total})
                </span>
              )}
            </div>
          </div>

          {/* 24 Bars Timeline Container */}
          <TooltipProvider delayDuration={150}>
            <div className="w-full pt-2">
              <div className="h-20 flex items-end gap-1 px-1 bg-slate-50 dark:bg-slate-900/40 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                {hourlyTrend.map((bucket, idx) => {
                  const hasEvents = bucket.total > 0;
                  const ratio = hasEvents ? bucket.total / maxHourlyCount : 0;
                  // Min height 6px for visibility, max 56px
                  const barHeight = hasEvents ? Math.max(Math.round(ratio * 52), 8) : 4;

                  let barColorClass =
                    'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600';
                  if (bucket.wildfires > 0) {
                    barColorClass = 'bg-red-500 hover:bg-red-600';
                  } else if (bucket.earthquakes > 0) {
                    barColorClass = 'bg-yellow-500 hover:bg-yellow-600';
                  } else if (bucket.floods > 0) {
                    barColorClass = 'bg-blue-500 hover:bg-blue-600';
                  } else if (bucket.landslides > 0) {
                    barColorClass = 'bg-orange-500 hover:bg-orange-600';
                  } else if (hasEvents) {
                    barColorClass = 'bg-indigo-500 hover:bg-indigo-600';
                  }

                  return (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex-1 h-full flex items-end cursor-pointer group"
                          aria-label={`ชั่วโมง ${bucket.hourLabel} พบ ${bucket.total} เหตุการณ์`}
                        >
                          <div
                            style={{ height: `${barHeight}px` }}
                            className={`w-full rounded-t-sm transition-all duration-200 ${barColorClass} group-hover:scale-y-110`}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="text-xs p-2.5 bg-slate-900 text-white border-slate-700 shadow-md"
                      >
                        <div className="font-semibold text-slate-200 mb-1">
                          เวลา: {bucket.hourLabel} น.
                        </div>
                        <div className="text-[11px] space-y-0.5">
                          <div className="font-medium text-slate-100">
                            รวม: {bucket.total} เหตุการณ์
                          </div>
                          {bucket.earthquakes > 0 && (
                            <div className="text-yellow-400">
                              • แผ่นดินไหว: {bucket.earthquakes}
                            </div>
                          )}
                          {bucket.floods > 0 && (
                            <div className="text-blue-400">
                              • น้ำท่วม: {bucket.floods}
                            </div>
                          )}
                          {bucket.landslides > 0 && (
                            <div className="text-orange-400">
                              • ดินถล่ม: {bucket.landslides}
                            </div>
                          )}
                          {bucket.wildfires > 0 && (
                            <div className="text-red-400">
                              • จุดความร้อน/ไฟป่า: {bucket.wildfires}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Timeline Axis Labels */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                <span>24 ชม. ก่อน ({hourlyTrend[0]?.hourLabel || ''})</span>
                <span>12 ชม. ก่อน ({hourlyTrend[11]?.hourLabel || ''})</span>
                <span>ปัจจุบัน ({hourlyTrend[hourlyTrend.length - 1]?.hourLabel || ''})</span>
              </div>
            </div>
          </TooltipProvider>

          {/* Legend and Note */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" /> แผ่นดินไหว
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> น้ำท่วม
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> ดินถล่ม
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> ไฟป่า
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              แหล่งข้อมูล: GISTDA VIIRS / GISTDA Flood / USGS / Thai Alerts
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStatsCard;
