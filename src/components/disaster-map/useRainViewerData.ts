
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface RainViewerFrame {
  time: number;
  path: string;
}

export interface RainViewerData {
  version: string;
  generated: number;
  host: string;
  radar: {
    past: RainViewerFrame[];
    nowcast: RainViewerFrame[];
  };
  satellite: {
    infrared: RainViewerFrame[];
  };
}

export interface RainViewerStats {
  pastFrames: number;
  futureFrames: number;
  latestTime: string;
  oldestTime: string;
}

export const useRainViewerData = () => {
  const [rainData, setRainData] = useState<RainViewerData | null>(null);
  const [stats, setStats] = useState<RainViewerStats>({
    pastFrames: 0,
    futureFrames: 0,
    latestTime: '',
    oldestTime: ''
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rainviewer-data'],
    queryFn: async () => {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');

      if (!response.ok) {
        throw new Error('Failed to fetch RainViewer data');
      }

      const data = await response.json();
      return data as RainViewerData;
    },
    refetchInterval: 600000, // Refresh every 10 minutes
  });

  useEffect(() => {
    if (data) {
      setRainData(data);

      // Calculate statistics
      const pastFrames = data.radar?.past?.length || 0;
      const futureFrames = data.radar?.nowcast?.length || 0;

      let latestTime = '';
      let oldestTime = '';

      if (pastFrames > 0) {
        const latestFrame = data.radar.past[pastFrames - 1];
        const oldestFrame = data.radar.past[0];
        latestTime = new Date(latestFrame.time * 1000).toLocaleString('th-TH');
        oldestTime = new Date(oldestFrame.time * 1000).toLocaleString('th-TH');
      }

      const newStats = {
        pastFrames,
        futureFrames,
        latestTime,
        oldestTime
      };

      setStats(newStats);
    }
  }, [data]);

  return {
    rainData,
    stats,
    isLoading,
    error,
    refetch
  };
};
