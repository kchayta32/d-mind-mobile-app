
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface VictimReport {
  id: string;
  name: string;
  status: string;
  description: string | null;
  coordinates: { latitude: number; longitude: number };
  contact: string | null;
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ปลอดภัย':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'ต้องการความช่วยเหลือด่วน':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'มีบาดเจ็บ':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'สูญหาย':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'ติดอยู่ในพื้นที่':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const VictimReportsList: React.FC = () => {
  const [reports, setReports] = useState<VictimReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('victim_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our VictimReport interface
      const transformedReports = data.map(report => {
        // Check the type and structure of coordinates
        let latitude = 0;
        let longitude = 0;
        
        if (report.coordinates) {
          // Handle the case when coordinates is an object
          if (typeof report.coordinates === 'object' && report.coordinates !== null) {
            // Check if it's a direct object with latitude/longitude properties
            if ('latitude' in report.coordinates && 'longitude' in report.coordinates) {
              latitude = Number(report.coordinates.latitude) || 0;
              longitude = Number(report.coordinates.longitude) || 0;
            } 
            // Handle the case when it might be a JSON string that was parsed
            else if (typeof report.coordinates === 'object') {
              const coords = report.coordinates as Record<string, any>;
              latitude = Number(coords.latitude) || 0;
              longitude = Number(coords.longitude) || 0;
            }
          }
        }
        
        return {
          ...report,
          coordinates: {
            latitude,
            longitude
          }
        };
      }) as VictimReport[];

      setReports(transformedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('ไม่สามารถโหลดข้อมูลรายงานได้ กรุณาลองอีกครั้งภายหลัง');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  // Open location in maps
  const openInMaps = (lat: number, lng: number) => {
    // Use Google Maps as fallback
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (isLoading && !refreshing) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-guardian-purple" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button variant="outline" onClick={fetchReports}>ลองใหม่</Button>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-2">ยังไม่มีรายงานสถานะผู้ประสบภัย</p>
        <Button variant="outline" onClick={handleRefresh} className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          รีเฟรช
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">รายงานล่าสุด</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {reports.map((report) => (
        <Card key={report.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">{report.name}</h3>
              <Badge className={`${getStatusColor(report.status)} border`}>
                {report.status}
              </Badge>
            </div>
            
            {report.description && (
              <p className="text-sm text-gray-700 mt-2">{report.description}</p>
            )}
            
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-gray-600">
              {report.contact && (
                <p>ติดต่อ: {report.contact}</p>
              )}
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: th })}
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs"
                  onClick={() => openInMaps(report.coordinates.latitude, report.coordinates.longitude)}
                >
                  ดูในแผนที่
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VictimReportsList;
