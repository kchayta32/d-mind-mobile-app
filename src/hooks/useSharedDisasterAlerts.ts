
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

  useEffect(() => {
    const combinedData: DisasterAlert[] = [...dbAlerts];

    // Add earthquake data as alerts with proper null checks
    earthquakes.forEach(eq => {
      if (eq.magnitude >= 1.0 && eq.latitude !== undefined && eq.longitude !== undefined) {
        // Use the location description if available, otherwise use magnitude info
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

    // Add rain sensor data as alerts for high humidity/rain with proper null checks
    rainSensors.forEach(sensor => {
      if (sensor.humidity && sensor.humidity >= 50 && sensor.coordinates) {
        combinedData.push({
          id: `rain-${sensor.id}`,
          type: 'heavyrain',
          severity: sensor.humidity >= 70 ? 'high' : 'medium',
          location: `เซ็นเซอร์ฝน #${sensor.id}`,
          description: `ความชื้น ${sensor.humidity}% ${sensor.is_raining ? '(กำลังฝนตก)' : ''}`,
          coordinates: sensor.coordinates,
          start_time: sensor.inserted_at || sensor.created_at || new Date().toISOString(),
          is_active: sensor.is_raining || false,
          created_at: sensor.inserted_at || sensor.created_at || new Date().toISOString(),
          updated_at: sensor.inserted_at || sensor.created_at || new Date().toISOString(),
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
