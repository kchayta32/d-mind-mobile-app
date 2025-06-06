import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface GISTDAHotspot {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    _id: string;
    acq_date: string;
    acq_time: string;
    amphoe: string;
    ap_tn: string;
    bright_t31?: number;
    bright_ti4?: number;
    bright_ti5?: number;
    brightness?: number;
    changwat: string;
    confidence: number | string;
    ct_tn: string;
    frp: number;
    hotspotid: string;
    instrument: string;
    latitude: number;
    longitude: number;
    lu_name: string;
    pv_tn: string;
    satellite: string;
    scan: number;
    tambol: string;
    tb_tn: string;
    th_date: string;
    th_time: string;
    track: number;
    version: string;
    village: string;
  };
}

export interface GISTDAData {
  type: string;
  features: GISTDAHotspot[];
  timeStamp: string;
  numberMatched: number;
  numberReturned: number;
}

export interface GISTDAStats {
  totalHotspots: number;
  modisCount: number;
  viirsCount: number;
  highConfidenceCount: number;
  averageConfidence: number;
  last24Hours: number;
  last7Days: number;
}

const API_KEY = 'wFaHcoOyzK53pVqspkI9Mvobjm5vWzHVOwGOjzW4f2nAAvsVf8CETklHpX1peaDF';
const API_BASE_URL = 'https://api-gateway.gistda.or.th/api/2.0/resources/features';

export const useGISTDAData = () => {
  const [hotspots, setHotspots] = useState<GISTDAHotspot[]>([]);
  const [stats, setStats] = useState<GISTDAStats>({
    totalHotspots: 0,
    modisCount: 0,
    viirsCount: 0,
    highConfidenceCount: 0,
    averageConfidence: 0,
    last24Hours: 0,
    last7Days: 0
  });

  // Fetch VIIRS 1 day data
  const { data: viirs1DayData } = useQuery({
    queryKey: ['gistda-viirs-1day'],
    queryFn: async () => {
      console.log('Fetching GISTDA VIIRS 1 day data...');
      
      const response = await fetch(`${API_BASE_URL}/viirs/1day?limit=1000&offset=0&ct_tn=%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%AD%E0%B8%B2%E0%B8%93%E0%B8%B2%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B9%84%E0%B8%97%E0%B8%A2`, {
        headers: {
          'accept': 'application/json',
          'API-Key': API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GISTDA VIIRS 1 day data: ${response.status}`);
      }

      const data = await response.json();
      console.log('GISTDA VIIRS 1 day data fetched:', data);
      return data as GISTDAData;
    },
    refetchInterval: 900000,
  });

  // Fetch VIIRS 3 days data
  const { data: viirs3DaysData, isLoading: isLoadingViirs3Days, error: viirs3DaysError } = useQuery({
    queryKey: ['gistda-viirs-3days'],
    queryFn: async () => {
      console.log('Fetching GISTDA VIIRS 3 days data...');
      
      const response = await fetch(`${API_BASE_URL}/viirs/3days?limit=1000&offset=0&ct_tn=%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%AD%E0%B8%B2%E0%B8%93%E0%B8%B2%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B9%84%E0%B8%97%E0%B8%A2`, {
        headers: {
          'accept': 'application/json',
          'API-Key': API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GISTDA VIIRS 3 days data: ${response.status}`);
      }

      const data = await response.json();
      console.log('GISTDA VIIRS 3 days data fetched:', data);
      return data as GISTDAData;
    },
    refetchInterval: 900000,
  });

  // Keep existing MODIS data for backward compatibility
  const { data: modisData, isLoading: isLoadingModis, error: modisError } = useQuery({
    queryKey: ['gistda-modis'],
    queryFn: async () => {
      console.log('Fetching GISTDA MODIS data...');
      
      const response = await fetch(`https://disaster.gistda.or.th/api/1.0/documents/fire/hotspot/modis/3days?limit=1000&offset=0`, {
        headers: {
          'accept': 'application/json',
          'API-Key': 'JMGZneff56qsmjWKbyYdYBUbTx8zHHOChXTD1Ogl8jmrEgnHbXiH3H5QvQwN3yg1'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GISTDA MODIS data: ${response.status}`);
      }

      const data = await response.json();
      console.log('GISTDA MODIS data fetched:', data);
      return data as GISTDAData;
    },
    refetchInterval: 900000,
  });

  useEffect(() => {
    const combinedHotspots: GISTDAHotspot[] = [];
    
    if (modisData?.features) {
      combinedHotspots.push(...modisData.features.map(f => ({
        ...f,
        properties: { ...f.properties, instrument: 'MODIS' }
      })));
    }
    
    if (viirs3DaysData?.features) {
      combinedHotspots.push(...viirs3DaysData.features.map(f => ({
        ...f,
        properties: { ...f.properties, instrument: 'VIIRS' }
      })));
    }

    console.log('Combined hotspots:', combinedHotspots.length);
    setHotspots(combinedHotspots);

    // Calculate statistics
    const modisCount = modisData?.features?.length || 0;
    const viirsCount = viirs3DaysData?.features?.length || 0;
    const viirs1DayCount = viirs1DayData?.features?.length || 0;
    const totalHotspots = combinedHotspots.length;
    
    // Calculate high confidence count
    const highConfidenceCount = combinedHotspots.filter(h => {
      const confidence = h.properties.confidence;
      if (typeof confidence === 'number') {
        return confidence >= 80;
      } else if (typeof confidence === 'string') {
        return confidence === 'nominal' || confidence === 'high';
      }
      return false;
    }).length;
    
    // Calculate average confidence
    const numericConfidences = combinedHotspots
      .map(h => h.properties.confidence)
      .filter(c => typeof c === 'number') as number[];
    
    const averageConfidence = numericConfidences.length > 0 
      ? numericConfidences.reduce((sum, c) => sum + c, 0) / numericConfidences.length 
      : 0;

    const newStats = {
      totalHotspots,
      modisCount,
      viirsCount,
      highConfidenceCount,
      averageConfidence: Math.round(averageConfidence),
      last24Hours: viirs1DayCount, // Only VIIRS 1 day data for 24 hours
      last7Days: totalHotspots // All data is within 3 days, so use total
    };

    console.log('Calculated GISTDA stats:', newStats);
    setStats(newStats);
  }, [modisData, viirs3DaysData, viirs1DayData]);

  const isLoading = isLoadingModis || isLoadingViirs3Days;
  const error = modisError || viirs3DaysError;

  const refetch = () => {
    console.log('Refetching GISTDA data...');
  };

  console.log('useGISTDAData returning:', { 
    hotspots: hotspots.length, 
    stats, 
    isLoading, 
    error 
  });

  return {
    hotspots,
    stats,
    isLoading,
    error,
    refetch
  };
};
