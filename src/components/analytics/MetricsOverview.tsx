
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, Users, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, icon, trend, trendValue }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {trend && trendValue && (
        <div className="flex items-center pt-1">
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <Activity className="h-4 w-4 text-gray-500" />
          )}
          <span className={`text-xs ml-1 ${
            trend === 'up' ? 'text-green-500' : 
            trend === 'down' ? 'text-red-500' : 
            'text-gray-500'
          }`}>
            {trendValue}
          </span>
        </div>
      )}
    </CardContent>
  </Card>
);

interface MetricsOverviewProps {
  activeAlerts: any[];
  incidentReports: any[];
  disasterStats: any[];
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  activeAlerts,
  incidentReports,
  disasterStats
}) => {
  const totalIncidents = incidentReports.length;
  const verifiedIncidents = incidentReports.filter(r => r.is_verified).length;
  const highSeverityAlerts = activeAlerts.filter(a => a.severity_level >= 4).length;
  const totalAffectedAreas = [...new Set(disasterStats.map(s => s.province))].length;

  // Define trend values properly
  const alertTrend: 'up' | 'neutral' = activeAlerts.length > 5 ? 'up' : 'neutral';

  const metrics = [
    {
      title: "การแจ้งเตือนที่ใช้งานอยู่",
      value: activeAlerts.length,
      description: `${highSeverityAlerts} รายการมีความรุนแรงสูง`,
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      trend: alertTrend,
      trendValue: "24 ชม. ที่ผ่านมา"
    },
    {
      title: "รายงานเหตุการณ์",
      value: totalIncidents,
      description: `${verifiedIncidents} รายการได้รับการยืนยัน`,
      icon: <Activity className="h-4 w-4 text-blue-500" />,
      trend: 'up' as const,
      trendValue: "+12% จากเดือนที่แล้ว"
    },
    {
      title: "พื้นที่ที่ได้รับผลกระทบ",
      value: totalAffectedAreas,
      description: "จังหวัดที่มีรายงานภัยพิบัติ",
      icon: <MapPin className="h-4 w-4 text-green-500" />,
      trend: 'neutral' as const,
      trendValue: "คงที่"
    },
    {
      title: "ผู้ใช้งานออนไลน์",
      value: "1,247",
      description: "ผู้ใช้ที่เข้าถึงระบบในปัจจุบัน",
      icon: <Users className="h-4 w-4 text-purple-500" />,
      trend: 'up' as const,
      trendValue: "+5.2% จากชั่วโมงที่แล้ว"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default MetricsOverview;
