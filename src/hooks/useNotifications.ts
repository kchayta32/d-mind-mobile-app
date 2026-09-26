import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import {
  getFcmVapidKey,
  isFcmConfigured,
  registerDevicePushNotifications,
  hapticEmergencyVibrate,
} from '@/utils/native';

// Safe 32-bit signed integer ID generator for Android Capacitor LocalNotifications
export const generateNotificationId = (): number => {
  return Math.abs(Math.floor(Date.now() % 2147483647));
};

// Notification channel configurations for Android
export const NOTIFICATION_CHANNELS = {
  'disaster-critical': {
    id: 'disaster-critical',
    name: 'แจ้งเตือนภัยพิบัติวิกฤต (Critical)',
    description: 'การแจ้งเตือนภัยพิบัติระดับวิกฤต อพยพด่วน ความสำคัญสูงสุด (Heads-up popup)',
    importance: 5, // IMPORTANCE_HIGH (Android Max heads-up)
    visibility: 1, // VISIBILITY_PUBLIC
    sound: 'emergency_alert',
    vibration: true,
    lights: true,
    lightColor: '#DC2626'
  },
  'disaster-warning': {
    id: 'disaster-warning',
    name: 'แจ้งเตือนภัยเฝ้าระวัง (Warning)',
    description: 'การแจ้งเตือนเมื่อภัยใกล้เข้ามา ความสำคัญสูง',
    importance: 4, // IMPORTANCE_HIGH
    visibility: 1,
    sound: 'important_alert',
    vibration: true,
    lights: true,
    lightColor: '#EA580C'
  },
  'disaster-info': {
    id: 'disaster-info',
    name: 'ข้อมูลสภาพอากาศและเตรียมพร้อม (Info)',
    description: 'ข้อมูลสภาพอากาศและการเตรียมพร้อมทั่วไป',
    importance: 3, // IMPORTANCE_DEFAULT
    visibility: 0,
    sound: 'default',
    vibration: false,
    lights: false,
    lightColor: '#3B82F6'
  },
  // Backward compatibility aliases
  emergency: {
    id: 'disaster-critical',
    name: 'แจ้งเตือนฉุกเฉิน (Critical)',
    description: 'การแจ้งเตือนภัยพิบัติระดับวิกฤต',
    importance: 5,
    visibility: 1,
    sound: 'emergency_alert',
    vibration: true,
    lights: true,
    lightColor: '#DC2626'
  },
  important: {
    id: 'disaster-warning',
    name: 'แจ้งเตือนสำคัญ (Warning)',
    description: 'การแจ้งเตือนภัยพิบัติระดับสำคัญ',
    importance: 4,
    visibility: 1,
    sound: 'important_alert',
    vibration: true,
    lights: true,
    lightColor: '#EA580C'
  },
  default: {
    id: 'disaster-info',
    name: 'แจ้งเตือนทั่วไป (Info)',
    description: 'การแจ้งเตือนข้อมูลทั่วไป',
    importance: 3,
    visibility: 0,
    sound: 'default',
    vibration: false,
    lights: false
  }
} as const;

// Notification priority thresholds
export const SEVERITY_TO_CHANNEL = {
  5: 'disaster-critical', // Critical
  4: 'disaster-warning',  // High / Warning
  3: 'disaster-warning',  // Medium
  2: 'disaster-info',     // Low
  1: 'disaster-info'      // Info
} as const;

// Detect if running in Capacitor native environment - using the actual Capacitor module
const isCapacitorNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

// Detect if running in any WebView (Android/iOS)
const isWebView = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || '';
  return /wv|WebView/i.test(userAgent) || isCapacitorNative();
};

// Check if we're in native mode (call this directly in functions, not relying on state)
export const checkIsNative = (): boolean => {
  return isCapacitorNative() || isWebView();
};

