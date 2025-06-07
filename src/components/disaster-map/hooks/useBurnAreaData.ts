
import { useQuery } from '@tanstack/react-query';

const API_KEY = 'wFaHcoOyzK53pVqspkI9Mvobjm5vWzHVOwGOjzW4f2nAAvsVf8CETklHpX1peaDF';
const API_BASE_URL = 'https://api-gateway.gistda.or.th/api/2.0/resources/features';

export interface BurnFreqData {
  features: Array<{
    geometry: {
      coordinates: number[];
      type: string;
    };
    properties: {
      burn_frequency: number;
      area_hectares: number;
      last_burn_date: string;
    };
  }>;
}

export interface BurnScarData {
  features: Array<{
    geometry: {
      coordinates: number[];
      type: string;
    };
    properties: {
      burn_date: string;
      area_hectares: number;
      severity: string;
    };
  }>;
}

export const useBurnFrequencyData = () => {
  return useQuery({
    queryKey: ['gistda-burn-frequency'],
    queryFn: async () => {
      console.log('Fetching burn frequency data...');
      
      const response = await fetch(`${API_BASE_URL}/burn-freq?limit=100&offset=0`, {
        headers: {
          'accept': 'application/json',
          'API-Key': API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch burn frequency data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Burn frequency data fetched:', data);
      return data as BurnFreqData;
    },
    refetchInterval: 1800000, // 30 minutes
  });
};

export const useBurnScarData = () => {
  return useQuery({
    queryKey: ['gistda-burn-scar'],
    queryFn: async () => {
      console.log('Fetching burn scar data...');
      
      const response = await fetch(`${API_BASE_URL}/burn-scar?limit=100&offset=0`, {
        headers: {
          'accept': 'application/json',
          'API-Key': API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch burn scar data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Burn scar data fetched:', data);
      return data as BurnScarData;
    },
    refetchInterval: 1800000, // 30 minutes
  });
};
