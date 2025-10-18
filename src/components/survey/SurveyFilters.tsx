import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Filter } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface SurveyFiltersProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  surveyDates: string[];
}

export const SurveyFilters: React.FC<SurveyFiltersProps> = ({ 
  onDateRangeChange,
  surveyDates
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Get available years
  const availableYears = useMemo(() => {
    const years = surveyDates
      .map(date => new Date(date).getFullYear())
      .filter((year, index, self) => self.indexOf(year) === index);
    return years.sort((a, b) => b - a);
  }, [surveyDates]);

  // Get available months for selected year
  const availableMonths = useMemo(() => {
    if (selectedYear === 'all') return [];
    
    const months = surveyDates
      .filter(date => new Date(date).getFullYear() === parseInt(selectedYear))
      .map(date => new Date(date).getMonth())
      .filter((month, index, self) => self.indexOf(month) === index);
    return months.sort((a, b) => a - b);
  }, [surveyDates, selectedYear]);

  // Get available days for selected year and month
  const availableDays = useMemo(() => {
    if (selectedYear === 'all' || selectedMonth === 'all') return [];
    
    const days = surveyDates
      .filter(date => {
        const d = new Date(date);
        return d.getFullYear() === parseInt(selectedYear) && 
               d.getMonth() === parseInt(selectedMonth);
      })
      .map(date => new Date(date).getDate())
      .filter((day, index, self) => self.indexOf(day) === index);
    return days.sort((a, b) => a - b);
  }, [surveyDates, selectedYear, selectedMonth]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth('all');
    setSelectedDay('all');
    
    if (year === 'all') {
      onDateRangeChange(null, null);
    } else {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setSelectedDay('all');
    
    if (selectedYear === 'all' || month === 'all') {
      if (selectedYear !== 'all') {
        const startDate = new Date(parseInt(selectedYear), 0, 1);
        const endDate = new Date(parseInt(selectedYear), 11, 31, 23, 59, 59);
        onDateRangeChange(startDate, endDate);
      } else {
        onDateRangeChange(null, null);
      }
    } else {
      const startDate = new Date(parseInt(selectedYear), parseInt(month), 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(month) + 1, 0, 23, 59, 59);
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    
    if (selectedYear === 'all' || selectedMonth === 'all' || day === 'all') {
      handleMonthChange(selectedMonth);
    } else {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), parseInt(day));
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), parseInt(day), 23, 59, 59);
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleReset = () => {
    setSelectedYear('all');
    setSelectedMonth('all');
    setSelectedDay('all');
    onDateRangeChange(null, null);
  };

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return (
    <Card className="border-blue-200 bg-gradient-to-b from-blue-50 to-white sticky top-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 pb-3 border-b border-blue-200">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">กรองข้อมูล</h3>
              <p className="text-xs text-blue-600">
                เลือกช่วงเวลา
              </p>
            </div>
          </div>

          {/* Year Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-blue-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              เลือกปี
            </label>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full border-blue-200">
                <SelectValue placeholder="เลือกปี" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกปี</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year + 543}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Selector */}
          {selectedYear !== 'all' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">เลือกเดือน</label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-full border-blue-200">
                  <SelectValue placeholder="เลือกเดือน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกเดือน</SelectItem>
                  {availableMonths.map(monthIndex => (
                    <SelectItem key={monthIndex} value={monthIndex.toString()}>
                      {months[monthIndex]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Day Selector */}
          {selectedYear !== 'all' && selectedMonth !== 'all' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">เลือกวัน</label>
              <Select value={selectedDay} onValueChange={handleDayChange}>
                <SelectTrigger className="w-full border-blue-200">
                  <SelectValue placeholder="เลือกวัน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกวัน</SelectItem>
                  {availableDays.map(day => (
                    <SelectItem key={day} value={day.toString()}>
                      {day} {months[parseInt(selectedMonth)]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reset Button */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full border-blue-200 hover:bg-blue-50"
          >
            แสดงทั้งหมด
          </Button>

          {/* Filter Summary */}
          <div className="text-xs text-blue-700 bg-blue-50 rounded-lg p-3 border border-blue-100">
            <p className="font-medium mb-1">กำลังแสดง:</p>
            <p className="text-blue-900">
              {selectedYear === 'all' 
                ? 'ข้อมูลทั้งหมด'
                : selectedMonth === 'all'
                  ? `ปี ${parseInt(selectedYear) + 543}`
                  : selectedDay === 'all'
                    ? `${months[parseInt(selectedMonth)]} ${parseInt(selectedYear) + 543}`
                    : `${selectedDay} ${months[parseInt(selectedMonth)]} ${parseInt(selectedYear) + 543}`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
