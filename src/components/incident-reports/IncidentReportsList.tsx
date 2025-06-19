
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Clock, Phone, Camera, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type IncidentReportRow = Database['public']['Tables']['incident_reports']['Row'];

interface IncidentReport {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number } | null;
  severity_level: number;
  contact_info: string;
  image_urls: string[];
  status: string;
  is_verified: boolean;
  created_at: string;
}

const IncidentReportsList: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['incident-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform the data to match our IncidentReport interface
      return data.map((report: IncidentReportRow): IncidentReport => {
        // Handle coordinates transformation
        let coordinates: { lat: number; lng: number } | null = null;
        if (report.coordinates && typeof report.coordinates === 'object' && report.coordinates !== null) {
          const coords = report.coordinates as any;
          if (coords.lat !== undefined && coords.lng !== undefined) {
            coordinates = {
              lat: Number(coords.lat) || 0,
              lng: Number(coords.lng) || 0
            };
          }
        }

        return {
          id: report.id,
          type: report.type,
          title: report.title,
          description: report.description,
          location: report.location || '',
          coordinates,
          severity_level: report.severity_level,
          contact_info: report.contact_info || '',
          image_urls: report.image_urls || [],
          status: report.status,
          is_verified: report.is_verified,
          created_at: report.created_at
        };
      });
    },
    refetchInterval: 30000
  });

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      earthquake: '🏢',
      flood: '🌊',
      wildfire: '🔥',
      landslide: '⛰️',
      storm: '🌪️',
      accident: '🚗',
      other: '⚠️'
    };
    return icons[type] || '⚠️';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      earthquake: 'แผ่นดินไหว',
      flood: 'น้ำท่วม',
      wildfire: 'ไฟป่า',
      landslide: 'ดินถลม',
      storm: 'พายุ',
      accident: 'อุบัติเหตุ',
      other: 'อื่นๆ'
    };
    return labels[type] || 'ไม่ระบุ';
  };

  const getSeverityColor = (level: number) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-yellow-500',
      3: 'bg-orange-500',
      4: 'bg-red-500',
      5: 'bg-red-700'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500';
  };

  const getSeverityLabel = (level: number) => {
    const labels = {
      1: 'ต่ำ',
      2: 'ปานกลาง',
      3: 'สูง',
      4: 'วิกฤติ',
      5: 'ภัยฉุกเฉิน'
    };
    return labels[level as keyof typeof labels] || 'ไม่ระบุ';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      investigating: 'bg-blue-500',
      resolved: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'รอการตรวจสอบ',
      investigating: 'กำลังตรวจสอบ',
      resolved: 'แก้ไขแล้ว',
      rejected: 'ไม่อนุมัติ'
    };
    return labels[status] || 'ไม่ระบุ';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">ยังไม่มีรายงานเหตุการณ์</p>
          </CardContent>
        </Card>
      ) : (
        reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(report.type)}</span>
                  <h3 className="font-semibold text-lg">{report.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getSeverityColor(report.severity_level)} text-white`}>
                    {getSeverityLabel(report.severity_level)}
                  </Badge>
                  <Badge className={`${getStatusColor(report.status)} text-white`}>
                    {getStatusLabel(report.status)}
                  </Badge>
                  {report.is_verified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-3 line-clamp-2">{report.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                {report.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{report.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                {report.image_urls.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    <span>{report.image_urls.length} รูป</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getTypeLabel(report.type)}</Badge>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      ดูรายละเอียด
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(report.type)}</span>
                        {report.title}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedReport && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getSeverityColor(selectedReport.severity_level)} text-white`}>
                            {getSeverityLabel(selectedReport.severity_level)}
                          </Badge>
                          <Badge className={`${getStatusColor(selectedReport.status)} text-white`}>
                            {getStatusLabel(selectedReport.status)}
                          </Badge>
                          {selectedReport.is_verified && (
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              ยืนยันแล้ว
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">รายละเอียด</h4>
                          <p className="text-gray-700">{selectedReport.description}</p>
                        </div>

                        {selectedReport.location && (
                          <div>
                            <h4 className="font-semibold mb-2">ตำแหน่ง</h4>
                            <p className="text-gray-700 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {selectedReport.location}
                            </p>
                            {selectedReport.coordinates && (
                              <p className="text-sm text-gray-500">
                                พิกัด: {selectedReport.coordinates.lat.toFixed(6)}, {selectedReport.coordinates.lng.toFixed(6)}
                              </p>
                            )}
                          </div>
                        )}

                        {selectedReport.contact_info && (
                          <div>
                            <h4 className="font-semibold mb-2">ข้อมูลติดต่อ</h4>
                            <p className="text-gray-700 flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {selectedReport.contact_info}
                            </p>
                          </div>
                        )}

                        {selectedReport.image_urls.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">รูปภาพประกอบ</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedReport.image_urls.map((url, index) => (
                                <img
                                  key={index}
                                  src={url}
                                  alt={`รูปภาพ ${index + 1}`}
                                  className="w-full h-32 object-cover rounded border"
                                  onClick={() => window.open(url, '_blank')}
                                  style={{ cursor: 'pointer' }}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-sm text-gray-500">
                          <p>รายงานเมื่อ: {format(new Date(selectedReport.created_at), 'dd/MM/yyyy HH:mm:ss')}</p>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default IncidentReportsList;
