import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gistdaService, GISTDA_CACHE_CONFIG } from '@/services/gistda/gistdaService';
import type {
  GISTDAHotspot,
  GISTDAData,
  GISTDAStats,
  WildfireStats,
  VIIRSTimeframe
} from '@/services/gistda/types';

// Re-export types for backward compatibility across the codebase
export type { GISTDAHotspot, GISTDAData, GISTDAStats, WildfireStats };

// Time filter options in days
export type TimeFilter = '1day' | '3days' | '7days' | '30days' | 'all';

// Thailand bounds for coordinates verification
export const isInThailand = (lat: number, lng: number): boolean => {
  return lat >= 5.5 && lat <= 20.5 && lng >= 97.0 && lng <= 106.0;
};

export const getCountryFromCoordinates = (lat: number, lng: number): string => {
  if (isInThailand(lat, lng)) return 'Thailand';
  if (lat >= 9.0 && lat <= 28.0 && lng >= 92.0 && lng <= 102.0) return 'Myanmar';
  if (lat >= 13.0 && lat <= 23.0 && lng >= 100.0 && lng <= 108.0) return 'Laos';
  if (lat >= 8.0 && lat <= 23.0 && lng >= 102.0 && lng <= 110.0) return 'Vietnam';
  if (lat >= 1.0 && lat <= 7.0 && lng >= 95.0 && lng <= 141.0) return 'Indonesia';
  if (lat >= 1.0 && lat <= 7.0 && lng >= 99.0 && lng <= 120.0) return 'Malaysia';
  return 'Other';
};

