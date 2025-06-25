
import React from 'react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

const NotificationHistory: React.FC = () => {
  const { notifications, isLoading, markAsRead } = useEnhancedNotifications();

  const getSeverityColor = (level: number) => {
    if (level >= 5) return 'bg-red-600';
    if (level >= 4) return 'bg-orange-500';
    if (level >= 3) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getSeverityText = (level: number) => {
    if (level >= 5) return 'วิกฤติ';
    if (level >= 4) return 'ฉุกเฉิน';
    if (level >= 3) return 'สูง';
    return 'ปานกลาง';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดประวัติการแจ้งเตือน...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          ประวัติการแจ้งเตือน
        </CardTitle>
        <CardDescription>
          รายการการแจ้งเตือนที่คุณได้รับ ({notifications.length} รายการ)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีการแจ้งเตือน
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    notification.read_at ? 'bg-gray-50' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <Badge className={`${getSeverityColor(notification.severity_level)} text-white`}>
                        {getSeverityText(notification.severity_level)}
                      </Badge>
                      {!notification.read_at && (
                        <Badge variant="secondary">ใหม่</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true, 
                        locale: th 
                      })}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-3">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {notification.location_data && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>มีข้อมูลตำแหน่ง</span>
                        </div>
                      )}
                      {notification.delivered_at && (
                        <div>
                          ส่งแล้ว: {new Date(notification.delivered_at).toLocaleString('th-TH')}
                        </div>
                      )}
                    </div>
                    
                    {!notification.read_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                      >
                        ทำเครื่องหมายว่าอ่านแล้ว
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationHistory;
