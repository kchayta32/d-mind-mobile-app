import axios, { AxiosInstance } from 'axios';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import {
  FloodTimeframe,
  FloodResponse,
  RecurrentFloodResponse,
  WaterHyacinthResponse,
  VIIRSTimeframe,
  VIIRSResponse,
  BurnFreqResponse,
  BurnScarResponse,
  FloodWMSLayer,
  FloodWMTSLayer,
  WildfireWMSLayer,
  WildfireWMTSLayer,
  WildfireTMSLayer,
  DroughtWMSLayer,
  DroughtWMTSLayer,
  DroughtTMSLayer,
  WMSParams,
  MapLibreRasterSource,
  LeafletTileLayerOptions,
  PaginationParams,
  VIIRSQueryParams
} from './types';

// ==========================================
// Constants & Configuration
// ==========================================

export const GISTDA_BASE_URL = 'https://api-gateway.gistda.or.th/api/2.0/resources';

/**
 * Standard Cache Times as per architecture specification:
 * - staleTime: 10 minutes (600,000 ms)
 * - gcTime: 30 minutes (1,800,000 ms)
 */
export const GISTDA_CACHE_CONFIG = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000,    // 30 minutes
  refetchOnWindowFocus: false,
  retry: 2,
} as const;

/**
 * Resolves the GISTDA API key from environment variables.
 */
export const getGistdaApiKey = (): string => {
  return (
    import.meta.env.VITE_GISTDA_API_KEY ||
    import.meta.env.VITE_GISTDA_DISASTER_API_KEY ||
    import.meta.env.VITE_GISTDA_FIRE_API_KEY ||
    import.meta.env.VITE_GISTDA_WMS_API_KEY ||
    ''
  );
};

/**
 * Creates an Axios instance preconfigured with GISTDA authentication headers.
 */
export const createGistdaClient = (apiKeyOverride?: string): AxiosInstance => {
  const apiKey = apiKeyOverride || getGistdaApiKey();
  return axios.create({
    baseURL: GISTDA_BASE_URL,
    headers: {
      'API-Key': apiKey,
      'accept': 'application/json'
    },
    timeout: 30000 // 30s timeout
  });
};

const defaultClient = createGistdaClient();

// ==========================================
// 1. Feature API Services
// ==========================================