// Initialize notification channels for Android
let channelsInitialized = false;
export const initializeNotificationChannels = async (LN: any) => {
  if (channelsInitialized || !LN) return;

  try {
    // Unique channels for Android Oreo+
    const channelsToRegister = [
      NOTIFICATION_CHANNELS['disaster-critical'],
      NOTIFICATION_CHANNELS['disaster-warning'],
      NOTIFICATION_CHANNELS['disaster-info'],
      // Also register legacy channels if any
      {
        id: 'emergency',
        name: 'แจ้งเตือนฉุกเฉิน (Emergency)',
        description: 'การแจ้งเตือนภัยพิบัติระดับวิกฤต',
        importance: 5,
        visibility: 1,
        sound: 'emergency_alert',
        vibration: true,
        lights: true,
        lightColor: '#DC2626'
      },
      {
        id: 'important',
        name: 'แจ้งเตือนสำคัญ (Important)',
        description: 'การแจ้งเตือนภัยพิบัติระดับสำคัญ',
        importance: 4,
        visibility: 1,
        sound: 'important_alert',
        vibration: true,
        lights: true,
        lightColor: '#EA580C'
      },
      {
        id: 'default',
        name: 'แจ้งเตือนทั่วไป (Default)',
        description: 'การแจ้งเตือนข้อมูลทั่วไป',
        importance: 3,
        visibility: 0,
        sound: 'default',
        vibration: false,
        lights: false
      }
    ];

    for (const channel of channelsToRegister) {
      const channelConfig: Record<string, unknown> = {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        importance: channel.importance,
        visibility: channel.visibility,
        vibration: channel.vibration,
        lights: channel.lights
      };

      if ('lightColor' in channel && (channel as any).lightColor) {
        channelConfig.lightColor = (channel as any).lightColor;
      }
      if ('sound' in channel && (channel as any).sound) {
        channelConfig.sound = (channel as any).sound;
      }

      await LN.createChannel(channelConfig);
    }
    channelsInitialized = true;
    console.log('[Native] Android disaster notification channels registered successfully');
  } catch (e) {
    console.warn('Error creating notification channels:', e);
  }
};

// Lazy load Capacitor Local Notifications
let LocalNotificationsPlugin: any = null;
export const getLocalNotifications = async () => {
  if (!LocalNotificationsPlugin && checkIsNative()) {
    try {
      const module = await import('@capacitor/local-notifications');
      LocalNotificationsPlugin = module.LocalNotifications;

      // Initialize channels when plugin is loaded
      await initializeNotificationChannels(LocalNotificationsPlugin);
    } catch (e) {
      console.warn('Local notifications plugin not available:', e);
    }
  }
  return LocalNotificationsPlugin;
};

