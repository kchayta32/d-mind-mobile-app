
import { useQuery } from '@tanstack/react-query';
import { GISTDAData } from '../useGISTDAData';

const API_KEY = 'wFaHcoOyzK53pVqspkI9Mvobjm5vWzHVOwGOjzW4f2nAAvsVf8CETklHpX1peaDF';
const API_BASE_URL = 'https://api-gateway.gistda.or.th/api/2.0/resources/features';

export const useViirs1DayData = () => {
  return useQuery({
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
};

export const useViirs3DaysData = () => {
  return useQuery({
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
};
