
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisasterAlert as AlertType } from '@/components/disaster-alerts/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface DisasterAlertProps {
  isActive: boolean;
  message?: string;
}

const DisasterAlert: React.FC<DisasterAlertProps> = ({ 
  isActive = false, 
  message = "ไม่พบการแจ้งเตือนในพื้นที่ของคุณ" 
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyAlerts, setNearbyAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lng, lat]);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "ไม่สามารถรับตำแหน่งของคุณ",
            description: "กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อแสดงการแจ้งเตือนในพื้นที่",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "ไม่รองรับ Geolocation",
        description: "เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, []);

  // Calculate distance between two coordinates in kilometers (using Haversine formula)
  const calculateDistance = (
    coord1: [number, number], 
    coord2: [number, number]
  ): number => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
  };

  // Fetch active alerts when user location is available
  useEffect(() => {
    if (!userLocation) return;

    const fetchActiveAlerts = async () => {
      try {
        const { data: alerts, error } = await supabase
          .from('disaster_alerts')
          .select('*')
          .eq('is_active', true);

        if (error) {
          throw error;
        }

        if (alerts) {
          // Filter alerts that have coordinates and are within 800km
          const nearbyActiveAlerts = alerts
            .filter(alert => alert.coordinates)
            .filter(alert => {
              // Parse coordinates from Supabase's JSON format
              let alertCoords: [number, number];
              
              if (typeof alert.coordinates === 'string') {
                try {
                  alertCoords = JSON.parse(alert.coordinates) as [number, number];
                } catch (e) {
                  console.error("Invalid coordinates format:", alert.coordinates);
                  return false;
                }
              } else if (Array.isArray(alert.coordinates) && alert.coordinates.length === 2) {
                alertCoords = alert.coordinates as [number, number];
              } else {
                console.error("Unsupported coordinates format:", alert.coordinates);
                return false;
              }
              
              const distance = calculateDistance(userLocation, alertCoords);
              return distance <= 800; // Filter alerts within 800km
            })
            .map(alert => {
              // Convert coordinates to the proper format for our AlertType
              let coords: [number, number];
              
              if (typeof alert.coordinates === 'string') {
                coords = JSON.parse(alert.coordinates) as [number, number];
              } else if (Array.isArray(alert.coordinates)) {
                coords = alert.coordinates as [number, number];
              } else {
                coords = [0, 0]; // Fallback
              }
              
              return {
                ...alert,
                coordinates: coords
              } as AlertType;
            })
            .sort((a, b) => {
              const distA = calculateDistance(userLocation, a.coordinates as [number, number]);
              const distB = calculateDistance(userLocation, b.coordinates as [number, number]);
              return distA - distB; // Sort by proximity
            });

          setNearbyAlerts(nearbyActiveAlerts);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveAlerts();
  }, [userLocation]);

  const getAlertMessage = () => {
    if (loading) return "กำลังตรวจสอบการแจ้งเตือนในพื้นที่...";
    
    if (nearbyAlerts.length === 0) {
      return "ไม่พบการแจ้งเตือนในรัศมี 800 กิโลเมตร";
    }
    
    const closestAlert = nearbyAlerts[0];
    const distance = userLocation && closestAlert.coordinates ? 
      Math.round(calculateDistance(
        userLocation, 
        closestAlert.coordinates as [number, number]
      )) : 0;
      
    return `${closestAlert.type === 'wildfire' ? 'ไฟป่า' : 
            closestAlert.type === 'storm' ? 'พายุ' : 
            closestAlert.type === 'flood' ? 'น้ำท่วม' : 
            closestAlert.type === 'strongwind' ? 'ลมแรง' : 
            closestAlert.type === 'heavyrain' ? 'ฝนตกหนัก' : 
            closestAlert.type} ที่ ${closestAlert.location} (ห่างประมาณ ${distance} กม.)`;
  };

  const hasNearbyAlerts = nearbyAlerts.length > 0;

  return (
    <Card className="w-full bg-guardian-dark-purple text-white shadow-md mb-4">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="text-lg font-medium">การแจ้งเตือนภัยพิบัติ</CardTitle>
        {hasNearbyAlerts ? 
          <AlertTriangle size={20} className="text-red-400 animate-pulse" /> : 
          <Bell size={20} />
        }
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className={`${hasNearbyAlerts ? "text-red-400 font-bold" : "text-gray-200"}`}>
          {getAlertMessage()}
        </p>
      </CardContent>
    </Card>
  );
};

export default DisasterAlert;
