
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { CalendarDays, Filter } from 'lucide-react';

interface TimelineFilterProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  articles: Array<{ created_at?: string; [key: string]: any }>;
}

export const ArticleTimeline: React.FC<TimelineFilterProps> = ({ onDateRangeChange, articles }) => {
  // Generate date range from articles (mock dates for demo)
  const dateRange = useMemo(() => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    // Mock creation dates for articles
    const mockDates = [
      new Date('2024-01-15'),
      new Date('2024-03-20'),
      new Date('2024-05-10'),
      new Date('2024-07-05'),
      new Date('2024-09-12'),
      new Date('2024-11-25'),
      new Date('2024-12-01'),
      new Date('2025-01-10'),
      new Date('2025-06-10'),
    ];

    return {
      min: oneYearAgo,
      max: now,
      dates: mockDates.sort((a, b) => a.getTime() - b.getTime())
    };
  }, [articles]);

  const [selectedRange, setSelectedRange] = useState([0, 100]);

  const handleRangeChange = (value: number[]) => {
    setSelectedRange(value);
    
    const totalDays = Math.floor((dateRange.max.getTime() - dateRange.min.getTime()) / (1000 * 60 * 60 * 24));
    const startDays = Math.floor((value[0] / 100) * totalDays);
    const endDays = Math.floor((value[1] / 100) * totalDays);
    
    const startDate = new Date(dateRange.min.getTime() + startDays * 24 * 60 * 60 * 1000);
    const endDate = new Date(dateRange.min.getTime() + endDays * 24 * 60 * 60 * 1000);
    
    onDateRangeChange(startDate, endDate);
  };

  const formatDate = (percentage: number) => {
    const totalDays = Math.floor((dateRange.max.getTime() - dateRange.min.getTime()) / (1000 * 60 * 60 * 24));
    const days = Math.floor((percentage / 100) * totalDays);
    const date = new Date(dateRange.min.getTime() + days * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric',
      month: 'short', 
      year: 'numeric' 
    });
  };

  const filteredArticleCount = dateRange.dates.filter(date => {
    const percentage = ((date.getTime() - dateRange.min.getTime()) / (dateRange.max.getTime() - dateRange.min.getTime())) * 100;
    return percentage >= selectedRange[0] && percentage <= selectedRange[1];
  }).length;

  return (
    <Card className="border-blue-200 mb-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <Label className="text-lg font-semibold text-blue-800">
                กรองตามวันที่โพสต์
              </Label>
              <p className="text-sm text-blue-600 mt-1">
                เลือกช่วงเวลาที่ต้องการดูบทความ
              </p>
            </div>
          </div>
          
          {/* Enhanced timeline visualization */}
          <div className="relative bg-white rounded-lg p-4 shadow-inner">
            <div className="relative h-4 mb-6">
              <div className="absolute left-0 top-1 w-full h-2 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 rounded-full shadow-sm"></div>
              {/* Article markers on timeline */}
              {dateRange.dates.map((date, index) => {
                const percentage = ((date.getTime() - dateRange.min.getTime()) / (dateRange.max.getTime() - dateRange.min.getTime())) * 100;
                const isInRange = percentage >= selectedRange[0] && percentage <= selectedRange[1];
                return (
                  <div
                    key={index}
                    className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-md transition-all duration-200 ${
                      isInRange ? 'bg-blue-600 scale-110' : 'bg-gray-400'
                    }`}
                    style={{ 
                      left: `${percentage}%`,
                      top: '-2px',
                      transform: 'translateX(-50%)'
                    }}
                    title={`บทความ ${date.toLocaleDateString('th-TH')}`}
                  />
                );
              })}
            </div>
            
            {/* Enhanced range slider */}
            <div className="px-2 mb-4">
              <Slider
                value={selectedRange}
                onValueChange={handleRangeChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Enhanced date labels and statistics */}
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-700 font-medium">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                {formatDate(selectedRange[0])}
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-lg shadow-lg">
                  {filteredArticleCount} บทความ
                </div>
                <p className="text-xs text-gray-600 mt-1">ในช่วงที่เลือก</p>
              </div>
              <div className="text-gray-700 font-medium">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                {formatDate(selectedRange[1])}
              </div>
            </div>
          </div>
          
          {/* Quick filter buttons */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => handleRangeChange([70, 100])}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-md"
            >
              3 เดือนล่าสุด
            </button>
            <button
              onClick={() => handleRangeChange([50, 100])}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium shadow-md"
            >
              6 เดือนล่าสุด
            </button>
            <button
              onClick={() => handleRangeChange([0, 100])}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium shadow-md"
            >
              ทั้งหมด
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
