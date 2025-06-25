
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  date_recorded: string;
  location_data?: any;
  metadata?: any;
}

export const useAnalytics = () => {
  // Fetch disaster statistics
  const { data: disasterStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['disaster-statistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disaster_statistics')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    }
  });

  // Fetch analytics data
  const { data: analyticsData = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*')
        .order('date_recorded', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as AnalyticsMetric[];
    }
  });

  // Fetch incident reports for dashboard
  const { data: incidentReports = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['incident-reports-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch active alerts
  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('realtime_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Process data for charts
  const processedData = {
    // Disaster type distribution
    disasterTypes: disasterStats.reduce((acc: any, stat) => {
      acc[stat.disaster_type] = (acc[stat.disaster_type] || 0) + stat.count;
      return acc;
    }, {}),

    // Severity distribution
    severityDistribution: activeAlerts.reduce((acc: any, alert) => {
      const level = `ระดับ ${alert.severity_level}`;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {}),

    // Monthly trends
    monthlyTrends: disasterStats.reduce((acc: any, stat) => {
      const month = new Date(stat.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + stat.count;
      return acc;
    }, {}),

    // Province distribution
    provinceStats: disasterStats.reduce((acc: any, stat) => {
      acc[stat.province] = (acc[stat.province] || 0) + stat.count;
      return acc;
    }, {}),

    // Incident status distribution
    incidentStatus: incidentReports.reduce((acc: any, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {}),

    // Recent metrics
    recentMetrics: analyticsData.filter(metric => 
      metric.metric_type === 'system_metric'
    ).slice(0, 10)
  };

  const isLoading = statsLoading || analyticsLoading || incidentsLoading || alertsLoading;

  return {
    disasterStats,
    analyticsData,
    incidentReports,
    activeAlerts,
    processedData,
    isLoading
  };
};
