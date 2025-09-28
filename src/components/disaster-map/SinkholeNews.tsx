import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink, Calendar, Clock } from 'lucide-react';

interface SinkholeNewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  time: string;
  summary: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
}

const SinkholeNews: React.FC = () => {
  const [selectedNews, setSelectedNews] = useState<SinkholeNewsItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Handle body scroll lock
  React.useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSheetOpen]);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSheetOpen) {
        closeSheet();
      }
    };

    if (isSheetOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSheetOpen]);

  const openSheet = (news: SinkholeNewsItem) => {
    setSelectedNews(news);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSelectedNews(null);
  };

  // Sample news data - ปกติจะดึงจาก API
  const newsItems: SinkholeNewsItem[] = [
    {
      id: '1',
      title: 'ถนนทรุด ปริศนาหลุมกว้าง คาดดินหายไปกว่าพันคิว โอกาสเกิดได้ทั่ว กทม.',
      source: 'ไทยรัฐออนไลน์',
      date: '24 ก.ย. 2568',
      time: '13:47 น.',
      summary: 'เกิดเหตุแผ่นดินยุบในพื้นที่เขตดุสิต กรุงเทพมหานคร ทำให้ถนนทรุดตัวลงเป็นหลุมขนาดใหญ่',
      location: 'เขตดุสิต กทม.',
      severity: 'high'
    }
  ];


  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'ร้ายแรง';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'เล็กน้อย';
      default: return 'ไม่ระบุ';
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-amber-800 flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            ข่าวแผ่นดินยุบ/ดินทรุด
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            ข่าวล่าสุด 1 เดือนที่ผ่านมา
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {newsItems.map((news) => (
            <div key={news.id} className="border rounded-lg p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(news.severity)}`}>
                  {getSeverityText(news.severity)}
                </span>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  {news.date}
                  <Clock className="w-3 h-3" />
                  {news.time}
                </div>
              </div>
              
              <h4 className="font-medium text-sm mb-2 line-clamp-2">
                {news.title}
              </h4>
              
              <p className="text-xs text-muted-foreground mb-2">
                {news.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-600">
                  📍 {news.location}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => openSheet(news)}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  อ่านต่อ
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                จาก {news.source}
              </div>
            </div>
          ))}
          
          {newsItems.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">ไม่มีข่าวใหม่ในช่วงนี้</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Sheet */}
      {isSheetOpen && selectedNews && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/25 z-40" 
            onClick={closeSheet}
          />
          
          {/* Sheet Panel */}
          <div className="fixed right-0 top-0 w-[92vw] sm:w-[520px] max-w-[560px] h-screen overflow-y-auto rounded-l-2xl bg-white z-50">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                ข่าวแผ่นดินยุบ
              </h2>
              <button
                onClick={closeSheet}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="ปิด"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* News Meta Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">แหล่งที่มา:</span>
                  <p className="text-gray-600 mt-1">{selectedNews.source}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">วันที่:</span>
                  <p className="text-gray-600 mt-1">{selectedNews.date} {selectedNews.time}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">สถานที่:</span>
                  <p className="text-gray-600 mt-1">{selectedNews.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ระดับความรุนแรง:</span>
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full border ${getSeverityColor(selectedNews.severity)}`}>
                    {getSeverityText(selectedNews.severity)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  {selectedNews.title}
                </h3>
              </div>

              {/* Summary */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">สรุปข่าว</h4>
                <p className="text-gray-700 leading-relaxed">{selectedNews.summary}</p>
              </div>

              {/* Full Article */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-lg">ข่าวเต็ม</h4>
                    <p className="text-blue-700/70 text-sm">รายละเอียดครบถ้วนจากแหล่งข่าว</p>
                  </div>
                </div>
                
                <div className="aspect-video w-full bg-white rounded-lg shadow-sm border border-blue-200/50 overflow-hidden">
                  <iframe 
                    src="/src/data/sinkhole-news.html"
                    className="w-full h-full"
                    title="ข่าวเต็ม"
                  />
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs text-blue-600/80">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    เนื้อหาจากแหล่งข่าวต้นฉบับ
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    อัปเดตล่าสุด
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SinkholeNews;