import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_GISTDA_DISASTER_API_KEY || '';
const BASE_URL = 'https://api-gateway.gistda.or.th/api/2.0/resources/features';

export interface FloodFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon' | 'Polygon';
    coordinates: number[][][][];
  };
  properties: {
    _id: string;
    _createdAt: string;
    _updatedAt: string;
    f_area: number;
    pv_tn: string; // จังหวัด
    ap_tn: string; // อำเภอ
    tb_tn: string; // ตำบล
    population?: number;
    population_2?: number;
    building?: number;
    length_road?: number;
    hospital?: number;
    school?: number;
    file_name?: string;
    [key: string]: any;
  };
}

export interface FloodResponse {
  type: 'FeatureCollection';
  features: FloodFeature[];
  numberMatched: number;
  numberReturned: number;
  timeStamp: string;
}

export interface RecurrentFloodFeature {
  id: string;
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: {
    _id: string;
    freq: number;
    LabelTH: string;
    LabelEN: string;
    shape_area: number;
    [key: string]: any;
  };
}

async function fetchFloodData(timeframe: '1day' | '3days', limit: number = 1000): Promise<FloodResponse> {
  const url = `${BASE_URL}/flood/${timeframe}`;
  const response = await axios.get(url, {
    headers: {
      'API-Key': API_KEY,
      'accept': 'application/json'
    },
    params: {
      limit,
      offset: 0
    }
  });
  return response.data;
}

async function fetchRecurrentFloodData(limit: number = 1000): Promise<FloodResponse> {
  const url = `${BASE_URL}/flood-freq`;
  const response = await axios.get(url, {
    headers: {
      'API-Key': API_KEY,
      'accept': 'application/json'
    },
    params: {
      limit,
      offset: 0
    }
  });
  return response.data;
}

export const useGISTDAFloodData = (timeframe: '1day' | '3days' | '7days' | '30days' = '3days') => {
  // Map timeframe to API endpoints
  const apiTimeframe = timeframe === '7days' || timeframe === '30days' ? '3days' : timeframe;

  return useQuery({
    queryKey: ['gistda-flood-data', apiTimeframe],
    queryFn: () => fetchFloodData(apiTimeframe),
    refetchInterval: 1800000, // 30 minutes
    staleTime: 900000, // 15 minutes
  });
};

export const useRecurrentFloodData = () => {
  return useQuery({
    queryKey: ['gistda-recurrent-flood'],
    queryFn: () => fetchRecurrentFloodData(500),
    refetchInterval: 3600000, // 1 hour
    staleTime: 1800000, // 30 minutes
  });
};

// Calculate center point of a polygon for marker placement
export const getFloodCenter = (feature: FloodFeature): [number, number] => {
  const coords = feature.geometry.coordinates[0][0];
  const lats = coords.map(c => c[1]);
  const lngs = coords.map(c => c[0]);

  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  return [centerLat, centerLng];
};
