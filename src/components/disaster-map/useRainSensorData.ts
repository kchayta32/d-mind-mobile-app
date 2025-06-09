
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
        return new Date(now.getTime() - 1 * 60 * 60 * 1000); // Last hour for realtime
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
    refetchInterval: timeFilter === 'realtime' ? 30000 : 60000, // More frequent for realtime
  });

  useEffect(() => {
    if (sensorData && Array.isArray(sensorData)) {
      console.log('Processing rain sensor data:', sensorData.length, 'records');
      
      // Transform the data to include coordinates
      const transformedSensors: RainSensor[] = sensorData.map((sensor, index) => {
        // Use actual coordinates if available, otherwise generate mock ones for Thailand
        let coordinates: [number, number];
        
        if (sensor.latitude && sensor.longitude) {
          coordinates = [sensor.latitude, sensor.longitude];
        } else {
          // Generate mock coordinates based on sensor ID for Thailand regions
          const hash = (sensor.id || index).toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const regions = [
            [13.7563, 100.5018], // Bangkok
            [18.7883, 98.9853],  // Chiang Mai
            [16.4637, 102.8236], // Khon Kaen
            [7.8804, 98.3923],   // Phuket
            [12.9236, 100.8824], // Pattaya
          ];
          const regionIndex = hash % regions.length;
          const baseCoords = regions[regionIndex];
          
          // Add some randomness around the base coordinates
          const latOffset = ((hash % 200) - 100) / 1000; // ±0.1 degree
          const lngOffset = ((hash % 200) - 100) / 1000;
          
          coordinates = [
            baseCoords[0] + latOffset,
            baseCoords[1] + lngOffset
          ];
        }

        return {
          ...sensor,
          coordinates
        };
      });

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
