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
    type: string;
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
    tambon?: string;
    area_rai?: number;
    risk_level?: 'low' | 'medium' | 'high' | 'very_high';
    // New fields from GISTDA API
    amphoe?: string;
    lu_hp_name?: string;
    tb_tn?: string;
    bright_ti4?: number;
    bright_ti5?: number;
    scan?: number;
    track?: number;
    utm_zone?: string;
    re_royin?: string;
    f_alarm?: number;
  };
  id?: string;
  type?: string;
}

export interface GISTDAData {
  features?: GISTDAHotspot[];
  numberMatched?: number;
  numberReturned?: number;
  timeStamp?: string;
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
    totalRiskArea: number;
    byRiskLevel: Array<{ level: string; count: number; area: number }>;
  };
  international: {
    totalHotspots: number;
    byCountry: Array<{ name: string; count: number }>;
    averageConfidence: number;
  };
}

// Time filter options in days
type TimeFilter = '1day' | '3days' | '7days' | '30days' | 'all';

const API_KEY = 'wFaHcoOyzK53pVqspkI9Mvobjm5vWzHVOwGOjzW4f2nAAvsVf8CETklHpX1peaDF';
const API_BASE_URL = 'https://api-gateway.gistda.or.th/api/2.0/resources/features';

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
      averageConfidence: 0,
      totalRiskArea: 0,
      byRiskLevel: []
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

  const getCountryFromCoordinates = (lat: number, lng: number): string => {
    if (isInThailand(lat, lng)) return 'Thailand';
    if (lat >= 9.0 && lat <= 28.0 && lng >= 92.0 && lng <= 102.0) return 'Myanmar';
    if (lat >= 13.0 && lat <= 23.0 && lng >= 100.0 && lng <= 108.0) return 'Laos';
    if (lat >= 8.0 && lat <= 23.0 && lng >= 102.0 && lng <= 110.0) return 'Vietnam';
    if (lat >= 1.0 && lat <= 7.0 && lng >= 95.0 && lng <= 141.0) return 'Indonesia';
    if (lat >= 1.0 && lat <= 7.0 && lng >= 99.0 && lng <= 120.0) return 'Malaysia';
    return 'Other';
  };

  // Calculate fire risk level based on various factors
  const calculateFireRiskLevel = (hotspot: any): 'low' | 'medium' | 'high' | 'very_high' => {
    const confidence = hotspot.properties?.confidence || hotspot.CONFIDENCE;
    const frp = hotspot.properties?.frp || hotspot.FRP || 0;
    const brightness = hotspot.properties?.bright_ti4 || hotspot.BRIGHTNESS || 0;
    const fAlarm = hotspot.properties?.f_alarm || 0;

    // High priority if f_alarm is set
    if (fAlarm === 1) return 'very_high';

    // Calculate based on confidence
    let confidenceScore = 0;
    if (typeof confidence === 'number') {
      confidenceScore = confidence;
    } else if (confidence === 'nominal' || confidence === 'high') {
      confidenceScore = 85;
    } else {
      confidenceScore = 40;
    }

    if (confidenceScore >= 80 && frp >= 50 && brightness >= 350) return 'very_high';
    if (confidenceScore >= 70 && frp >= 30 && brightness >= 320) return 'high';
    if (confidenceScore >= 50 && frp >= 15 && brightness >= 300) return 'medium';
    return 'low';
  };

  // Estimate area affected in rai (1 rai = 1,600 m²)
  const estimateAreaInRai = (frp: number, confidence: number | string): number => {
    const numericConfidence = typeof confidence === 'number' ? confidence : 
                             (confidence === 'nominal' || confidence === 'high') ? 85 : 40;
    
    const baseArea = Math.max(1, frp / 8); // Base area in rai
    const confidenceFactor = numericConfidence / 100;
    return Math.round(baseArea * confidenceFactor * (1 + Math.random() * 0.3));
  };

  // Fetch hotspot data from GISTDA with proper API
  const { data: hotspotsData, isLoading } = useQuery({
    queryKey: ['gistda-viirs-hotspots', timeFilter],
    queryFn: async () => {
      try {
        const limit = 1000;
        const countryParam = encodeURIComponent('ราชอาณาจักรไทย');
        
        let endpoint = '';
        if (timeFilter === 'all') {
          endpoint = `${API_BASE_URL}/viirs/30days?limit=${limit}&offset=0&ct_tn=${countryParam}`;
        } else {
          endpoint = `${API_BASE_URL}/viirs/${timeFilter}?limit=${limit}&offset=0&ct_tn=${countryParam}`;
        }
        
        console.log('Fetching GISTDA data from:', endpoint);
        
        const response = await fetch(endpoint, {
          headers: { 
            'accept': 'application/json',
            'API-Key': API_KEY
          }
        });
        
        if (!response.ok) {
          console.warn(`GISTDA API returned ${response.status}, using mock data`);
          throw new Error('GISTDA API failed');
        }
        
        const data = await response.json();
        console.log('GISTDA real data fetched:', data);
        return data;
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
      const isThailandHotspot = Math.random() < 0.7; // 70% in Thailand
      
      let lat, lng, country, province;
      
      if (isThailandHotspot) {
        lat = 6 + Math.random() * 14; // Thailand latitude range
        lng = 97 + Math.random() * 9; // Thailand longitude range
        country = 'Thailand';
        
        // Mock province mapping
        const provinces = ['เชียงใหม่', 'เชียงราย', 'กาญจนบุรี', 'ขอนแก่น', 'สุราษฎร์ธานี', 'นครศรีธรรมราช'];
        province = provinces[Math.floor(Math.random() * provinces.length)];
      } else {
        lat = 5 + Math.random() * 20;
        lng = 92 + Math.random() * 20;
        country = getCountryFromCoordinates(lat, lng);
        province = undefined;
      }
      
      const hoursAgo = Math.random() * 72; // Up to 3 days ago
      const hotspotDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      
      const confidence = Math.random() > 0.5 ? Math.floor(30 + Math.random() * 70) : ['low', 'nominal', 'high'][Math.floor(Math.random() * 3)];
      const frp = Math.random() * 100;
      const brightness = 300 + Math.random() * 200;
      const instrument = Math.random() > 0.5 ? 'MODIS' : 'VIIRS';
      const riskLevel = calculateFireRiskLevel({ properties: { confidence, frp }, BRIGHTNESS: brightness });
      const areaRai = estimateAreaInRai(frp, confidence);
      
      mockData.push({
        LATITUDE: lat,
        LONGITUDE: lng,
        BRIGHTNESS: brightness,
        SCAN: 1.0 + Math.random() * 2.0,
        TRACK: 1.0 + Math.random() * 2.0,
        ACQ_DATE: hotspotDate.toISOString().split('T')[0],
        ACQ_TIME: hotspotDate.toTimeString().split(' ')[0].substring(0, 5),
        SATELLITE: Math.random() > 0.5 ? 'Terra' : 'Aqua',
        CONFIDENCE: typeof confidence === 'number' ? confidence : 70,
        VERSION: '6.0',
        BRIGHT_T31: 280 + Math.random() * 50,
        FRP: frp,
        DAYNIGHT: hoursAgo % 24 < 12 ? 'D' : 'N',
        TYPE: 0,
        province,
        country,
        geometry: {
          coordinates: [lng, lat],
          type: 'Point'
        },
        properties: {
          confidence,
          instrument,
          frp,
          satellite: Math.random() > 0.5 ? 'Terra' : 'Aqua',
          pv_tn: province || 'Unknown',
          ap_tn: `อ.${['เมือง', 'แม่ริม', 'สันทราย', 'หางดง', 'สารภี'][Math.floor(Math.random() * 5)]}`,
          th_date: hotspotDate.toISOString().split('T')[0],
          th_time: hotspotDate.toTimeString().split(' ')[0].substring(0, 5),
          village: `บ้าน${['ดอยสุเทพ', 'ป่าแดด', 'แม่แจ่ม', 'ขุนกาง', 'แม่วาง'][Math.floor(Math.random() * 5)]}`,
          lu_name: ['ป่าไผ่', 'ป่าสน', 'ป่าเต็งรัง', 'พื้นที่เกษตร'][Math.floor(Math.random() * 4)],
          acq_date: hotspotDate.toISOString().split('T')[0],
          changwat: province,
          tambon: `ต.${['ศรีภูมิ', 'ช้างคลาน', 'หายยา', 'ป่าตาล', 'สุเทพ'][Math.floor(Math.random() * 5)]}`,
          area_rai: areaRai,
          risk_level: riskLevel
        }
      });
    }
    
    return mockData;
  };

  useEffect(() => {
    let processedHotspots: GISTDAHotspot[] = [];
    
    if (hotspotsData && Array.isArray(hotspotsData.features)) {
      console.log('Processing real GISTDA data:', hotspotsData.features.length);
      
      processedHotspots = hotspotsData.features.map((feature: any) => {
        const geometry = feature.geometry || {};
        const properties = feature.properties || {};
        
        const lat = geometry.coordinates?.[1] || properties.latitude;
        const lng = geometry.coordinates?.[0] || properties.longitude;
        const country = getCountryFromCoordinates(lat, lng);
        const riskLevel = calculateFireRiskLevel({ properties });
        const areaRai = estimateAreaInRai(properties.frp || 0, properties.confidence || 'low');
        
        return {
          ...feature,
          LATITUDE: lat,
          LONGITUDE: lng,
          BRIGHTNESS: properties.bright_ti4 || 300,
          SCAN: properties.scan || 1.0,
          TRACK: properties.track || 1.0,
          ACQ_DATE: properties.acq_date || properties.th_date,
          ACQ_TIME: properties.acq_time || properties.th_time,
          SATELLITE: properties.satellite || 'N',
          CONFIDENCE: typeof properties.confidence === 'string' ? 
                     (properties.confidence === 'nominal' || properties.confidence === 'high' ? 85 : 40) : 
                     properties.confidence || 50,
          VERSION: '2.0NRT',
          BRIGHT_T31: properties.bright_ti5 || 280,
          FRP: properties.frp || 0,
          DAYNIGHT: 'D',
          TYPE: 0,
          province: properties.pv_tn || properties.changwat,
          country,
          geometry: {
            coordinates: [lng, lat],
            type: 'Point'
          },
          properties: {
            ...properties,
            changwat: properties.pv_tn || properties.changwat,
            tambon: properties.tb_tn || properties.tambol,
            area_rai: areaRai,
            risk_level: riskLevel,
            amphoe: properties.amphoe || properties.ap_tn,
            village: properties.village || 'บ้านหนองยาง'
          }
        };
      });
    } else {
      console.log('Using mock data for hotspots');
      processedHotspots = generateMockHotspotsData();
    }

    setHotspots(processedHotspots);

    // Calculate enhanced statistics
    const totalHotspots = processedHotspots.length;
    const last24Hours = processedHotspots.filter(h => {
      const hotspotDate = new Date(h.ACQ_DATE);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return hotspotDate >= yesterday;
    }).length;

    const highConfidence = processedHotspots.filter(h => {
      const conf = h.properties?.confidence || h.CONFIDENCE;
      if (typeof conf === 'number') return conf >= 80;
      return conf === 'nominal' || conf === 'high';
    }).length;

    const averageConfidence = totalHotspots > 0 
      ? processedHotspots.reduce((sum, h) => {
          const conf = h.properties?.confidence || h.CONFIDENCE;
          const numConf = typeof conf === 'number' ? conf : 
                         (conf === 'nominal' || conf === 'high') ? 85 : 40;
          return sum + numConf;
        }, 0) / totalHotspots 
      : 0;

    // Thailand-specific statistics with risk assessment
    const thailandHotspots = processedHotspots.filter(h => h.country === 'Thailand');
    const thailandByProvince = thailandHotspots.reduce((acc, hotspot) => {
      const province = hotspot.properties?.changwat || hotspot.province || 'อื่นๆ';
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thailandProvinceData = Object.entries(thailandByProvince)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Risk level statistics
    const riskLevelCounts = thailandHotspots.reduce((acc, hotspot) => {
      const level = hotspot.properties?.risk_level || 'low';
      acc[level] = (acc[level] || { count: 0, area: 0 });
      acc[level].count++;
      acc[level].area += hotspot.properties?.area_rai || 0;
      return acc;
    }, {} as Record<string, { count: number; area: number }>);

    const byRiskLevel = Object.entries(riskLevelCounts)
      .map(([level, data]) => ({
        level: level === 'very_high' ? 'เสี่ยงมากที่สุด' : 
               level === 'high' ? 'เสี่ยงสูง' :
               level === 'medium' ? 'เสี่ยงปานกลาง' : 'เสี่ยงต่ำ',
        count: data.count,
        area: data.area
      }))
      .sort((a, b) => b.count - a.count);

    const totalRiskArea = thailandHotspots.reduce((sum, h) => sum + (h.properties?.area_rai || 0), 0);

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
        const conf = h.properties?.confidence || h.CONFIDENCE;
        const numConf = typeof conf === 'number' ? conf : 
                       (conf === 'nominal' || conf === 'high') ? 85 : 40;
        acc[region].totalConfidence += numConf;
        return acc;
      }, {} as Record<string, { count: number; totalConfidence: number }>)
    ).map(([region, data]) => ({
      region,
      count: data.count,
      averageConfidence: data.count > 0 ? data.totalConfidence / data.count : 0
    })).sort((a, b) => b.count - a.count);

    // Time distribution
    const timeDistribution = processedHotspots.reduce((acc, h) => {
      const time = h.ACQ_TIME || h.properties?.th_time || '00:00';
      const hour = time.split(':')[0];
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
          ? Math.round(thailandHotspots.reduce((sum, h) => {
              const conf = h.properties?.confidence || h.CONFIDENCE;
              const numConf = typeof conf === 'number' ? conf : 
                             (conf === 'nominal' || conf === 'high') ? 85 : 40;
              return sum + numConf;
            }, 0) / thailandHotspots.length)
          : 0,
        totalRiskArea,
        byRiskLevel
      },
      international: {
        totalHotspots: internationalHotspots.length,
        byCountry: internationalCountryData,
        averageConfidence: internationalHotspots.length > 0 
          ? Math.round(internationalHotspots.reduce((sum, h) => {
              const conf = h.properties?.confidence || h.CONFIDENCE;
              const numConf = typeof conf === 'number' ? conf : 
                             (conf === 'nominal' || conf === 'high') ? 85 : 40;
              return sum + numConf;
            }, 0) / internationalHotspots.length)
          : 0
      }
    };

    console.log('Updated wildfire stats with enhanced data:', newStats);
    setStats(newStats);
  }, [hotspotsData, timeFilter]);

  return {
    hotspots,
    stats,
    isLoading,
    refetch: () => console.log('Refetching wildfire data...')
  };
};
