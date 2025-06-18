
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DisasterStatistic {
  id: string;
  disaster_type: string;
  province: string;
  date: string;
  count: number;
  severity_level: number;
  affected_area: number;
  metadata: any;
}

interface StatsSummary {
  totalIncidents: number;
  mostAffectedProvince: string;
  mostCommonDisaster: string;
  recentTrend: 'increasing' | 'decreasing' | 'stable';
}

export const useDisasterStatistics = (dateRange: string = '30days') => {
  const [statistics, setStatistics] = useState<DisasterStatistic[]>([]);
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      const { data, error } = await supabase
        .from('disaster_statistics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading statistics:', error);
        return;
      }

      setStatistics(data || []);
      
      // Calculate summary
      if (data && data.length > 0) {
        const totalIncidents = data.reduce((sum, stat) => sum + stat.count, 0);
        
        // Most affected province
        const provinceStats = data.reduce((acc: Record<string, number>, stat) => {
          acc[stat.province] = (acc[stat.province] || 0) + stat.count;
          return acc;
        }, {});
        const mostAffectedProvince = Object.entries(provinceStats)
          .sort(([,a], [,b]) => b - a)[0][0];

        // Most common disaster
        const disasterStats = data.reduce((acc: Record<string, number>, stat) => {
          acc[stat.disaster_type] = (acc[stat.disaster_type] || 0) + stat.count;
          return acc;
        }, {});
        const mostCommonDisaster = Object.entries(disasterStats)
          .sort(([,a], [,b]) => b - a)[0][0];

        // Simple trend calculation
        const recentData = data.slice(0, Math.floor(data.length / 2));
        const olderData = data.slice(Math.floor(data.length / 2));
        const recentAvg = recentData.reduce((sum, stat) => sum + stat.count, 0) / recentData.length;
        const olderAvg = olderData.reduce((sum, stat) => sum + stat.count, 0) / olderData.length;
        
        let recentTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (recentAvg > olderAvg * 1.1) recentTrend = 'increasing';
        else if (recentAvg < olderAvg * 0.9) recentTrend = 'decreasing';

        setSummary({
          totalIncidents,
          mostAffectedProvince,
          mostCommonDisaster,
          recentTrend
        });
      }
    } catch (error) {
      console.error('Error in loadStatistics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  return {
    statistics,
    summary,
    isLoading,
    loadStatistics
  };
};
