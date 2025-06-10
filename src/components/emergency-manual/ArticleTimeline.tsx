
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { CalendarDays } from 'lucide-react';

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
    return date.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' });
  };

  return (
    <Card className="border-blue-200 mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <Label className="text-sm font-medium text-blue-700">
              กรองตามวันที่โพสต์
            </Label>
          </div>
          
          {/* Timeline visualization */}
          <div className="relative">
            <div className="absolute left-0 top-0 w-full h-2 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-400 rounded-full"></div>
            {/* Article markers on timeline */}
            {dateRange.dates.map((date, index) => {
              const percentage = ((date.getTime() - dateRange.min.getTime()) / (dateRange.max.getTime() - dateRange.min.getTime())) * 100;
              return (
                <div
                  key={index}
                  className="absolute w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"
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
          
          {/* Range slider */}
          <div className="px-2">
            <Slider
              value={selectedRange}
              onValueChange={handleRangeChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Date labels */}
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formatDate(selectedRange[0])}</span>
            <span className="text-blue-600 font-medium">
              {dateRange.dates.filter(date => {
                const percentage = ((date.getTime() - dateRange.min.getTime()) / (dateRange.max.getTime() - dateRange.min.getTime())) * 100;
                return percentage >= selectedRange[0] && percentage <= selectedRange[1];
              }).length} บทความ
            </span>
            <span>{formatDate(selectedRange[1])}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