export const useNotifications = () => {
  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSecureContext, setIsSecureContext] = React.useState(false);
  const [isNativeApp, setIsNativeApp] = React.useState(false);
  const [fcmToken, setFcmToken] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dmind-fcm-token') || null;
    }
    return null;
  });
  const { toast } = useToast();

  const vapidKey = getFcmVapidKey();
  const fcmConfigured = isFcmConfigured();

  const registerDevicePush = React.useCallback(async (customVapidKey?: string): Promise<boolean> => {
    const key = customVapidKey || vapidKey;
    try {
      const result = await registerDevicePushNotifications(key);
      if (result.success && result.token) {
        setFcmToken(result.token);
      }
      return result.success;
    } catch (e) {
      console.warn('Error registering device push:', e);
      return false;
    }
  }, [vapidKey]);

  React.useEffect(() => {
    const initNotifications = async () => {
      // Check if we're in a native Capacitor app
      const native = checkIsNative();
      setIsNativeApp(native);

      // Check if we're in a secure context (HTTPS or localhost)
      const secure = window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        native;
      setIsSecureContext(secure);

      // For native apps, check local notifications permission
      if (native) {
        try {
          const LN = await getLocalNotifications();
          if (LN) {
            const permStatus = await LN.checkPermissions();
            if (permStatus.display === 'granted') {
              setPermission('granted');
            } else if (permStatus.display === 'denied') {
              setPermission('denied');
            } else {
              setPermission('default');
            }
          }
        } catch (e) {
          console.warn('Error checking native notification permission:', e);
        }
        setIsSupported(true);
      } else {
        // For web
        const webNotificationsSupported = 'Notification' in window && secure;
        setIsSupported(webNotificationsSupported);
        if ('Notification' in window && secure) {
          setPermission(Notification.permission);
        }
      }

      // If notification permission is already granted and FCM VAPID is configured, ensure device push registration
      if ((native || ('Notification' in window && Notification.permission === 'granted')) && isFcmConfigured()) {
        registerDevicePush();
      }
    };

    initNotifications();
  }, [registerDevicePush]);

  const requestPermission = async (): Promise<boolean> => {
    // IMPORTANT: Check native status directly, not from state
    const native = checkIsNative();

    // For native Capacitor apps
    if (native) {
      try {
        const LN = await getLocalNotifications();
        if (LN) {
          // Check current status first
          const check = await LN.checkPermissions();

          if (check.display === 'granted') {
            setPermission('granted');
            localStorage.setItem('dmind-notifications-enabled', 'true');
            toast({
              title: "การแจ้งเตือนเปิดใช้งานแล้ว",
              description: "คุณจะได้รับการแจ้งเตือนภัยพิบัติ",
            });
            return true;
          }

          // Request permissions
          const permStatus = await LN.requestPermissions();

          if (permStatus.display === 'granted') {
            setPermission('granted');
            localStorage.setItem('dmind-notifications-enabled', 'true');
            if (fcmConfigured) {
              registerDevicePush();
            }
            toast({
              title: "เปิดการแจ้งเตือนสำเร็จ",
              description: "คุณจะได้รับการแจ้งเตือนบนแถบแจ้งเตือนของโทรศัพท์",
            });
            return true;
          } else {
            toast({
              title: "ไม่ได้รับอนุญาต",
              description: "กรุณาอนุญาตการแจ้งเตือนในการตั้งค่าแอพ",
              variant: "destructive",
            });
            setPermission('denied');
            return false;
          }
        } else {
          console.warn('LocalNotifications plugin not found, falling back to in-app');
        }
      } catch (e) {
        console.error('Error requesting native notification permission:', e);
      }

      // Fallback only if plugin failed to load (not if permission was denied)
      setPermission('granted');
      localStorage.setItem('dmind-notifications-enabled', 'true');
      toast({
        title: "เปิดการแจ้งเตือนแบบ In-App",
        description: "คุณจะได้รับการแจ้งเตือนภายในแอพแทน",
      });
      return true;
    }

    // For web: Check for secure context
    const secure = window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!secure) {
      toast({
        title: "ต้องใช้ HTTPS",
        description: "การแจ้งเตือนต้องเข้าถึงผ่าน HTTPS หรือ localhost เท่านั้น",
        variant: "destructive",
      });
      return false;
    }

    if (!('Notification' in window)) {
      toast({
        title: "ไม่รองรับการแจ้งเตือน",
        description: "เบราว์เซอร์ของคุณไม่รองรับการแจ้งเตือน",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        localStorage.setItem('dmind-notifications-enabled', 'true');
        if (fcmConfigured) {
          registerDevicePush();
        }
        toast({
          title: "เปิดการแจ้งเตือนสำเร็จ",
          description: "คุณจะได้รับการแจ้งเตือนเมื่อมีข้อมูลภัยพิบัติใหม่",
        });
        return true;
      } else {
        toast({
          title: "ไม่ได้รับอนุญาต",
          description: "การแจ้งเตือนถูกปิดใช้งาน",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถขออนุญาตการแจ้งเตือนได้",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendNotification = async (
    title: string,
    options?: NotificationOptions & {
      severity?: number;
      groupId?: string;
      channelId?: keyof typeof NOTIFICATION_CHANNELS;
    }
  ) => {
    const enabled = localStorage.getItem('dmind-notifications-enabled') === 'true';
    // IMPORTANT: Check native status directly, not from state
    const native = checkIsNative();

    // Determine channel based on severity or explicit channelId
    const severity = options?.severity || 1;
    const channelId = options?.channelId ||
      SEVERITY_TO_CHANNEL[severity as keyof typeof SEVERITY_TO_CHANNEL] || 'default';
    const channel = NOTIFICATION_CHANNELS[channelId];

    // For native apps, use Capacitor Local Notifications
    if (native) {
      // Check permission from plugin directly instead of relying on state
      let hasPermission = enabled;

      if (!hasPermission) {
        try {
          const LN = await getLocalNotifications();
          if (LN) {
            const permStatus = await LN.checkPermissions();
            hasPermission = permStatus.display === 'granted';
          }
        } catch (e) {
          console.warn('Error checking permission status:', e);
        }
      }

      if (!hasPermission) {
        toast({
          title: title,
          description: options?.body || '',
        });
        return;
      }

      try {
        const LN = await getLocalNotifications();
        if (LN) {
          // Build notification config based on channel
          const resolvedChannelId = channel?.id || 'disaster-info';
          const notificationId = generateNotificationId();

          const notificationConfig: Record<string, unknown> = {
            title: title,
            body: options?.body || '',
            id: notificationId,
            schedule: { at: new Date(Date.now() + 100) },
            channelId: resolvedChannelId,
            smallIcon: 'ic_stat_notification',
            largeIcon: 'ic_launcher',
            iconColor: resolvedChannelId === 'disaster-critical' ? '#DC2626' : (resolvedChannelId === 'disaster-warning' ? '#EA580C' : '#3B82F6'),
            ongoing: false,
            autoCancel: true
          };

          // Add group for notification grouping (Android)
          if (options?.groupId) {
            notificationConfig.group = options.groupId;
            notificationConfig.groupSummary = false;
          }

          // Disaster Critical notifications get emergency treatment and haptic feedback
          if (resolvedChannelId === 'disaster-critical' || channelId === 'emergency' || channelId === 'disaster-critical') {
            notificationConfig.sound = 'emergency_alert';
            (notificationConfig as any).vibrate = true;
            notificationConfig.ongoing = false;
            hapticEmergencyVibrate().catch(() => {});
          } else if (resolvedChannelId === 'disaster-warning' || channelId === 'important' || channelId === 'disaster-warning') {
            notificationConfig.sound = 'important_alert';
            (notificationConfig as any).vibrate = true;
          } else {
            notificationConfig.sound = 'default';
          }

          await LN.schedule({
            notifications: [notificationConfig as any]
          });
          return;
        }
      } catch (e) {
        console.error('Error sending native notification:', e);
      }
      // Fallback to toast
      toast({
        title: title,
        description: options?.body || '',
      });
      return;
    }

    // For web browsers
    const secure = window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (permission !== 'granted' || !secure) {
      return;
    }

    if (!('Notification' in window)) {
      return;
    }

    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const swReg = await navigator.serviceWorker.ready;
          if (swReg && typeof swReg.showNotification === 'function') {
            await swReg.showNotification(title, {
              icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
              badge: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
              tag: 'disaster-alert',
              ...options,
            } as NotificationOptions);
            return;
          }
        } catch {
          // Fall back to standard Notification constructor
        }
      }

      const notification = new Notification(title, {
        icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
        badge: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
        requireInteraction: true,
        ...options,
      } as NotificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      // Fallback to toast
      toast({
        title: title,
        description: options?.body || '',
      });
    }
  };

  return {
    permission,
    isSupported,
    isSecureContext,
    isNativeApp,
    isFcmConfigured: fcmConfigured,
    vapidKey,
    fcmVapidKey: vapidKey,
    fcmToken,
    requestPermission,
    sendNotification,
    registerDevicePush,
  };
};

