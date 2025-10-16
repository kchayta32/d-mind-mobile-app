import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Droplet, Mountain, Flame } from 'lucide-react';
import { useDailyDisasterStats } from '@/hooks/useDailyDisasterStats';

const DailyStatsCard: React.FC = () => {
  const { stats, isLoading } = useDailyDisasterStats();

  const statItems = [
    {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      count: stats.earthquakes,
      labelTh: 'แผ่นดินไหว',
      labelEn: 'Earthquakes',
      color: 'text-yellow-600'
    },
    {
      icon: <Droplet className="w-6 h-6 text-blue-600" />,
      count: stats.floods,
      labelTh: 'น้ำท่วม',
      labelEn: 'Floods',
      color: 'text-blue-600'
    },
    {
      icon: <Mountain className="w-6 h-6 text-orange-600" />,
      count: stats.landslides,
      labelTh: 'ดินถล่ม',
      labelEn: 'Landslides',
      color: 'text-orange-600'
    },
    {
      icon: <Flame className="w-6 h-6 text-red-600" />,
      count: stats.wildfires,
      labelTh: 'ไฟป่า',
      labelEn: 'Wildfires',
      color: 'text-red-600'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
            สถิติภัยพิบัติวันนี้
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Daily Disaster Statistics
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            รีเซ็ตทุก 0:00 น. • Resets at midnight
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-700">
                  {item.icon}
                </div>
                <div className={`text-3xl font-bold ${item.color}`}>
                  {isLoading ? '-' : item.count}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {item.labelTh}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.labelEn}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStatsCard;
