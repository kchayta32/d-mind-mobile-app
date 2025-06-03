
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotificationService = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      
      // Check current permission status
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default'
      });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "ไม่รองรับการแจ้งเตือน",
        description: "เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน",
        variant: "destructive"
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      
      const newPermission = {
        granted: result === 'granted',
        denied: result === 'denied',
        default: result === 'default'
      };
      
      setPermission(newPermission);

      if (result === 'granted') {
        toast({
          title: "เปิดการแจ้งเตือนสำเร็จ",
          description: "คุณจะได้รับการแจ้งเตือนเมื่อมีภัยพิบัติในพื้นที่ของคุณ"
        });
        return true;
      } else {
        toast({
          title: "ไม่ได้รับอนุญาต",
          description: "กรุณาอนุญาตการแจ้งเตือนในการตั้งค่าเบราว์เซอร์",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถขออนุญาตการแจ้งเตือนได้",
        variant: "destructive"
      });
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || !permission.granted) {
      console.warn('Notifications not supported or not permitted');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
        badge: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
        tag: 'disaster-alert',
        renotify: true,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const sendDisasterAlert = (
    disasterType: string, 
    location: string, 
    severity: string,
    description?: string
  ) => {
    const severityEmoji = {
      'low': '🟡',
      'medium': '🟠', 
      'high': '🔴',
      'severe': '🚨'
    };

    const typeEmoji = {
      'earthquake': '🌍',
      'flood': '🌊',
      'storm': '🌪️',
      'wildfire': '🔥',
      'heavyrain': '🌧️',
      'strongwind': '💨'
    };

    const emoji = severityEmoji[severity as keyof typeof severityEmoji] || '⚠️';
    const typeIcon = typeEmoji[disasterType as keyof typeof typeEmoji] || '⚠️';

    sendNotification(
      `${emoji} ${typeIcon} การแจ้งเตือนภัยพิบัติ`,
      {
        body: `${description || disasterType} ที่ ${location}\nระดับ: ${severity}`,
        icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
        badge: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
        tag: `disaster-${disasterType}-${Date.now()}`,
        requireInteraction: severity === 'high' || severity === 'severe',
        silent: false,
        vibrate: severity === 'high' || severity === 'severe' ? [200, 100, 200] : [100]
      }
    );
  };

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    sendDisasterAlert
  };
};
