
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Settings, CheckCircle } from 'lucide-react';
import { useNotificationService } from '@/hooks/useNotificationService';
import { useSharedDisasterAlerts } from '@/hooks/useSharedDisasterAlerts';

const NotificationManager: React.FC = () => {
  const { isSupported, permission, requestPermission, sendDisasterAlert } = useNotificationService();
  const { alerts } = useSharedDisasterAlerts();
  const [lastAlertIds, setLastAlertIds] = useState<Set<string>>(new Set());

  // Monitor for new disaster alerts and send notifications
  useEffect(() => {
    if (!permission.granted || alerts.length === 0) return;

    const activeAlerts = alerts.filter(alert => alert.is_active);
    
    activeAlerts.forEach(alert => {
      if (!lastAlertIds.has(alert.id)) {
        sendDisasterAlert(
          alert.type,
          alert.location,
          alert.severity,
          alert.description
        );
      }
    });

    // Update the set of alert IDs we've seen
    setLastAlertIds(new Set(activeAlerts.map(alert => alert.id)));
  }, [alerts, permission.granted, sendDisasterAlert, lastAlertIds]);

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  const getStatusColor = () => {
    if (permission.granted) return 'text-green-600';
    if (permission.denied) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = () => {
    if (permission.granted) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (permission.denied) return <BellOff className="h-5 w-5 text-red-600" />;
    return <Bell className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusText = () => {
    if (permission.granted) return 'เปิดใช้งานแล้ว';
    if (permission.denied) return 'ปิดใช้งาน';
    return 'รอการอนุญาต';
  };

  if (!isSupported) {
    return (
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-gray-500" />
            การแจ้งเตือน
          </CardTitle>
          <CardDescription>
            เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={permission.granted ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          การแจ้งเตือนภัยพิบัติ
          <span className={`text-sm font-normal ${getStatusColor()}`}>
            ({getStatusText()})
          </span>
        </CardTitle>
        <CardDescription>
          รับการแจ้งเตือนทันทีเมื่อมีภัยพิบัติในพื้นที่ของคุณ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {permission.granted ? (
            <div className="flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="h-4 w-4" />
              คุณจะได้รับการแจ้งเตือนเมื่อมีภัยพิบัติ
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                เปิดใช้งานการแจ้งเตือนเพื่อรับข้อมูลภัยพิบัติแบบเรียลไทม์
              </p>
              
              {permission.denied ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">
                    การแจ้งเตือนถูกปิดใช้งาน กรุณาเปิดในการตั้งค่าเบราว์เซอร์
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      window.open('chrome://settings/content/notifications', '_blank');
                    }}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    เปิดการตั้งค่า
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleEnableNotifications}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Bell className="h-4 w-4" />
                  เปิดใช้งานการแจ้งเตือน
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationManager;