export const gistdaService = {
  // ----------------------------------------
  // 1.1 Flood (น้ำท่วม)
  // ----------------------------------------

  /**
   * GET /features/flood/{timeframe}
   * Fetches real-time flood polygons for 1day, 3days, 7days, or 30days.
   */
  async getFloodFeatures(
    timeframe: FloodTimeframe = '3days',
    params: PaginationParams = { limit: 1000, offset: 0 },
    client: AxiosInstance = defaultClient
  ): Promise<FloodResponse> {
    const response = await client.get<FloodResponse>(`/features/flood/${timeframe}`, {
      params
    });
    return response.data;
  },

  /**
   * GET /features/flood-freq
   * Fetches historical recurrent flood polygons across Thailand.
   */
  async getFloodFrequency(
    params: PaginationParams = { limit: 1000, offset: 0 },
    client: AxiosInstance = defaultClient
  ): Promise<RecurrentFloodResponse> {
    const response = await client.get<RecurrentFloodResponse>('/features/flood-freq', {
      params
    });
    return response.data;
  },

  /**
   * GET /features/water_hyacinth
   * Fetches water hyacinth and aquatic waterway obstacles.
   */
  async getWaterHyacinth(
    params: PaginationParams = { limit: 1000, offset: 0 },
    client: AxiosInstance = defaultClient
  ): Promise<WaterHyacinthResponse> {
    const response = await client.get<WaterHyacinthResponse>('/features/water_hyacinth', {
      params
    });
    return response.data;
  },

  // ----------------------------------------
  // 1.2 Wildfire (ไฟป่า / VIIRS)
  // ----------------------------------------

  /**
   * GET /features/viirs/{timeframe}
   * Fetches VIIRS satellite thermal hotspots for 1day, 3days, 7days, or 30days.
   */
  async getVIIRSFeatures(
    timeframe: VIIRSTimeframe = '3days',
    params: VIIRSQueryParams = { limit: 1000, offset: 0 },
    client: AxiosInstance = defaultClient
  ): Promise<VIIRSResponse> {
    const response = await client.get<VIIRSResponse>(`/features/viirs/${timeframe}`, {
      params
    });
    return response.data;
  },

  /**
   * GET /features/burn-freq
   * Fetches recurrent burn area statistics and polygons.
   */
  async getBurnFrequency(
    params: PaginationParams = { limit: 1000, offset: 0 },
    client: AxiosInstance = defaultClient
  ): Promise<BurnFreqResponse> {
    const response = await client.get<BurnFreqResponse>('/features/burn-freq', {
      params
    });
    return response.data;
  },

  /**
   * GET /features/burn-scar
   * Fetches weekly burn scar footprints from satellite imagery.
   */
  async getBurnScar(
    params: PaginationParams = { limit: 1000, offset: 0 },
    client: AxiosInstance = defaultClient
  ): Promise<BurnScarResponse> {
    const response = await client.get<BurnScarResponse>('/features/burn-scar', {
      params
    });
    return response.data;
  },

  // ==========================================
  // 2. Map Tile URL Generators (MapLibre / Leaflet)
  // ==========================================

  /**
   * Generates a TMS tile URL pattern with ?api_key=${GISTDA_API_KEY}
   * Pattern: https://api-gateway.gistda.or.th/api/2.0/resources/maps/{layerPath}/tms/{z}/{x}/{y}?api_key=...
   */
  getTMSUrl(layerPath: string, apiKeyOverride?: string): string {
    const apiKey = apiKeyOverride || getGistdaApiKey();
    return `${GISTDA_BASE_URL}/maps/${layerPath}/tms/{z}/{x}/{y}?api_key=${apiKey}`;
  },

  /**
   * Generates a WMTS tile URL pattern with ?api_key=${GISTDA_API_KEY}
   * Supports standard KVP GetTile or XYZ template {z}/{x}/{y}.png
   */
  getWMTSUrl(
    layerPath: string,
    options?: {
      useXYZFormat?: boolean;
      layerIdentifier?: string;
      tileMatrixSet?: string;
      apiKeyOverride?: string;
    }
  ): string {
    const apiKey = options?.apiKeyOverride || getGistdaApiKey();
    if (options?.useXYZFormat) {
      return `${GISTDA_BASE_URL}/maps/${layerPath}/wmts/{z}/{x}/{y}.png?api_key=${apiKey}`;
    }

    const layer = options?.layerIdentifier || 'vallaris-blank';
    const matrixSet = options?.tileMatrixSet || 'WebMercatorQuad';
    return (
      `${GISTDA_BASE_URL}/maps/${layerPath}/wmts?service=WMTS&request=GetTile&version=1.0.0` +
      `&layer=${layer}&style=default&format=image/png&TileMatrixSet=${matrixSet}` +
      `&TileMatrix={z}&TileRow={y}&TileCol={x}&api_key=${apiKey}`
    );
  },

  /**
   * Generates a WMS GetMap tile URL pattern with ?api_key=${GISTDA_API_KEY}
   */
  getWMSUrl(
    layerPath: string,
    params?: WMSParams,
    apiKeyOverride?: string
  ): string {
    const apiKey = apiKeyOverride || getGistdaApiKey();
    const defaultParams: WMSParams = {
      service: 'WMS',
      request: 'GetMap',
      version: '1.1.1',
      layers: params?.layers || 'vallaris-blank',
      styles: params?.styles || '',
      format: params?.format || 'image/png',
      transparent: params?.transparent ?? true,
      srs: params?.srs || params?.crs || 'EPSG:3857',
      width: params?.width || 256,
      height: params?.height || 256,
      bbox: params?.bbox || '{bbox-epsg-3857}',
    };

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(defaultParams)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }
    searchParams.set('api_key', apiKey);

    return `${GISTDA_BASE_URL}/maps/${layerPath}/wms?${searchParams.toString()}`;
  },

  // ----------------------------------------
  // 2.1 Specific Map Helper Shortcuts
  // ----------------------------------------

  // Flood Maps
  getFloodWMSUrl(layer: FloodWMSLayer, params?: WMSParams, apiKey?: string): string {
    return this.getWMSUrl(layer, params, apiKey);
  },
  getFloodWMTSUrl(layer: FloodWMTSLayer, useXYZFormat: boolean = true, apiKey?: string): string {
    return this.getWMTSUrl(layer, { useXYZFormat, apiKeyOverride: apiKey });
  },

  // Wildfire Maps
  getWildfireWMSUrl(layer: WildfireWMSLayer, params?: WMSParams, apiKey?: string): string {
    return this.getWMSUrl(layer, params, apiKey);
  },
  getWildfireWMTSUrl(layer: WildfireWMTSLayer, useXYZFormat: boolean = true, apiKey?: string): string {
    return this.getWMTSUrl(layer, { useXYZFormat, apiKeyOverride: apiKey });
  },
  getWildfireTMSUrl(layer: WildfireTMSLayer, apiKey?: string): string {
    return this.getTMSUrl(layer, apiKey);
  },

  // Drought Maps
  getDroughtWMSUrl(layer: DroughtWMSLayer, params?: WMSParams, apiKey?: string): string {
    return this.getWMSUrl(layer, params, apiKey);
  },
  getDroughtWMTSUrl(layer: DroughtWMTSLayer, useXYZFormat: boolean = true, apiKey?: string): string {
    return this.getWMTSUrl(layer, { useXYZFormat, apiKeyOverride: apiKey });
  },
  getDroughtTMSUrl(layer: DroughtTMSLayer, apiKey?: string): string {
    return this.getTMSUrl(layer, apiKey);
  },

  // ----------------------------------------
  // 2.2 Integration Helpers for MapLibre & Leaflet
  // ----------------------------------------

  /**
   * Helper to construct a ready-to-use MapLibre Raster Source object.
   */
  getMapLibreRasterSource(
    serviceType: 'tms' | 'wmts' | 'wms',
    layerPath: string,
    options?: {
      wmsParams?: WMSParams;
      useXYZFormat?: boolean;
      tileSize?: number;
      minzoom?: number;
      maxzoom?: number;
      apiKey?: string;
    }
  ): MapLibreRasterSource {
    let tileUrl = '';
    let scheme: 'xyz' | 'tms' = 'xyz';

    if (serviceType === 'tms') {
      tileUrl = this.getTMSUrl(layerPath, options?.apiKey);
      scheme = 'tms';
    } else if (serviceType === 'wmts') {
      tileUrl = this.getWMTSUrl(layerPath, {
        useXYZFormat: options?.useXYZFormat ?? true,
        apiKeyOverride: options?.apiKey
      });
      scheme = 'xyz';
    } else {
      tileUrl = this.getWMSUrl(layerPath, options?.wmsParams, options?.apiKey);
      scheme = 'xyz';
    }

    return {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: options?.tileSize || 256,
      minzoom: options?.minzoom || 0,
      maxzoom: options?.maxzoom || 22,
      scheme
    };
  },

  /**
   * Helper to construct Leaflet TileLayer configuration.
   */
  getLeafletTileLayerConfig(
    serviceType: 'tms' | 'wmts' | 'wms',
    layerPath: string,
    options?: {
      wmsParams?: WMSParams;
      useXYZFormat?: boolean;
      apiKey?: string;
      leafletOptions?: LeafletTileLayerOptions;
    }
  ): { url: string; options: LeafletTileLayerOptions } {
    let url = '';
    const leafletOptions: LeafletTileLayerOptions = {
      minZoom: 0,
      maxZoom: 22,
      opacity: 1.0,
      attribution: '© GISTDA',
      ...(options?.leafletOptions || {})
    };

    if (serviceType === 'tms') {
      url = this.getTMSUrl(layerPath, options?.apiKey);
      leafletOptions.tms = true;
    } else if (serviceType === 'wmts') {
      url = this.getWMTSUrl(layerPath, {
        useXYZFormat: options?.useXYZFormat ?? true,
        apiKeyOverride: options?.apiKey
      });
    } else {
      url = this.getWMSUrl(layerPath, options?.wmsParams, options?.apiKey);
    }

    return {
      url,
      options: leafletOptions
    };
  }
};

