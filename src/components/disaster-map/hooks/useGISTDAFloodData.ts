import { useQuery } from '@tanstack/react-query';
import { gistdaService, GISTDA_CACHE_CONFIG } from '@/services/gistda/gistdaService';
import type {
  FloodFeature,
  FloodResponse,
  RecurrentFloodFeature,
  RecurrentFloodResponse,
  WaterHyacinthFeature,
  WaterHyacinthResponse,
  FloodTimeframe
} from '@/services/gistda/types';

// Re-export types for backward compatibility across the app
export type {
  FloodFeature,
  FloodResponse,
  RecurrentFloodFeature,
  RecurrentFloodResponse,
  WaterHyacinthFeature,
  WaterHyacinthResponse,
  FloodTimeframe
};

/**
 * Hook to fetch real-time flood polygon features from GISTDA.
 * Supports all official timeframes: '1day' | '3days' | '7days' | '30days'
 * Caching: staleTime: 10 mins, gcTime: 30 mins
 */
export const useGISTDAFloodData = (
  timeframe: FloodTimeframe = '3days',
  limit: number = 1000
) => {
  return useQuery<FloodResponse, Error>({
    queryKey: ['gistda-flood-data', timeframe, limit],
    queryFn: () => gistdaService.getFloodFeatures(timeframe, { limit, offset: 0 }),
    staleTime: GISTDA_CACHE_CONFIG.staleTime, // 10 minutes
    gcTime: GISTDA_CACHE_CONFIG.gcTime,       // 30 minutes
    refetchInterval: GISTDA_CACHE_CONFIG.staleTime,
    refetchOnWindowFocus: false,
    retry: 2
  });
};

/**
 * Hook to fetch recurrent flood (น้ำท่วมซ้ำซาก) features from GISTDA.
 * Caching: staleTime: 10 mins, gcTime: 30 mins
 */
export const useRecurrentFloodData = (limit: number = 1000) => {
  return useQuery<RecurrentFloodResponse, Error>({
    queryKey: ['gistda-recurrent-flood', limit],
    queryFn: () => gistdaService.getFloodFrequency({ limit, offset: 0 }),
    staleTime: GISTDA_CACHE_CONFIG.staleTime, // 10 minutes
    gcTime: GISTDA_CACHE_CONFIG.gcTime,       // 30 minutes
    refetchInterval: GISTDA_CACHE_CONFIG.staleTime,
    refetchOnWindowFocus: false,
    retry: 2
  });
};

/**
 * Hook to fetch water hyacinth / waterway obstruction (ผักตบชวา) features from GISTDA.
 * Caching: staleTime: 10 mins, gcTime: 30 mins
 */
export const useWaterHyacinthData = (limit: number = 1000) => {
  return useQuery<WaterHyacinthResponse, Error>({
    queryKey: ['gistda-water-hyacinth', limit],
    queryFn: () => gistdaService.getWaterHyacinth({ limit, offset: 0 }),
    staleTime: GISTDA_CACHE_CONFIG.staleTime, // 10 minutes
    gcTime: GISTDA_CACHE_CONFIG.gcTime,       // 30 minutes
    refetchInterval: GISTDA_CACHE_CONFIG.staleTime,
    refetchOnWindowFocus: false,
    retry: 2
  });
};

/**
 * Calculate center point of a polygon or multipolygon feature for marker / popup placement.
 * Safely extracts coordinates across both Polygon and MultiPolygon geometry structures.
 */
export const getFloodCenter = (feature: FloodFeature): [number, number] => {
  if (!feature?.geometry?.coordinates) {
    return [13.7563, 100.5018]; // Default Thailand Center
  }

  const coords: number[][] = [];
  const extractCoords = (item: any) => {
    if (Array.isArray(item)) {
      if (item.length >= 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
        coords.push(item as number[]);
      } else {
        for (const child of item) {
          extractCoords(child);
        }
      }
    }
  };

  extractCoords(feature.geometry.coordinates);

  if (coords.length === 0) {
    return [13.7563, 100.5018];
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lng, lat] of coords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  return [centerLat, centerLng];
};
