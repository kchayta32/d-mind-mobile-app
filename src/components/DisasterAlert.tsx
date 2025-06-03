
import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DisasterAlert as AlertType } from '@/components/disaster-alerts/types';
import { useSharedDisasterAlerts } from '@/hooks/useSharedDisasterAlerts';
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

  const { alerts } = useSharedDisasterAlerts();

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

  // Filter alerts based on your conditions
  useEffect(() => {
    if (!userLocation || !alerts.length) {
      setLoading(false);
      return;
    }

    const filteredAlerts = alerts
      .filter(alert => alert.coordinates && alert.is_active)
      .filter(alert => {
        const distance = calculateDistance(userLocation, alert.coordinates as [number, number]);
        
        // Apply your specific conditions
        if (alert.type === 'earthquake') {
          // 3+ magnitude within 800km OR 1+ magnitude within 500m
          if (alert.magnitude && alert.magnitude >= 3.0 && distance <= 800) {
            return true;
          }
          if (alert.magnitude && alert.magnitude >= 1.0 && distance <= 0.5) {
            return true;
          }
        }
        
        if (alert.type === 'heavyrain') {
          // 50%+ humidity within 100m OR 70%+ humidity within 1km
          if (alert.rain_intensity && alert.rain_intensity >= 50 && distance <= 0.1) {
            return true;
          }
          if (alert.rain_intensity && alert.rain_intensity >= 70 && distance <= 1.0) {
            return true;
          }
        }
        
        return false;
      })
      .sort((a, b) => {
        const distA = calculateDistance(userLocation, a.coordinates as [number, number]);
        const distB = calculateDistance(userLocation, b.coordinates as [number, number]);
        return distA - distB; // Sort by proximity
      });

    setNearbyAlerts(filteredAlerts);
    setLoading(false);
  }, [userLocation, alerts]);

  const getAlertMessage = () => {
    if (loading) return "กำลังตรวจสอบการแจ้งเตือนในพื้นที่...";
    
    if (nearbyAlerts.length === 0) {
      return "ไม่พบการแจ้งเตือนภัยพิบัติในพื้นที่ของคุณ";
    }
    
    const closestAlert = nearbyAlerts[0];
    const distance = userLocation && closestAlert.coordinates ? 
      calculateDistance(userLocation, closestAlert.coordinates as [number, number]) : 0;
      
    const distanceText = distance < 1 ? 
      `${Math.round(distance * 1000)} เมตร` : 
      `${Math.round(distance)} กิโลเมตร`;
      
    const typeText = closestAlert.type === 'earthquake' ? 
      `แผ่นดินไหวขนาด ${closestAlert.magnitude}` :
      closestAlert.type === 'heavyrain' ? 
      `ฝนตกหนัก ความชื้น ${closestAlert.rain_intensity}%` :
      closestAlert.type;
      
    return `${typeText} ที่ ${closestAlert.location} (ห่างประมาณ ${distanceText})`;
  };

  const hasNearbyAlerts = nearbyAlerts.length > 0;

  return (
    <Card className="w-full bg-guardian-dark-blue text-white shadow-md mb-4">
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