// ==========================================
// 3. React Query Hooks with Caching
// staleTime: 10 mins, gcTime: 30 mins
// ==========================================

/**
 * Hook for GISTDA Flood Features (1day, 3days, 7days, 30days)
 */
export const useGISTDAFloodQuery = (
  timeframe: FloodTimeframe = '3days',
  params?: PaginationParams,
  options?: Omit<UseQueryOptions<FloodResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<FloodResponse, Error> => {
  return useQuery<FloodResponse, Error>({
    queryKey: ['gistda', 'flood', timeframe, params],
    queryFn: () => gistdaService.getFloodFeatures(timeframe, params),
    staleTime: GISTDA_CACHE_CONFIG.staleTime,
    gcTime: GISTDA_CACHE_CONFIG.gcTime,
    refetchOnWindowFocus: GISTDA_CACHE_CONFIG.refetchOnWindowFocus,
    retry: GISTDA_CACHE_CONFIG.retry,
    ...options
  });
};

/**
 * Hook for GISTDA Flood Frequency (น้ำท่วมซ้ำซาก)
 */
export const useGISTDAFloodFrequencyQuery = (
  params?: PaginationParams,
  options?: Omit<UseQueryOptions<RecurrentFloodResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<RecurrentFloodResponse, Error> => {
  return useQuery<RecurrentFloodResponse, Error>({
    queryKey: ['gistda', 'flood-freq', params],
    queryFn: () => gistdaService.getFloodFrequency(params),
    staleTime: GISTDA_CACHE_CONFIG.staleTime,
    gcTime: GISTDA_CACHE_CONFIG.gcTime,
    refetchOnWindowFocus: GISTDA_CACHE_CONFIG.refetchOnWindowFocus,
    retry: GISTDA_CACHE_CONFIG.retry,
    ...options
  });
};

/**
 * Hook for GISTDA Water Hyacinth (ผักตบชวา / สิ่งกีดขวางทางน้ำ)
 */
export const useGISTDAWaterHyacinthQuery = (
  params?: PaginationParams,
  options?: Omit<UseQueryOptions<WaterHyacinthResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<WaterHyacinthResponse, Error> => {
  return useQuery<WaterHyacinthResponse, Error>({
    queryKey: ['gistda', 'water_hyacinth', params],
    queryFn: () => gistdaService.getWaterHyacinth(params),
    staleTime: GISTDA_CACHE_CONFIG.staleTime,
    gcTime: GISTDA_CACHE_CONFIG.gcTime,
    refetchOnWindowFocus: GISTDA_CACHE_CONFIG.refetchOnWindowFocus,
    retry: GISTDA_CACHE_CONFIG.retry,
    ...options
  });
};

/**
 * Hook for GISTDA VIIRS Hotspots (1day, 3days, 7days, 30days)
 */
export const useGISTDAVIIRSQuery = (
  timeframe: VIIRSTimeframe = '3days',
  params?: VIIRSQueryParams,
  options?: Omit<UseQueryOptions<VIIRSResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<VIIRSResponse, Error> => {
  return useQuery<VIIRSResponse, Error>({
    queryKey: ['gistda', 'viirs', timeframe, params],
    queryFn: () => gistdaService.getVIIRSFeatures(timeframe, params),
    staleTime: GISTDA_CACHE_CONFIG.staleTime,
    gcTime: GISTDA_CACHE_CONFIG.gcTime,
    refetchOnWindowFocus: GISTDA_CACHE_CONFIG.refetchOnWindowFocus,
    retry: GISTDA_CACHE_CONFIG.retry,
    ...options
  });
};

/**
 * Hook for GISTDA Burn Frequency (พื้นที่เผาไหม้ซ้ำซาก)
 */
export const useGISTDABurnFrequencyQuery = (
  params?: PaginationParams,
  options?: Omit<UseQueryOptions<BurnFreqResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<BurnFreqResponse, Error> => {
  return useQuery<BurnFreqResponse, Error>({
    queryKey: ['gistda', 'burn-freq', params],
    queryFn: () => gistdaService.getBurnFrequency(params),
    staleTime: GISTDA_CACHE_CONFIG.staleTime,
    gcTime: GISTDA_CACHE_CONFIG.gcTime,
    refetchOnWindowFocus: GISTDA_CACHE_CONFIG.refetchOnWindowFocus,
    retry: GISTDA_CACHE_CONFIG.retry,
    ...options
  });
};

/**
 * Hook for GISTDA Burn Scar (ร่องรอยเผาไหม้ รายสัปดาห์)
 */
export const useGISTDABurnScarQuery = (
  params?: PaginationParams,
  options?: Omit<UseQueryOptions<BurnScarResponse, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<BurnScarResponse, Error> => {
  return useQuery<BurnScarResponse, Error>({
    queryKey: ['gistda', 'burn-scar', params],
    queryFn: () => gistdaService.getBurnScar(params),
    staleTime: GISTDA_CACHE_CONFIG.staleTime,
    gcTime: GISTDA_CACHE_CONFIG.gcTime,
    refetchOnWindowFocus: GISTDA_CACHE_CONFIG.refetchOnWindowFocus,
    retry: GISTDA_CACHE_CONFIG.retry,
    ...options
  });
};

export default gistdaService;
