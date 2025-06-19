
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeAlert {
  id: string;
  alert_type: string;
  severity_level: number;
  title: string;
  message: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius_km: number;
  affected_provinces: string[];
  metadata: any;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  verified_by?: string;
  verified_at?: string;
}

interface UserAlertSubscription {
  id?: string;
  user_id: string;
  alert_types: string[];
  location_preferences: {
    lat: number;
    lng: number;
    address?: string;
  };
  radius_km: number;
  min_severity_level: number;
  notification_methods: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  is_active: boolean;
}

export const useRealtimeAlerts = () => {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [subscription, setSubscription] = useState<UserAlertSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Load user's alert subscription
  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_alert_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading subscription:', error);
        return;
      }

      if (data) {
        const typedSubscription: UserAlertSubscription = {
          ...data,
          location_preferences: typeof data.location_preferences === 'object' && data.location_preferences !== null
            ? data.location_preferences as UserAlertSubscription['location_preferences']
            : { lat: 0, lng: 0 },
          notification_methods: typeof data.notification_methods === 'object' && data.notification_methods !== null
            ? data.notification_methods as UserAlertSubscription['notification_methods']
            : { push: true, email: false, sms: false }
        };
        setSubscription(typedSubscription);
      } else if (userLocation) {
        // Create default subscription with user's location
        const defaultSubscription = {
          user_id: user.id,
          alert_types: ['earthquake', 'flood', 'wildfire', 'storm', 'heavyrain'],
          location_preferences: {
            lat: userLocation[0],
            lng: userLocation[1]
          },
          radius_km: 50.0,
          min_severity_level: 1,
          notification_methods: {
            push: true,
            email: false,
            sms: false
          },
          is_active: true
        };
        setSubscription(defaultSubscription);
      }
    } catch (error) {
      console.error('Error in loadSubscription:', error);
    }
  };

  // Load active alerts
  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('realtime_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading alerts:', error);
        return;
      }

      const typedAlerts: RealtimeAlert[] = (data || []).map(item => ({
        ...item,
        coordinates: typeof item.coordinates === 'object' && item.coordinates !== null
          ? item.coordinates as RealtimeAlert['coordinates']
          : { lat: 0, lng: 0 },
        affected_provinces: Array.isArray(item.affected_provinces) ? item.affected_provinces : [],
        metadata: item.metadata || {}
      }));

      setAlerts(typedAlerts);
    } catch (error) {
      console.error('Error in loadAlerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save or update user subscription
  const saveSubscription = async (newSubscription: Partial<UserAlertSubscription>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "ต้องเข้าสู่ระบบ",
          description: "กรุณาเข้าสู่ระบบเพื่อบันทึกการตั้งค่าการแจ้งเตือน",
          variant: "destructive",
        });
        return;
      }

      const updatedSubscription = { ...subscription, ...newSubscription, user_id: user.id };

      const { error } = await supabase
        .from('user_alert_subscriptions')
        .upsert(updatedSubscription, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving subscription:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถบันทึกการตั้งค่าได้",
          variant: "destructive",
        });
        return;
      }

      setSubscription(updatedSubscription);
      toast({
        title: "บันทึกเรียบร้อย",
        description: "การตั้งค่าการแจ้งเตือนได้ถูกบันทึกแล้ว",
      });
    } catch (error) {
      console.error('Error in saveSubscription:', error);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (
    coord1: [number, number], 
    coord2: [number, number]
  ): number => {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };

  // Filter alerts based on user preferences and location
  const getRelevantAlerts = () => {
    if (!subscription || !userLocation) return alerts;

    return alerts.filter(alert => {
      // Check if alert type is subscribed
      if (!subscription.alert_types.includes(alert.alert_type)) {
        return false;
      }

      // Check severity level
      if (alert.severity_level < subscription.min_severity_level) {
        return false;
      }

      // Check distance
      const alertLocation: [number, number] = [alert.coordinates.lat, alert.coordinates.lng];
      const distance = calculateDistance(userLocation, alertLocation);
      
      return distance <= Math.min(alert.radius_km, subscription.radius_km);
    });
  };

  // Create new alert
  const createAlert = async (alertData: Omit<RealtimeAlert, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "ต้องเข้าสู่ระบบ",
          description: "กรุณาเข้าสู่ระบบเพื่อสร้างการแจ้งเตือน",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('realtime_alerts')
        .insert({
          ...alertData,
          created_by: user.id,
        });

      if (error) {
        console.error('Error creating alert:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถสร้างการแจ้งเตือนได้",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "สร้างการแจ้งเตือนสำเร็จ",
        description: "การแจ้งเตือนได้ถูกส่งออกแล้ว",
      });

      loadAlerts();
    } catch (error) {
      console.error('Error in createAlert:', error);
    }
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('alert_deliveries')
        .update({ read_at: new Date().toISOString() })
        .eq('alert_id', alertId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error marking alert as read:', error);
      }
    } catch (error) {
      console.error('Error in markAlertAsRead:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    loadSubscription();
    loadAlerts();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('realtime-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_alerts'
        },
        (payload) => {
          console.log('New alert received:', payload);
          const newAlert = payload.new as RealtimeAlert;
          
          // Show notification for relevant alerts
          if (subscription && userLocation) {
            const alertLocation: [number, number] = [newAlert.coordinates.lat, newAlert.coordinates.lng];
            const distance = calculateDistance(userLocation, alertLocation);
            
            if (subscription.alert_types.includes(newAlert.alert_type) &&
                newAlert.severity_level >= subscription.min_severity_level &&
                distance <= Math.min(newAlert.radius_km, subscription.radius_km)) {
              
              const severityText = ['', 'ต่ำ', 'ปานกลาง', 'สูง', 'รุนแรง', 'วิกฤต'][newAlert.severity_level];
              
              toast({
                title: `🚨 ${newAlert.title}`,
                description: `ระดับความรุนแรง: ${severityText} - ${newAlert.message}`,
                variant: newAlert.severity_level >= 4 ? "destructive" : "default",
              });

              // Request notification permission and show browser notification
              if (subscription.notification_methods.push && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification(newAlert.title, {
                    body: newAlert.message,
                    icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
                    badge: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
                  });
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification(newAlert.title, {
                        body: newAlert.message,
                        icon: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
                        badge: '/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png',
                      });
                    }
                  });
                }
              }
            }
          }
          
          loadAlerts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'realtime_alerts'
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subscription, userLocation]);

  return {
    alerts,
    relevantAlerts: getRelevantAlerts(),
    subscription,
    isLoading,
    userLocation,
    saveSubscription,
    createAlert,
    markAlertAsRead,
    loadAlerts
  };
};
