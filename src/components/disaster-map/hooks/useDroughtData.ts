
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface DroughtStats {
  nationalAverage: number;
  topProvinces: Array<{
    province: string;
    percentage: number;
    color: string;
  }>;
  lastUpdated: string;
}

export const useDroughtData = () => {
  const [stats, setStats] = useState<DroughtStats>({
    nationalAverage: 41.2,
    topProvinces: [
      { province: 'อำนาจเจริญ', percentage: 53.4, color: '#f59e0b' },
      { province: 'จสุรินทร์', percentage: 51, color: '#f59e0b' },
      { province: 'ยโสธร', percentage: 51, color: '#f59e0b' },
      { province: 'จพิจิตร', percentage: 50.4, color: '#f59e0b' },
      { province: 'จอุบลราชธานี', percentage: 49.9, color: '#eab308' }
    ],
    lastUpdated: new Date().toISOString()
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => ({
        ...prevStats,
        nationalAverage: 41.2 + (Math.random() - 0.5) * 2,
        lastUpdated: new Date().toISOString()
      }));
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
};
