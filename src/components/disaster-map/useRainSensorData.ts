
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RainSensor, RainSensorStats } from './types';

export const useRainSensorData = (timeFilter: string = 'realtime') => {
  const [sensors, setSensors] = useState<RainSensor[]>([]);
  const [stats, setStats] = useState<RainSensorStats>({
    total: 0,
    activeRaining: 0,
    averageHumidity: 0,
    maxHumidity: 0,
    last24Hours: 0
  });

  // Calculate date filter based on timeFilter
  const getDateFilter = () => {
    const now = new Date();
    switch (timeFilter) {
      case '3days':
        return new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'realtime':
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours for realtime
    }
  };

  const { data: sensorData, isLoading, error, refetch } = useQuery({
    queryKey: ['rain-sensors', timeFilter],
    queryFn: async () => {
      console.log('Fetching rain sensor data with filter:', timeFilter);
      
      const dateFilter = getDateFilter();
      
      let query = supabase
        .from('from_rain_sensor')
        .select('*');
      
      // Apply time filter
      if (timeFilter !== 'realtime') {
        query = query.gte('inserted_at', dateFilter.toISOString());
      } else {
        // For realtime, get recent data from last 24 hours
        query = query.gte('inserted_at', dateFilter.toISOString());
      }
      
      const { data, error } = await query.order('inserted_at', { ascending: false });

      if (error) {
        console.error('Error fetching rain sensor data:', error);
        throw error;
      }

      console.log('Rain sensor data fetched:', data?.length || 0, 'records');
      return data || [];
    },
    refetchInterval: timeFilter === 'realtime' ? 30000 : 60000,
  });

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      console.log('Processing rain sensor data:', sensorData.length, 'records');
      
      // Transform the data to include coordinates
      const transformedSensors: RainSensor[] = sensorData.map((sensor) => {
        // Use actual coordinates if available, otherwise skip this sensor
        if (sensor.latitude && sensor.longitude) {
          return {
            id: sensor.id,
            latitude: sensor.latitude,
            longitude: sensor.longitude,
            coordinates: [sensor.latitude, sensor.longitude] as [number, number],
            humidity: sensor.humidity,
            is_raining: sensor.is_raining,
            inserted_at: sensor.inserted_at,
            created_at: sensor.created_at
          };
        }
        return null;
      }).filter(Boolean) as RainSensor[];

      console.log('Transformed sensors:', transformedSensors.length);
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
      console.log('No sensor data or invalid data format');
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

  return {
    sensors,
    stats,
    isLoading,
    error,
    refetch
  };
};
