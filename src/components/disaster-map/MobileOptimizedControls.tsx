import React from 'react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Filter,
  Map as MapIcon,
  Layers,
  ChevronUp
} from 'lucide-react';
import { DisasterType } from './types';


interface MobileOptimizedControlsProps {
  selectedType: DisasterType;
  onTypeChange: (type: DisasterType) => void;
  filters: React.ReactNode;
  stats: React.ReactNode;
  className?: string;
}

const DISASTER_TYPES: { type: DisasterType; label: string; icon: string; color: string; darkColor: string }[] = [
  { type: 'earthquake', label: 'แผ่นดินไหว', icon: '🌍', color: 'bg-orange-100 text-orange-700', darkColor: 'dark:bg-orange-900/50 dark:text-orange-300' },
  { type: 'heavyrain', label: 'ฝนตกหนัก', icon: '🌧️', color: 'bg-blue-100 text-blue-700', darkColor: 'dark:bg-blue-900/50 dark:text-blue-300' },
  { type: 'wildfire', label: 'ไฟป่า', icon: '🔥', color: 'bg-red-100 text-red-700', darkColor: 'dark:bg-red-900/50 dark:text-red-300' },
  { type: 'airpollution', label: 'PM2.5', icon: '💨', color: 'bg-gray-100 text-gray-700', darkColor: 'dark:bg-gray-700 dark:text-gray-300' },
  { type: 'drought', label: 'ภัยแล้ง', icon: '🌵', color: 'bg-amber-100 text-amber-700', darkColor: 'dark:bg-amber-900/50 dark:text-amber-300' },
  { type: 'flood', label: 'น้ำท่วม', icon: '🌊', color: 'bg-indigo-100 text-indigo-700', darkColor: 'dark:bg-indigo-900/50 dark:text-indigo-300' },
  { type: 'storm', label: 'พายุ', icon: '⛈️', color: 'bg-purple-100 text-purple-700', darkColor: 'dark:bg-purple-900/50 dark:text-purple-300' },
  { type: 'sinkhole', label: 'แผ่นดินยุบ', icon: '📉', color: 'bg-stone-100 text-stone-700', darkColor: 'dark:bg-stone-800/50 dark:text-stone-300' },
];

export const MobileOptimizedControls: React.FC<MobileOptimizedControlsProps> = ({
  selectedType,
  onTypeChange,
  filters,
  stats,
  className = ""
}) => {
  const [activeTab, setActiveTab] = React.useState('details' as 'details' | 'layers');

  return (
    <div className={`fixed inset-x-0 bottom-0 z-[500] pointer-events-none flex flex-col justify-end ${className}`}>

      {/* 1. Horizontal Type Selector (Floating Top) */}
      <div className="absolute bottom-[80px] left-0 right-0 pointer-events-auto px-4 pb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {DISASTER_TYPES.map((item) => (
            <button
              key={item.type}
              onClick={() => onTypeChange(item.type)}
              className={`
                  flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition-all whitespace-nowrap
                  ${selectedType === item.type
                  ? `${item.color} ${item.darkColor} ring-2 ring-white dark:ring-gray-600 ring-offset-2 dark:ring-offset-gray-900 font-bold scale-105`
                  : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'}
                `}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Bottom Action Bar */}
      <div className="pointer-events-auto bg-white dark:bg-gray-900 border-t border-gray-200/50 dark:border-gray-700/50 p-4 pb-safe flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-xl p-2.5 shadow-blue-200 dark:shadow-blue-900 shadow-lg">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {DISASTER_TYPES.find(d => d.type === selectedType)?.label}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              กำลังแสดงข้อมูลล่าสุด
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Drawer.Root shouldScaleBackground>
            <Drawer.Trigger asChild>
              <Button
                size="sm"
                variant="default"
                className="rounded-full px-5 bg-gray-900 dark:bg-gray-100 hover:bg-black dark:hover:bg-white dark:text-gray-900 shadow-lg hover:scale-105 transition-all text-xs"
              >
                <ChevronUp className="w-4 h-4 mr-1.5" />
                ดูรายละเอียด
              </Button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001]" />
              <Drawer.Content className="bg-white dark:bg-gray-900 flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-[1002] outline-none">
                {/* Drawer Handle */}
                <div className="p-4 bg-white dark:bg-gray-900 rounded-t-[20px] flex-none border-b dark:border-gray-700">
                  <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-600 mb-6" />
                  <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveTab('details')}
                      className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'details' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      สถิติ & ข้อมูล
                    </button>
                    <button
                      onClick={() => setActiveTab('layers')}
                      className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'layers' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                        }`}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      ตัวกรอง & ชั้นข้อมูล
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950 pb-20">
                  {activeTab === 'details' ? stats : filters}
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>
    </div>
  );
};
