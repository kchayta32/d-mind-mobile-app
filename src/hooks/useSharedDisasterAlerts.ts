
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DisasterAlert } from '@/components/disaster-alerts/types';
import { useRainSensorData } from '@/components/disaster-map/useRainSensorData';
import { useEarthquakeData } from '@/components/disaster-map/useEarthquakeData';
import { toast } from '@/components/ui/use-toast';

export const useSharedDisasterAlerts = () => {
  const [combinedAlerts, setCombinedAlerts] = useState<DisasterAlert[]>([]);

  // Get data from existing sources
  const { earthquakes } = useEarthquakeData();
  const { sensors: rainSensors } = useRainSensorData();

  // Fetch disaster alerts from database
  const { data: dbAlerts = [], isLoading: isLoadingDb, error: dbError, refetch } = useQuery({
    queryKey: ['disaster-alerts-shared'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disaster_alerts')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching disaster alerts:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลการเตือนภัยได้",
          variant: "destructive",
        });
        return [];
      }

      return data as DisasterAlert[];
    },
    refetchInterval: 60000,
  });

  // Helper function to check if a date is within the last 24 hours
  const isWithinLast24Hours = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return date >= twentyFourHoursAgo;
  };

  useEffect(() => {
    const combinedData: DisasterAlert[] = [];

    // Filter database alerts to only include those from the last 24 hours
    const recentDbAlerts = dbAlerts.filter(alert => 
      isWithinLast24Hours(alert.start_time) && alert.is_active
    );
    combinedData.push(...recentDbAlerts);

    // Add earthquake data as alerts with proper null checks - only from last 24 hours
    earthquakes.forEach(eq => {
      if (eq.magnitude >= 1.0 && 
          eq.latitude !== undefined && 
          eq.longitude !== undefined &&
          isWithinLast24Hours(eq.time)) {
        
        const locationText = eq.location || `${eq.latitude.toFixed(4)}, ${eq.longitude.toFixed(4)}`;
        const magnitudeText = `M ${eq.magnitude}`;
        const displayLocation = eq.location ? `${magnitudeText} - ${eq.location}` : `${magnitudeText} - ${locationText}`;
        
        combinedData.push({
          id: `earthquake-${eq.id}`,
          type: 'earthquake',
          severity: eq.magnitude >= 3.0 ? 'high' : eq.magnitude >= 2.0 ? 'medium' : 'low',
          location: displayLocation,
          description: `แผ่นดินไหวขนาด ${eq.magnitude} ความลึก ${eq.depth} กิโลเมตร`,
          coordinates: [eq.longitude, eq.latitude],
          start_time: eq.time,
          is_active: true,
          created_at: eq.time,
          updated_at: eq.time,
          magnitude: eq.magnitude
        });
      }
    });

    // Add rain sensor data as alerts for high humidity/rain - only from last 24 hours
    rainSensors.forEach(sensor => {
      const sensorTime = sensor.inserted_at || sensor.created_at || new Date().toISOString();
      
      if (sensor.humidity && 
          sensor.humidity >= 50 && 
          sensor.coordinates &&
          isWithinLast24Hours(sensorTime)) {
        
        combinedData.push({
          id: `rain-${sensor.id}`,
          type: 'heavyrain',
          severity: sensor.humidity >= 70 ? 'high' : 'medium',
          location: `เซ็นเซอร์ฝน #${sensor.id}`,
          description: `ความชื้น ${sensor.humidity}% ${sensor.is_raining ? '(กำลังฝนตก)' : ''}`,
          coordinates: sensor.coordinates,
          start_time: sensorTime,
          is_active: sensor.is_raining || false,
          created_at: sensorTime,
          updated_at: sensorTime,
          rain_intensity: sensor.humidity
        });
      }
    });

    setCombinedAlerts(combinedData);
  }, [dbAlerts, earthquakes, rainSensors]);

  return {
    alerts: combinedAlerts,
    isLoading: isLoadingDb,
    error: dbError,
    refetch
  };
};
