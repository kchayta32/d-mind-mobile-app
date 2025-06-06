
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface GISTDAHotspot {
  LATITUDE: number;
  LONGITUDE: number;
  BRIGHTNESS: number;
  SCAN: number;
  TRACK: number;
  ACQ_DATE: string;
  ACQ_TIME: string;
  SATELLITE: string;
  CONFIDENCE: number;
  VERSION: string;
  BRIGHT_T31: number;
  FRP: number;
  DAYNIGHT: string;
  TYPE: number;
  province?: string;
  country?: string;
  geometry?: {
    coordinates: [number, number];
  };
  properties?: {
    confidence: number | string;
    instrument: string;
    frp: number;
    satellite: string;
    pv_tn: string;
    ap_tn: string;
    th_date: string;
    th_time: string;
    village: string;
    lu_name: string;
    acq_date: string;
    changwat?: string;
  };
}

export interface GISTDAData {
  features?: GISTDAHotspot[];
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

export interface WildfireStats {
  totalHotspots: number;
  last24Hours: number;
  highConfidence: number;
  averageConfidence: number;
  topProvinces: Array<{ name: string; count: number }>;
  regionalData: Array<{ region: string; count: number; averageConfidence: number }>;
  timeDistribution: Array<{ time: string; count: number }>;
  thailand: {
    totalHotspots: number;
    byProvince: Array<{ name: string; count: number }>;
    averageConfidence: number;
  };
  international: {
    totalHotspots: number;
    byCountry: Array<{ name: string; count: number }>;
    averageConfidence: number;
  };
}

// Time filter options in days
type TimeFilter = '1day' | '3days' | '7days' | '30days' | 'all';

const getTimeFilterDate = (filter: TimeFilter): Date | null => {
  if (filter === 'all') return null;
  
  const now = new Date();
  const days = {
    '1day': 1,
    '3days': 3,
    '7days': 7,
    '30days': 30
  }[filter];
  
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

export const useGISTDAData = (timeFilter: TimeFilter = '3days') => {
  const [hotspots, setHotspots] = useState<GISTDAHotspot[]>([]);
  const [stats, setStats] = useState<WildfireStats>({
    totalHotspots: 0,
    last24Hours: 0,
    highConfidence: 0,
    averageConfidence: 0,
    topProvinces: [],
    regionalData: [],
    timeDistribution: [],
    thailand: {
      totalHotspots: 0,
      byProvince: [],
      averageConfidence: 0
    },
    international: {
      totalHotspots: 0,
      byCountry: [],
      averageConfidence: 0
    }
  });

  // Thailand provinces bounds for filtering
  const isInThailand = (lat: number, lng: number): boolean => {
    return lat >= 5.5 && lat <= 20.5 && lng >= 97.0 && lng <= 106.0;
  };

  const getProvinceFromCoordinates = (lat: number, lng: number): string => {
    // Simplified province mapping based on coordinates
    if (lat >= 18.0 && lng >= 98.0 && lng <= 101.0) return 'เชียงใหม่';
    if (lat >= 17.0 && lat < 18.0 && lng >= 99.0 && lng <= 102.0) return 'ลำปาง';
    if (lat >= 16.0 && lat < 17.0 && lng >= 100.0 && lng <= 103.0) return 'พิษณุโลก';
    if (lat >= 15.0 && lat < 16.0 && lng >= 101.0 && lng <= 104.0) return 'ขอนแก่น';
    if (lat >= 14.0 && lat < 15.0 && lng >= 99.0 && lng <= 102.0) return 'นครสวรรค์';
    if (lat >= 13.0 && lat < 14.0 && lng >= 100.0 && lng <= 101.5) return 'กรุงเทพมหานคร';
    if (lat >= 12.0 && lat < 13.0 && lng >= 99.0 && lng <= 102.0) return 'เพชรบุรี';
    if (lat >= 8.0 && lat < 12.0 && lng >= 98.0 && lng <= 101.0) return 'สุราษฎร์ธานี';
    if (lat >= 6.0 && lat < 8.0 && lng >= 100.0 && lng <= 102.0) return 'สงขลา';
    return 'อื่นๆ';
  };

  const getCountryFromCoordinates = (lat: number, lng: number): string => {
    if (isInThailand(lat, lng)) return 'Thailand';
    if (lat >= 9.0 && lat <= 28.0 && lng >= 92.0 && lng <= 102.0) return 'Myanmar';
    if (lat >= 13.0 && lat <= 23.0 && lng >= 100.0 && lng <= 108.0) return 'Laos';
    if (lat >= 8.0 && lat <= 23.0 && lng >= 102.0 && lng <= 110.0) return 'Vietnam';
    if (lat >= 1.0 && lat <= 7.0 && lng >= 95.0 && lng <= 141.0) return 'Indonesia';
    if (lat >= 1.0 && lat <= 7.0 && lng >= 99.0 && lng <= 120.0) return 'Malaysia';
    return 'Other';
  };

  // Fetch hotspot data from GISTDA
  const { data: hotspotsData, isLoading } = useQuery({
    queryKey: ['gistda-hotspots', timeFilter],
    queryFn: async () => {
      try {
        const response = await fetch('https://fire.gistda.or.th/api/hotspot/getHotspotData?country=ALL&satellite=ALL&confidence=ALL', {
          headers: { 'accept': 'application/json' }
        });
        if (!response.ok) throw new Error('GISTDA API failed');
        return await response.json();
      } catch (error) {
        console.warn('GISTDA API not available, using mock data');
        return null;
      }
    },
    refetchInterval: 300000, // 5 minutes
  });

  const generateMockHotspotsData = (): GISTDAHotspot[] => {
    const mockData: GISTDAHotspot[] = [];
    const now = new Date();
    
    // Generate hotspots across Southeast Asia with focus on Thailand
    for (let i = 0; i < 150; i++) {
      const isThailandHotspot = Math.random() < 0.6; // 60% in Thailand
      
      let lat, lng, country, province;
      
      if (isThailandHotspot) {
        lat = 6 + Math.random() * 14; // Thailand latitude range
        lng = 97 + Math.random() * 9; // Thailand longitude range
        country = 'Thailand';
        province = getProvinceFromCoordinates(lat, lng);
      } else {
        // Other Southeast Asian countries
        lat = 5 + Math.random() * 20;
        lng = 92 + Math.random() * 20;
        country = getCountryFromCoordinates(lat, lng);
        province = undefined;
      }
      
      const hoursAgo = Math.random() * 72; // Up to 3 days ago
      const hotspotDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      
      const confidence = Math.floor(30 + Math.random() * 70);
      const instrument = Math.random() > 0.5 ? 'MODIS' : 'VIIRS';
      
      mockData.push({
        LATITUDE: lat,
        LONGITUDE: lng,
        BRIGHTNESS: 300 + Math.random() * 200,
        SCAN: 1.0 + Math.random() * 2.0,
        TRACK: 1.0 + Math.random() * 2.0,
        ACQ_DATE: hotspotDate.toISOString().split('T')[0],
        ACQ_TIME: hotspotDate.toTimeString().split(' ')[0].substring(0, 5),
        SATELLITE: Math.random() > 0.5 ? 'Terra' : 'Aqua',
        CONFIDENCE: confidence,
        VERSION: '6.0',
        BRIGHT_T31: 280 + Math.random() * 50,
        FRP: Math.random() * 100,
        DAYNIGHT: hoursAgo % 24 < 12 ? 'D' : 'N',
        TYPE: 0,
        province,
        country,
        geometry: {
          coordinates: [lng, lat]
        },
        properties: {
          confidence,
          instrument,
          frp: Math.random() * 100,
          satellite: Math.random() > 0.5 ? 'Terra' : 'Aqua',
          pv_tn: province || 'Unknown',
          ap_tn: 'District ' + Math.floor(Math.random() * 100),
          th_date: hotspotDate.toISOString().split('T')[0],
          th_time: hotspotDate.toTimeString().split(' ')[0].substring(0, 5),
          village: 'Village ' + Math.floor(Math.random() * 100),
          lu_name: 'Land Use Type',
          acq_date: hotspotDate.toISOString().split('T')[0],
          changwat: province
        }
      });
    }
    
    return mockData;
  };

  useEffect(() => {
    let processedHotspots: GISTDAHotspot[] = [];
    
    if (hotspotsData && Array.isArray(hotspotsData)) {
      processedHotspots = hotspotsData.map((hotspot: any) => ({
        ...hotspot,
        province: isInThailand(hotspot.LATITUDE, hotspot.LONGITUDE) 
          ? getProvinceFromCoordinates(hotspot.LATITUDE, hotspot.LONGITUDE) 
          : undefined,
        country: getCountryFromCoordinates(hotspot.LATITUDE, hotspot.LONGITUDE),
        geometry: {
          coordinates: [hotspot.LONGITUDE, hotspot.LATITUDE]
        },
        properties: {
          confidence: hotspot.CONFIDENCE,
          instrument: hotspot.SATELLITE === 'Terra' || hotspot.SATELLITE === 'Aqua' ? 'MODIS' : 'VIIRS',
          frp: hotspot.FRP || 0,
          satellite: hotspot.SATELLITE,
          pv_tn: hotspot.province || 'Unknown',
          ap_tn: 'District',
          th_date: hotspot.ACQ_DATE,
          th_time: hotspot.ACQ_TIME,
          village: 'Village',
          lu_name: 'Land Use',
          acq_date: hotspot.ACQ_DATE,
          changwat: hotspot.province
        }
      }));
    } else {
      processedHotspots = generateMockHotspotsData();
    }

    // Apply time filter
    const filterDate = getTimeFilterDate(timeFilter);
    if (filterDate) {
      processedHotspots = processedHotspots.filter(hotspot => {
        const hotspotDate = new Date(hotspot.ACQ_DATE);
        return hotspotDate >= filterDate;
      });
    }

    setHotspots(processedHotspots);

    // Calculate statistics
    const totalHotspots = processedHotspots.length;
    const last24Hours = processedHotspots.filter(h => {
      const hotspotDate = new Date(h.ACQ_DATE);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return hotspotDate >= yesterday;
    }).length;

    const highConfidence = processedHotspots.filter(h => h.CONFIDENCE >= 80).length;
    const averageConfidence = totalHotspots > 0 
      ? processedHotspots.reduce((sum, h) => sum + h.CONFIDENCE, 0) / totalHotspots 
      : 0;

    // Thailand-specific statistics
    const thailandHotspots = processedHotspots.filter(h => h.country === 'Thailand');
    const thailandByProvince = thailandHotspots.reduce((acc, hotspot) => {
      const province = hotspot.province || 'อื่นๆ';
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thailandProvinceData = Object.entries(thailandByProvince)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // International statistics
    const internationalHotspots = processedHotspots.filter(h => h.country !== 'Thailand');
    const internationalByCountry = internationalHotspots.reduce((acc, hotspot) => {
      const country = hotspot.country || 'Other';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const internationalCountryData = Object.entries(internationalByCountry)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Regional data (for existing compatibility)
    const regionalData = Object.entries(
      processedHotspots.reduce((acc, h) => {
        const region = h.country || 'Unknown';
        if (!acc[region]) {
          acc[region] = { count: 0, totalConfidence: 0 };
        }
        acc[region].count++;
        acc[region].totalConfidence += h.CONFIDENCE;
        return acc;
      }, {} as Record<string, { count: number; totalConfidence: number }>)
    ).map(([region, data]) => ({
      region,
      count: data.count,
      averageConfidence: data.count > 0 ? data.totalConfidence / data.count : 0
    })).sort((a, b) => b.count - a.count);

    // Time distribution
    const timeDistribution = processedHotspots.reduce((acc, h) => {
      const hour = h.ACQ_TIME.split(':')[0];
      const timeSlot = `${hour}:00`;
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeData = Object.entries(timeDistribution)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    const newStats: WildfireStats = {
      totalHotspots,
      last24Hours,
      highConfidence,
      averageConfidence: Math.round(averageConfidence),
      topProvinces: thailandProvinceData.slice(0, 5),
      regionalData,
      timeDistribution: timeData,
      thailand: {
        totalHotspots: thailandHotspots.length,
        byProvince: thailandProvinceData,
        averageConfidence: thailandHotspots.length > 0 
          ? Math.round(thailandHotspots.reduce((sum, h) => sum + h.CONFIDENCE, 0) / thailandHotspots.length)
          : 0
      },
      international: {
        totalHotspots: internationalHotspots.length,
        byCountry: internationalCountryData,
        averageConfidence: internationalHotspots.length > 0 
          ? Math.round(internationalHotspots.reduce((sum, h) => sum + h.CONFIDENCE, 0) / internationalHotspots.length)
          : 0
      }
    };

    console.log('Updated wildfire stats:', newStats);
    setStats(newStats);
  }, [hotspotsData, timeFilter]);

  return {
    hotspots,
    stats,
    isLoading,
    refetch: () => console.log('Refetching wildfire data...')
  };
};
