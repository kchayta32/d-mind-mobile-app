
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

  // Function to determine region based on coordinates
  const getRegionFromCoordinates = (coordinates: [number, number]): 'thailand' | 'neighbors' | 'global' => {
    const [lng, lat] = coordinates;
    
    // Thailand boundaries (approximate)
    const thailandBounds = {
      north: 20.5,
      south: 5.5,
      east: 105.5,
      west: 97.3
    };
    
    // Check if coordinates are in Thailand
    if (lat >= thailandBounds.south && lat <= thailandBounds.north && 
        lng >= thailandBounds.west && lng <= thailandBounds.east) {
      return 'thailand';
    }
    
    // Check if coordinates are in neighboring countries (approximate)
    const neighborBounds = {
      north: 28.5,
      south: -11.0,
      east: 141.0,
      west: 92.0
    };
    
    if (lat >= neighborBounds.south && lat <= neighborBounds.north && 
        lng >= neighborBounds.west && lng <= neighborBounds.east) {
      return 'neighbors';
    }
    
    return 'global';
  };

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

    // Add earthquake data as alerts with proper null checks and region classification
    earthquakes.forEach(eq => {
      if (eq.magnitude >= 1.0 && eq.latitude !== undefined && eq.longitude !== undefined) {
        const coordinates: [number, number] = [eq.longitude, eq.latitude];
        const region = getRegionFromCoordinates(coordinates);
        
        // Use the location description if available, otherwise use magnitude info
        const locationText = eq.location || `${eq.latitude.toFixed(4)}, ${eq.longitude.toFixed(4)}`;
        const magnitudeText = `M ${eq.magnitude}`;
        
        // Add region prefix for better identification
        let regionPrefix = '';
        if (region === 'thailand') {
          regionPrefix = '[ประเทศไทย] ';
        } else if (region === 'neighbors') {
          regionPrefix = '[ประเทศเพื่อนบ้าน] ';
        } else {
          regionPrefix = '[ทั่วโลก] ';
        }
        
        const displayLocation = eq.location ? 
          `${regionPrefix}${magnitudeText} - ${eq.location}` : 
          `${regionPrefix}${magnitudeText} - ${locationText}`;
        
        combinedData.push({
          id: `earthquake-${eq.id}`,
          type: 'earthquake',
          severity: eq.magnitude >= 3.0 ? 'high' : eq.magnitude >= 2.0 ? 'medium' : 'low',
          location: displayLocation,
          description: `แผ่นดินไหวขนาด ${eq.magnitude} ความลึก ${eq.depth} กิโลเมตร`,
          coordinates: coordinates,
          start_time: eq.time,
          is_active: true,
          created_at: eq.time,
          updated_at: eq.time,
          magnitude: eq.magnitude,
          region: region
        });
      }
    });

    // Add rain sensor data as alerts for high humidity/rain with proper null checks
    rainSensors.forEach(sensor => {
      if (sensor.humidity && sensor.humidity >= 50 && sensor.coordinates) {
        const region = getRegionFromCoordinates(sensor.coordinates);
        
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
          rain_intensity: sensor.humidity,
          region: region
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
