
import { useQuery } from '@tanstack/react-query';
import { GISTDAData } from '../useGISTDAData';

export const useModisData = () => {
  return useQuery({
    queryKey: ['gistda-modis'],
    queryFn: async () => {
      console.log('Fetching GISTDA MODIS data...');

      const response = await fetch(`https://disaster.gistda.or.th/api/1.0/documents/fire/hotspot/modis/3days?limit=1000&offset=0`, {
        headers: {
          'accept': 'application/json',
          'API-Key': import.meta.env.VITE_GISTDA_FIRE_API_KEY || ''
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
};
