
import { useState, useEffect } from 'react';
import { DisasterAlert } from '@/components/disaster-alerts/types';
import { useRainSensorData } from '@/components/disaster-map/useRainSensorData';
import { useEarthquakeData } from '@/components/disaster-map/useEarthquakeData';

export const useSharedDisasterAlerts = () => {
  const [combinedAlerts, setCombinedAlerts] = useState<DisasterAlert[]>([]);

  // Get data from existing sources
  const { earthquakes } = useEarthquakeData();
  const { sensors: rainSensors } = useRainSensorData();

  // Helper function to generate random date from April 2025 onwards
  const generateRandomDate = (): string => {
    const startDate = new Date('2025-04-01'); // April 1, 2025
    const endDate = new Date(); // Current date
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(randomTime).toISOString();
  };

  // Helper function to check if a date is within the last 24 hours
  const isWithinLast24Hours = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return date >= twentyFourHoursAgo;
  };

  useEffect(() => {
    const combinedData: DisasterAlert[] = [];

    // Add earthquake data as alerts with proper null checks - only from last 24 hours
    earthquakes.forEach(eq => {
      if (eq.magnitude >= 1.0 && 
          eq.latitude !== undefined && 
          eq.longitude !== undefined &&
          isWithinLast24Hours(eq.time)) {
        
        const locationText = eq.location || `${eq.latitude.toFixed(4)}, ${eq.longitude.toFixed(4)}`;
        const magnitudeText = `M ${eq.magnitude}`;
        const displayLocation = eq.location ? `${magnitudeText} - ${eq.location}` : `${magnitudeText} - ${locationText}`;
        
        // Use random date for created_at and updated_at
        const randomDate = generateRandomDate();
        
        combinedData.push({
          id: `earthquake-${eq.id}`,
          type: 'earthquake',
          severity: eq.magnitude >= 3.0 ? 'high' : eq.magnitude >= 2.0 ? 'medium' : 'low',
          location: displayLocation,
          description: `แผ่นดินไหวขนาด ${eq.magnitude} ความลึก ${eq.depth} กิโลเมตร`,
          coordinates: [eq.longitude, eq.latitude],
          start_time: eq.time,
          is_active: true,
          created_at: randomDate,
          updated_at: randomDate,
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
        
        // Use random date for created_at and updated_at
        const randomDate = generateRandomDate();
        
        combinedData.push({
          id: `rain-${sensor.id}`,
          type: 'heavyrain',
          severity: sensor.humidity >= 70 ? 'high' : 'medium',
          location: `เซ็นเซอร์ฝน #${sensor.id}`,
          description: `ความชื้น ${sensor.humidity}% ${sensor.is_raining ? '(กำลังฝนตก)' : ''}`,
          coordinates: sensor.coordinates,
          start_time: sensorTime,
          is_active: sensor.is_raining || false,
          created_at: randomDate,
          updated_at: randomDate,
          rain_intensity: sensor.humidity
        });
      }
    });

    setCombinedAlerts(combinedData);
  }, [earthquakes, rainSensors]);

  return {
    alerts: combinedAlerts,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};
