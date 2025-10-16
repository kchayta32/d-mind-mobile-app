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
        
        // Get today's date at 00:00:00
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch alerts created today
        const { data: alerts, error } = await supabase
          .from('realtime_alerts')
          .select('alert_type')
          .gte('created_at', today.toISOString())
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

    // Reset stats at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      fetchDailyStats();
      // Set up daily reset
      const dailyReset = setInterval(fetchDailyStats, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyReset);
    }, timeUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, []);

  return { stats, isLoading };
};
