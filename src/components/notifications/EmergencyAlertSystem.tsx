
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Siren, AlertTriangle, Phone, MapPin, Clock, Users } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity_level: number;
  alert_type: string;
  coordinates: { lat: number; lng: number };
  radius_km: number;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  affected_provinces: string[];
}

const EmergencyAlertSystem: React.FC = () => {
  const { sendNotification } = useNotifications();
  const { toast } = useToast();
  const [sosActivated, setSosActivated] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch active emergency alerts
  const { data: emergencyAlerts = [], refetch } = useQuery({
    queryKey: ['emergency-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('realtime_alerts')
        .select('*')
        .eq('is_active', true)
        .gte('severity_level', 4) // Only high severity alerts
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      return data.map(alert => ({
        ...alert,
        coordinates: typeof alert.coordinates === 'object' && alert.coordinates !== null 
          ? alert.coordinates as { lat: number; lng: number }
          : { lat: 0, lng: 0 },
        affected_provinces: alert.affected_provinces || []
      })) as EmergencyAlert[];
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Real-time updates for emergency alerts
  useEffect(() => {
    const channel = supabase
      .channel('emergency-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_alerts',
          filter: 'severity_level.gte.4'
        },
        (payload) => {
          const newAlert = payload.new as any;
          
          // Send push notification without actions
          sendNotification(`🚨 ${newAlert.title}`, {
            body: newAlert.message,
            icon: "/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png",
            badge: "/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png",
            tag: `emergency-${newAlert.id}`,
            requireInteraction: true
          });

          // Show toast
          toast({
            title: "🚨 แจ้งเตือนภัยฉุกเฉิน",
            description: newAlert.title,
            variant: "destructive",
            duration: 10000,
          });

          // Play emergency sound
          playEmergencySound();
          
          // Refetch data
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sendNotification, toast, refetch]);

  const playEmergencySound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a more urgent emergency sound
      for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + i * 0.5);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + i * 0.5 + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.5 + 0.4);
        
        oscillator.start(audioContext.currentTime + i * 0.5);
        oscillator.stop(audioContext.currentTime + i * 0.5 + 0.4);
      }
    } catch (error) {
      console.error('Error playing emergency sound:', error);
    }
  };

  const handleSOSActivation = () => {
    setSosActivated(true);
    
    // Get user's current location and send SOS alert
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          try {
            // Send SOS notification
            sendNotification("🆘 SOS ถูกเปิดใช้งาน", {
              body: `ตำแหน่ง: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
              icon: "/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png",
              tag: "sos-alert",
              requireInteraction: true,
            });

            toast({
              title: "🆘 SOS เปิดใช้งานแล้ว",
              description: "ข้อมูลตำแหน่งถูกส่งไปยังหน่วยงานที่เกี่ยวข้องแล้ว",
              variant: "destructive",
              duration: 5000,
            });

            // Auto-reset SOS after 30 seconds
            setTimeout(() => {
              setSosActivated(false);
            }, 30000);

          } catch (error) {
            console.error('Error sending SOS:', error);
            toast({
              title: "ข้อผิดพลาด",
              description: "ไม่สามารถส่งสัญญาณ SOS ได้",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.error('Error getting location for SOS:', error);
          toast({
            title: "ข้อผิดพลาด",
            description: "ไม่สามารถระบุตำแหน่งได้",
            variant: "destructive",
          });
        }
      );
    }
  };

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

  return (
    <div className="space-y-6">
      {/* SOS Emergency Button */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Siren className="h-5 w-5" />
            ปุ่มฉุกเฉิน SOS
          </CardTitle>
          <CardDescription className="text-red-600">
            กดปุ่มนี้ในสถานการณ์ฉุกเฉินเท่านั้น
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSOSActivation}
            disabled={sosActivated}
            className={`w-full h-16 text-lg font-bold ${
              sosActivated 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 animate-pulse'
            }`}
          >
            {sosActivated ? (
              <>
                <Users className="mr-2 h-6 w-6" />
                SOS ถูกเปิดใช้งานแล้ว
              </>
            ) : (
              <>
                <Phone className="mr-2 h-6 w-6" />
                🆘 กดเพื่อขอความช่วยเหลือ
              </>
            )}
          </Button>
          {sosActivated && (
            <p className="text-sm text-red-600 mt-2 text-center">
              ระบบจะรีเซ็ตอัตโนมัติใน 30 วินาที
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active Emergency Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            แจ้งเตือนภัยฉุกเฉิน
          </CardTitle>
          <CardDescription>
            การแจ้งเตือนระดับฉุกเฉินที่ใช้งานอยู่
          </CardDescription>
        </CardHeader>
        <CardContent>
          {emergencyAlerts.length === 0 ? (
            <Alert>
              <AlertDescription>
                ไม่มีการแจ้งเตือนภัยฉุกเฉินในขณะนี้
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {emergencyAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-4 bg-red-50 border-red-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getSeverityColor(alert.severity_level)} text-white`}>
                        {getSeverityText(alert.severity_level)}
                      </Badge>
                      <Badge variant="outline">
                        {alert.alert_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.created_at).toLocaleString('th-TH')}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-red-800 mb-2">
                    {alert.title}
                  </h3>
                  
                  <p className="text-red-700 mb-3">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      รัศมี {alert.radius_km} กม.
                    </div>
                    {alert.affected_provinces.length > 0 && (
                      <div>
                        จังหวัด: {alert.affected_provinces.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyAlertSystem;