// Calculate fire risk level based on various factors
export const calculateFireRiskLevel = (hotspot: any): 'low' | 'medium' | 'high' | 'very_high' => {
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
  } else if (confidence === 'high') {
    confidenceScore = 95;
  } else if (confidence === 'nominal') {
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
export const estimateAreaInRai = (frp: number, confidence: number | string): number => {
  const numericConfidence = typeof confidence === 'number'
    ? confidence
    : confidence === 'high'
      ? 95
      : confidence === 'nominal'
        ? 85
        : 40;

  const baseArea = Math.max(1, frp / 8); // Base area in rai
  const confidenceFactor = numericConfidence / 100;
  return Math.round(baseArea * confidenceFactor);
};

/**
 * Transforms raw GISTDA VIIRS feature into the standardized GISTDAHotspot model.
 */
const transformFeatureToHotspot = (feature: any): GISTDAHotspot => {
  const geometry = feature.geometry || {};
  const properties = feature.properties || {};

  const lat = geometry.coordinates?.[1] ?? properties.latitude ?? 0;
  const lng = geometry.coordinates?.[0] ?? properties.longitude ?? 0;

  const isThai = properties.ct_tn === 'ราชอาณาจักรไทย' ||
    properties.ct_en === 'Thailand' ||
    isInThailand(lat, lng);

  const country = isThai ? 'Thailand' : (properties.ct_en || properties.ct_tn || getCountryFromCoordinates(lat, lng));
  const province = properties.pv_tn || properties.changwat || (isThai ? 'ไม่ระบุ' : country);

  let numericConfidence = 50;
  if (typeof properties.confidence === 'number') {
    numericConfidence = properties.confidence;
  } else if (properties.confidence === 'high') {
    numericConfidence = 95;
  } else if (properties.confidence === 'nominal') {
    numericConfidence = 85;
  } else if (properties.confidence === 'low') {
    numericConfidence = 40;
  }

  const frp = properties.frp ?? 0;
  const brightness = properties.bright_ti4 ?? 300;
  const riskLevel = calculateFireRiskLevel({ properties, BRIGHTNESS: brightness });
  const areaRai = estimateAreaInRai(frp, numericConfidence);

  const rawDate = properties.acq_date || properties.th_date || new Date().toISOString();
  const dateFormatted = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  const timeFormatted = properties.th_time || properties.acq_time || '00:00';

  return {
    ...feature,
    LATITUDE: lat,
    LONGITUDE: lng,
    BRIGHTNESS: brightness,
    SCAN: properties.scan || 1.0,
    TRACK: properties.track || 1.0,
    ACQ_DATE: dateFormatted,
    ACQ_TIME: timeFormatted,
    SATELLITE: properties.satellite || 'VIIRS',
    CONFIDENCE: numericConfidence,
    VERSION: properties.version || '2.0NRT',
    BRIGHT_T31: properties.bright_ti5 || 280,
    FRP: frp,
    DAYNIGHT: properties.th_time
      ? (parseInt(properties.th_time.substring(0, 2), 10) >= 6 && parseInt(properties.th_time.substring(0, 2), 10) < 18 ? 'D' : 'N')
      : 'D',
    TYPE: 0,
    province,
    country,
    geometry: {
      coordinates: [lng, lat],
      type: 'Point'
    },
    properties: {
      ...properties,
      confidence: properties.confidence ?? numericConfidence,
      instrument: properties.instrument || 'VIIRS',
      frp,
      satellite: properties.satellite || 'VIIRS',
      pv_tn: province,
      ap_tn: properties.ap_tn || properties.amphoe || '',
      th_date: dateFormatted,
      th_time: timeFormatted,
      village: properties.village || '',
      lu_name: properties.lu_name || '',
      acq_date: dateFormatted,
      changwat: province,
      tambon: properties.tb_tn || properties.tambol || '',
      area_rai: areaRai,
      risk_level: riskLevel,
      amphoe: properties.ap_tn || properties.amphoe || '',
      bright_ti4: brightness,
      bright_ti5: properties.bright_ti5 || 280,
      f_alarm: properties.f_alarm || 0
    }
  };
};

/**
 * React Query Hook to retrieve real VIIRS wildfire hotspots and compute analytical statistics.
 * Caching: staleTime: 10 mins, gcTime: 30 mins
 * Strictly real data from GISTDA API Gateway (No Mocking).
 */
export const useGISTDAData = (timeFilter: TimeFilter = '3days') => {
  const actualTimeframe: VIIRSTimeframe = timeFilter === 'all' ? '30days' : timeFilter;

  const { data: hotspotsData, isLoading, refetch } = useQuery({
    queryKey: ['gistda-viirs-hotspots-real', actualTimeframe],
    queryFn: async (): Promise<GISTDAHotspot[]> => {
      // Concurrently fetch Thailand-specific hotspots and regional hotspots
      const [thaiResult, regionalResult] = await Promise.allSettled([
        gistdaService.getVIIRSFeatures(actualTimeframe, {
          limit: 1000,
          offset: 0,
          ct_tn: 'ราชอาณาจักรไทย'
        }),
        gistdaService.getVIIRSFeatures(actualTimeframe, {
          limit: 200,
          offset: 0
        })
      ]);

      const seenIds = new Set<string>();
      const combined: GISTDAHotspot[] = [];

      // 1. Process Thailand hotspots
      if (thaiResult.status === 'fulfilled' && thaiResult.value?.features) {
        for (const feature of thaiResult.value.features) {
          const transformed = transformFeatureToHotspot(feature);
          const key = feature.id || `${transformed.LATITUDE},${transformed.LONGITUDE},${transformed.ACQ_DATE}`;
          if (!seenIds.has(key)) {
            seenIds.add(key);
            combined.push(transformed);
          }
        }
      } else if (thaiResult.status === 'rejected') {
        console.warn('GISTDA Thailand VIIRS query failed:', thaiResult.reason);
      }

      // 2. Process Regional / International hotspots
      if (regionalResult.status === 'fulfilled' && regionalResult.value?.features) {
        for (const feature of regionalResult.value.features) {
          const transformed = transformFeatureToHotspot(feature);
          const key = feature.id || `${transformed.LATITUDE},${transformed.LONGITUDE},${transformed.ACQ_DATE}`;
          if (!seenIds.has(key)) {
            seenIds.add(key);
            combined.push(transformed);
          }
        }
      } else if (regionalResult.status === 'rejected') {
        console.warn('GISTDA Regional VIIRS query failed:', regionalResult.reason);
      }

      return combined;
    },
    staleTime: GISTDA_CACHE_CONFIG.staleTime, // 10 minutes
    gcTime: GISTDA_CACHE_CONFIG.gcTime,       // 30 minutes
    refetchInterval: GISTDA_CACHE_CONFIG.staleTime,
    refetchOnWindowFocus: false,
    retry: 2
  });

  const hotspots = useMemo(() => hotspotsData || [], [hotspotsData]);

  // Compute Wildfire Analytics Statistics
  const stats: WildfireStats = useMemo(() => {
    const totalHotspots = hotspots.length;

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24Hours = hotspots.filter(h => {
      const hotspotDate = new Date(h.ACQ_DATE);
      return !isNaN(hotspotDate.getTime()) && hotspotDate >= yesterday;
    }).length;

    const highConfidence = hotspots.filter(h => {
      const conf = h.properties?.confidence || h.CONFIDENCE;
      if (typeof conf === 'number') return conf >= 80;
      return conf === 'nominal' || conf === 'high';
    }).length;

    const averageConfidence = totalHotspots > 0
      ? Math.round(hotspots.reduce((sum, h) => sum + (h.CONFIDENCE || 50), 0) / totalHotspots)
      : 0;

    // Thailand-specific statistics
    const thailandHotspots = hotspots.filter(h => h.country === 'Thailand');
    const thailandByProvince = thailandHotspots.reduce((acc, hotspot) => {
      const province = hotspot.properties?.changwat || hotspot.province || 'อื่นๆ';
      acc[province] = (acc[province] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const thailandProvinceData = Object.entries(thailandByProvince)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const riskLevelCounts = thailandHotspots.reduce((acc, hotspot) => {
      const level = hotspot.properties?.risk_level || 'low';
      acc[level] = acc[level] || { count: 0, area: 0 };
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
    const internationalHotspots = hotspots.filter(h => h.country !== 'Thailand');
    const internationalByCountry = internationalHotspots.reduce((acc, hotspot) => {
      const country = hotspot.country || 'Other';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const internationalCountryData = Object.entries(internationalByCountry)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Regional data for compatibility
    const regionalData = Object.entries(
      hotspots.reduce((acc, h) => {
        const region = h.country || 'Unknown';
        if (!acc[region]) {
          acc[region] = { count: 0, totalConfidence: 0 };
        }
        acc[region].count++;
        acc[region].totalConfidence += h.CONFIDENCE || 50;
        return acc;
      }, {} as Record<string, { count: number; totalConfidence: number }>)
    ).map(([region, data]) => ({
      region,
      count: data.count,
      averageConfidence: data.count > 0 ? Math.round(data.totalConfidence / data.count) : 0
    })).sort((a, b) => b.count - a.count);

    // Time distribution (hourly)
    const timeDistribution = hotspots.reduce((acc, h) => {
      const time = h.ACQ_TIME || h.properties?.th_time || '00:00';
      const hour = time.includes(':') ? time.split(':')[0] : time.substring(0, 2);
      const timeSlot = `${hour.padStart(2, '0')}:00`;
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeData = Object.entries(timeDistribution)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    return {
      totalHotspots,
      last24Hours,
      highConfidence,
      averageConfidence,
      topProvinces: thailandProvinceData.slice(0, 5),
      regionalData,
      timeDistribution: timeData,
      thailand: {
        totalHotspots: thailandHotspots.length,
        byProvince: thailandProvinceData,
        averageConfidence: thailandHotspots.length > 0
          ? Math.round(thailandHotspots.reduce((sum, h) => sum + (h.CONFIDENCE || 50), 0) / thailandHotspots.length)
          : 0,
        totalRiskArea,
        byRiskLevel
      },
      international: {
        totalHotspots: internationalHotspots.length,
        byCountry: internationalCountryData,
        averageConfidence: internationalHotspots.length > 0
          ? Math.round(internationalHotspots.reduce((sum, h) => sum + (h.CONFIDENCE || 50), 0) / internationalHotspots.length)
          : 0
      }
    };
  }, [hotspots]);

  return {
    hotspots,
    stats,
    isLoading,
    refetch
  };
};
