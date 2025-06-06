import { useState, useEffect } from 'react';
import { useViirs1DayData, useViirs3DaysData } from './hooks/useViirsData';
import { useModisData } from './hooks/useModisData';
import { calculateGISTDAStats } from './utils/gistdaStats';

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

  // Use the refactored hooks
  const { data: viirs1DayData } = useViirs1DayData();
  const { data: viirs3DaysData, isLoading: isLoadingViirs3Days, error: viirs3DaysError } = useViirs3DaysData();
  const { data: modisData, isLoading: isLoadingModis, error: modisError } = useModisData();

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

    // Calculate statistics using the utility function
    const newStats = calculateGISTDAStats(combinedHotspots, modisData, viirs3DaysData, viirs1DayData);
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
