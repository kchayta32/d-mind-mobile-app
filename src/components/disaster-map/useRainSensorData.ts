
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RainSensor, RainSensorStats } from './types';

export const useRainSensorData = () => {
  const [sensors, setSensors] = useState<RainSensor[]>([]);
  const [stats, setStats] = useState<RainSensorStats>({
    total: 0,
    activeRaining: 0,
    averageHumidity: 0,
    maxHumidity: 0,
    last24Hours: 0
  });

  const { data: sensorData, isLoading, error, refetch } = useQuery({
    queryKey: ['rain-sensors'],
    queryFn: async () => {
      console.log('Fetching rain sensor data...');
      
      const { data, error } = await supabase
        .from('from_rain_sensor')
        .select('*')
        .order('inserted_at', { ascending: false });

      if (error) {
        console.error('Error fetching rain sensor data:', error);
        throw error;
      }

      console.log('Rain sensor data fetched:', data);
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      console.log('Processing rain sensor data:', sensorData);
      
      // Transform the data to include coordinates
      const transformedSensors: RainSensor[] = sensorData.map(sensor => {
        // Use actual coordinates if available, otherwise generate mock ones
        let coordinates: [number, number];
        
        if (sensor.latitude && sensor.longitude) {
          coordinates = [sensor.latitude, sensor.longitude];
        } else {
          // Generate mock coordinates based on sensor ID for Thailand
          const hash = sensor.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const lat = 13 + (hash % 10); // Thailand latitude range roughly 8-20
          const lng = 100 + (hash % 6); // Thailand longitude range roughly 97-105
          coordinates = [lat + (hash % 100) / 1000, lng + (hash % 100) / 1000];
        }

        return {
          ...sensor,
          coordinates
        };
      });

      console.log('Transformed sensors:', transformedSensors);
      setSensors(transformedSensors);

      // Calculate statistics
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentSensors = transformedSensors.filter(sensor => 
        sensor.inserted_at && new Date(sensor.inserted_at) >= last24Hours
      );

      const activeRaining = transformedSensors.filter(sensor => sensor.is_raining === true).length;
      const humidityValues = transformedSensors
        .filter(sensor => sensor.humidity !== null && sensor.humidity !== undefined)
        .map(sensor => sensor.humidity!);
      
      const averageHumidity = humidityValues.length > 0 
        ? humidityValues.reduce((sum, h) => sum + h, 0) / humidityValues.length 
        : 0;
      
      const maxHumidity = humidityValues.length > 0 
        ? Math.max(...humidityValues) 
        : 0;

      const newStats = {
        total: transformedSensors.length,
        activeRaining,
        averageHumidity: Math.round(averageHumidity),
        maxHumidity,
        last24Hours: recentSensors.length
      };

      console.log('Calculated stats:', newStats);
      setStats(newStats);
    } else {
      console.log('No sensor data or invalid data format:', sensorData);
      setSensors([]);
      setStats({
        total: 0,
        activeRaining: 0,
        averageHumidity: 0,
        maxHumidity: 0,
        last24Hours: 0
      });
    }
  }, [sensorData]);

  console.log('useRainSensorData returning:', { sensors: sensors.length, stats, isLoading, error });

  return {
    sensors,
    stats,
    isLoading,
    error,
    refetch
  };
};
