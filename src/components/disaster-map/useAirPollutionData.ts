
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AirPollutionData, AirPollutionStats } from './types';

const API_BASE_URL = 'https://air.gistda.or.th';

export const useAirPollutionData = () => {
  const [stations, setStations] = useState<AirPollutionData[]>([]);
  const [stats, setStats] = useState<AirPollutionStats>({
    totalStations: 0,
    averagePM25: 0,
    maxPM25: 0,
    unhealthyStations: 0,
    last24Hours: 0
  });

  // Fetch current pollution data
  const { data: pollutionData, isLoading, error, refetch } = useQuery({
    queryKey: ['air-pollution'],
    queryFn: async () => {
      console.log('Fetching air pollution data...');
      
      const response = await fetch(`${API_BASE_URL}/rest/getPollution?lv=0&type=pm25&id=THA`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch air pollution data');
      }

      const data = await response.json();
      console.log('Air pollution data fetched:', data);
      return data;
    },
    refetchInterval: 900000, // Refresh every 15 minutes
  });

  useEffect(() => {
    if (!pollutionData) return;

    // Transform API data to our format
    const transformedStations: AirPollutionData[] = [];
    
    if (pollutionData.data) {
      pollutionData.data.forEach((item: any, index: number) => {
        if (item.lat && item.lng) {
          transformedStations.push({
            id: `station-${index}`,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            pm25: item.pm25 ? parseFloat(item.pm25) : undefined,
            aod443: item.aod443 ? parseFloat(item.aod443) : undefined,
            ssa443: item.ssa443 ? parseFloat(item.ssa443) : undefined,
            no2trop: item.no2trop ? parseFloat(item.no2trop) : undefined,
            so2: item.so2 ? parseFloat(item.so2) : undefined,
            o3total: item.o3total ? parseFloat(item.o3total) : undefined,
            uvai: item.uvai ? parseFloat(item.uvai) : undefined,
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    console.log('Transformed air pollution stations:', transformedStations.length);
    setStations(transformedStations);

    // Calculate statistics
    const validPM25Stations = transformedStations.filter(s => s.pm25 !== undefined);
    const pm25Values = validPM25Stations.map(s => s.pm25!);
    
    const totalStations = transformedStations.length;
    const averagePM25 = pm25Values.length > 0 
      ? pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length 
      : 0;
    const maxPM25 = pm25Values.length > 0 ? Math.max(...pm25Values) : 0;
    const unhealthyStations = pm25Values.filter(val => val > 75).length; // PM2.5 > 75 considered unhealthy

    const newStats = {
      totalStations,
      averagePM25: Math.round(averagePM25 * 10) / 10,
      maxPM25: Math.round(maxPM25 * 10) / 10,
      unhealthyStations,
      last24Hours: totalStations // All current data
    };

    console.log('Calculated air pollution stats:', newStats);
    setStats(newStats);
  }, [pollutionData]);

  console.log('useAirPollutionData returning:', { 
    stations: stations.length, 
    stats, 
    isLoading, 
    error 
  });

  return {
    stations,
    stats,
    isLoading,
    error,
    refetch
  };
};
