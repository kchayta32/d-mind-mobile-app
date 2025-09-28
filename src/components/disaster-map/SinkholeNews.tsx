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

  const handleNewsClick = (news: SinkholeNewsItem) => {
    setSelectedNews(news);
  };

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
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => handleNewsClick(news)}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    อ่านต่อ
                  </Button>
                </DialogTrigger>
                <DialogContent className="fixed inset-4 z-50 max-w-4xl max-h-[80vh] overflow-y-auto bg-background border shadow-lg">
                  <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
                  <DialogHeader>
                    <DialogTitle className="text-left">
                      {news.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>แหล่งที่มา: {news.source}</span>
                      <span>{news.date} {news.time}</span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <iframe 
                        src="/src/data/sinkhole-news.html"
                        className="w-full h-96 border rounded"
                        title="ข่าวเต็ม"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
  );
};

export default SinkholeNews;