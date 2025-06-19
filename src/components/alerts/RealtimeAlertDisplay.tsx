
import React, { useState } from 'react';
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye, 
  Bell,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const RealtimeAlertDisplay = () => {
  const { relevantAlerts, markAlertAsRead, isLoading } = useRealtimeAlerts();
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const getSeverityConfig = (level: number) => {
    const configs = {
      1: { color: 'bg-green-100 text-green-800 border-green-200', icon: Info, label: 'ต่ำ' },
      2: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle, label: 'ปานกลาง' },
      3: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, label: 'สูง' },
      4: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, label: 'รุนแรง' },
      5: { color: 'bg-red-200 text-red-900 border-red-300', icon: AlertTriangle, label: 'วิกฤต' }
    };
    return configs[level as keyof typeof configs] || configs[1];
  };

  const getAlertTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      earthquake: '🌍',
      flood: '🌊',
      wildfire: '🔥',
      storm: '🌪️',
      heavyrain: '🌧️',
      drought: '☀️',
      airpollution: '💨'
    };
    return emojis[type] || '⚠️';
  };

  const getAlertTypeName = (type: string) => {
    const names: Record<string, string> = {
      earthquake: 'แผ่นดินไหว',
      flood: 'น้ำท่วม',
      wildfire: 'ไฟป่า',
      storm: 'พายุ',
      heavyrain: 'ฝนตกหนัก',
      drought: 'ภัยแล้ง',
      airpollution: 'มลพิษอากาศ'
    };
    return names[type] || type;
  };

  const toggleExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
      markAlertAsRead(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (relevantAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีการแจ้งเตือนในขณะนี้</h3>
          <p className="text-gray-500">
            ไม่มีภัยพิบัติที่ตรงกับการตั้งค่าของคุณในพื้นที่ใกล้เคียง
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          การแจ้งเตือนในพื้นที่ของคุณ
        </h2>
        <Badge variant="secondary">
          {relevantAlerts.length} รายการ
        </Badge>
      </div>

      <div className="space-y-3">
        {relevantAlerts.map(alert => {
          const severityConfig = getSeverityConfig(alert.severity_level);
          const SeverityIcon = severityConfig.icon;
          const isExpanded = expandedAlerts.has(alert.id);
          
          return (
            <Alert key={alert.id} className={`${severityConfig.color} cursor-pointer transition-all duration-200 ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}>
              <div onClick={() => toggleExpanded(alert.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl" role="img" aria-label={alert.alert_type}>
                      {getAlertTypeEmoji(alert.alert_type)}
                    </span>
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2 text-base">
                        <SeverityIcon className="h-4 w-4" />
                        {alert.title}
                        <Badge variant="outline" className="ml-2">
                          {severityConfig.label}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        <div className="text-sm">
                          <div className="font-medium">{getAlertTypeName(alert.alert_type)}</div>
                          <div className="mt-1">{alert.message}</div>
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(alert.created_at), { 
                      addSuffix: true, 
                      locale: th 
                    })}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-700 mb-1">ตำแหน่ง</div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MapPin className="h-3 w-3" />
                          {alert.coordinates.lat.toFixed(4)}, {alert.coordinates.lng.toFixed(4)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-700 mb-1">รัศมีผลกระทب</div>
                        <div className="text-gray-600">{alert.radius_km} กิโลเมตร</div>
                      </div>
                      {alert.affected_provinces.length > 0 && (
                        <div className="md:col-span-2">
                          <div className="font-medium text-gray-700 mb-1">จังหวัดที่ได้รับผลกระทบ</div>
                          <div className="flex flex-wrap gap-1">
                            {alert.affected_provinces.map(province => (
                              <Badge key={province} variant="outline" className="text-xs">
                                {province}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 mb-2">ข้อมูลเพิ่มเติม</div>
                        <div className="bg-gray-50 p-3 rounded text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(alert.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAlertAsRead(alert.id);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        ทำเครื่องหมายว่าอ่านแล้ว
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Alert>
          );
        })}
      </div>
    </div>
  );
};

export default RealtimeAlertDisplay;
