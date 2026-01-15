import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyStats {
  earthquakes: number;
  floods: number;
  landslides: number;
  wildfires: number;
}

export const useDailyDisasterStats = () => {
  const [stats, setStats] = useState<DailyStats>({
    earthquakes: 0,
    floods: 0,
    landslides: 0,
    wildfires: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDailyStats = async () => {
      try {
        setIsLoading(true);

        // Get timestamp for 24 hours ago
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // Fetch alerts from last 24 hours
        const { data: alerts, error } = await supabase
          .from('realtime_alerts')
          .select('alert_type')
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .eq('is_active', true);

        if (error) throw error;

        // Count each disaster type
        const dailyStats: DailyStats = {
          earthquakes: 0,
          floods: 0,
          landslides: 0,
          wildfires: 0,
        };

        alerts?.forEach((alert) => {
          const type = alert.alert_type.toLowerCase();
          if (type.includes('earthquake') || type.includes('แผ่นดินไหว')) {
            dailyStats.earthquakes++;
          } else if (type.includes('flood') || type.includes('น้ำท่วม')) {
            dailyStats.floods++;
          } else if (type.includes('landslide') || type.includes('ดินถล่ม')) {
            dailyStats.landslides++;
          } else if (type.includes('wildfire') || type.includes('fire') || type.includes('ไฟป่า')) {
            dailyStats.wildfires++;
          }
        });

        // Fetch GISTDA flood data for accurate count
        try {
          const floodResponse = await fetch('https://api-gateway.gistda.or.th/api/2.0/resources/features/flood/1day', {
            headers: {
              'API-Key': import.meta.env.VITE_GISTDA_DISASTER_API_KEY || '',
              'accept': 'application/json'
            }
          });
          if (floodResponse.ok) {
            const floodData = await floodResponse.json();
            dailyStats.floods = floodData.numberReturned || dailyStats.floods;
          }
        } catch (error) {
          console.error('Error fetching GISTDA flood data:', error);
        }

        setStats(dailyStats);
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchDailyStats, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { stats, isLoading };
};
