
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, CloudRain, AlertTriangle, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherWarning {
  id: string;
  title: string;
  description: string;
  issue_date: string;
  effective_date: string;
  expire_date: string;
  area: string;
  severity: string;
  certainty: string;
  urgency: string;
  event: string;
  headline: string;
  web: string;
}

const WeatherWarningNews: React.FC = () => {
  const [warnings, setWarnings] = useState<WeatherWarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWeatherWarnings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://data.tmd.go.th/api/WeatherWarningNews/v2/?uid=demo&ukey=demokey');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data.WeatherWarnings)) {
          setWarnings(data.WeatherWarnings);
        } else {
          console.log('Unexpected data structure:', data);
          setWarnings([]);
        }
      } catch (err) {
        console.error('Error fetching weather warnings:', err);
        setError('ไม่สามารถโหลดข้อมูลข่าวเตือนภัยสภาพอากาศได้ กรุณาลองอีกครั้งภายหลัง');
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลข่าวเตือนภัยได้",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherWarnings();
  }, [toast]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'bg-red-500 text-white';
      case 'moderate':
        return 'bg-orange-500 text-white';
      case 'minor':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getEventIcon = (event: string) => {
    if (event?.toLowerCase().includes('rain') || event?.toLowerCase().includes('ฝน')) {
      return <CloudRain className="h-4 w-4" />;
    }
    return <AlertTriangle className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">กำลังโหลดข่าวเตือนภัย...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  if (warnings.length === 0) {
    return (
      <div className="text-center py-10">
        <CloudRain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <p className="text-gray-500">ไม่มีข่าวเตือนภัยสภาพอากาศในขณะนี้</p>
        <p className="text-sm text-gray-400 mt-2">ข้อมูลจากกรมอุตุนิยมวิทยา</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">ข่าวเตือนภัยสภาพอากาศ</h2>
        <Badge variant="outline" className="text-xs">
          จาก กรมอุตุนิยมวิทยา
        </Badge>
      </div>

      {warnings.map((warning, index) => (
        <Card key={warning.id || index} className="border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getEventIcon(warning.event)}
                <CardTitle className="text-base font-semibold text-gray-800 line-clamp-2">
                  {warning.headline || warning.title || 'ข่าวเตือนภัยสภาพอากาศ'}
                </CardTitle>
              </div>
              {warning.severity && (
                <Badge className={`text-xs ${getSeverityColor(warning.severity)}`}>
                  {warning.severity}
                </Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {warning.description && (
              <ScrollArea className="max-h-24 mb-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {warning.description}
                </p>
              </ScrollArea>
            )}

            <div className="space-y-2 text-xs text-gray-600">
              {warning.area && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>พื้นที่: {warning.area}</span>
                </div>
              )}
              
              {warning.effective_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>มีผลตั้งแต่: {formatDate(warning.effective_date)}</span>
                </div>
              )}
              
              {warning.expire_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>หมดอายุ: {formatDate(warning.expire_date)}</span>
                </div>
              )}
            </div>

            {warning.web && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <a 
                  href={warning.web} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  ดูรายละเอียดเพิ่มเติม →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WeatherWarningNews;
