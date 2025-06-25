
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  radius_km: number;
  severity_threshold: number;
}

export const useEnhancedNotifications = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push: true,
    email: false,
    sms: false,
    radius_km: 50,
    severity_threshold: 3
  });
  
  const { sendNotification } = useNotifications();
  const { coordinates } = useGeolocation();
  const queryClient = useQueryClient();

  // Fetch notification history
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  // Save user location
  const saveLocationMutation = useMutation({
    mutationFn: async (location: { lat: number; lng: number; name?: string }) => {
      const { data, error } = await supabase
        .from('user_locations')
        .upsert({
          coordinates: { lat: location.lat, lng: location.lng },
          location_name: location.name || 'Current Location',
          is_active: true
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "บันทึกตำแหน่งสำเร็จ",
        description: "ระบบจะส่งการแจ้งเตือนตามตำแหน่งที่คุณกำหนด",
      });
    }
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Listen for real-time emergency alerts
  useEffect(() => {
    const channel = supabase
      .channel('emergency-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_alerts',
          filter: 'severity_level.gte.4'
        },
        (payload) => {
          const alert = payload.new as any;
          
          // Check if user is within alert radius
          if (coordinates && alert.coordinates) {
            const distance = calculateDistance(
              coordinates.lat,
              coordinates.lng,
              alert.coordinates.lat,
              alert.coordinates.lng
            );

            if (distance <= (alert.radius_km || 50) && alert.severity_level >= preferences.severity_threshold) {
              // Send push notification
              if (preferences.push) {
                sendNotification(`🚨 ${alert.title}`, {
                  body: alert.message,
                  icon: "/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png",
                  tag: `alert-${alert.id}`,
                  requireInteraction: true,
                });
              }

              // Show toast
              toast({
                title: "🚨 การแจ้งเตือนฉุกเฉิน",
                description: alert.title,
                variant: "destructive",
                duration: 10000,
              });

              // Store notification in database
              supabase.from('notifications').insert({
                title: alert.title,
                message: alert.message,
                type: 'emergency',
                severity_level: alert.severity_level,
                delivery_methods: { push: preferences.push },
                location_data: alert.coordinates,
                delivered_at: new Date().toISOString()
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coordinates, preferences, sendNotification]);

  // Auto-save location when coordinates change
  useEffect(() => {
    if (coordinates) {
      saveLocationMutation.mutate(coordinates);
    }
  }, [coordinates]);

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    localStorage.setItem('notification-preferences', JSON.stringify({ ...preferences, ...newPreferences }));
  }, [preferences]);

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  return {
    notifications,
    isLoading,
    preferences,
    updatePreferences,
    markAsRead: markAsReadMutation.mutate,
    saveLocation: saveLocationMutation.mutate
  };
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
