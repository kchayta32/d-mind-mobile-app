
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays, subMonths, subYears, format } from 'date-fns';

export interface HistoricalDataPoint {
    date: string;
    count: number;
    type?: string;
    severity?: number;
}

export interface DisasterTrend {
    type: string;
    data: HistoricalDataPoint[];
    totalCount: number;
    averagePerDay: number;
    percentChange: number;
}

export interface HistoricalFilters {
    startDate: Date;
    endDate: Date;
    disasterTypes: string[];
    provinces: string[];
    severityMin?: number;
    severityMax?: number;
}

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all' | 'custom';

const DATE_RANGE_CONFIG: Record<DateRange, (now: Date) => Date> = {
    '7d': (now) => subDays(now, 7),
    '30d': (now) => subDays(now, 30),
    '90d': (now) => subDays(now, 90),
    '1y': (now) => subYears(now, 1),
    'all': (now) => subYears(now, 10),
    'custom': (now) => now
};

// Generate mock historical data for demo purposes
const generateMockHistoricalData = (
    startDate: Date,
    endDate: Date,
    types: string[] = ['earthquake', 'flood', 'wildfire', 'storm', 'landslide']
): { incidents: any[]; alerts: any[] } => {
    const incidents: any[] = [];
    const alerts: any[] = [];

    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < dayCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // Random number of incidents per day
        const incidentCount = Math.floor(Math.random() * 5);
        for (let j = 0; j < incidentCount; j++) {
            const type = types[Math.floor(Math.random() * types.length)];
            incidents.push({
                id: `incident-${i}-${j}`,
                type,
                created_at: date.toISOString(),
                severity_level: Math.floor(Math.random() * 5) + 1,
                status: Math.random() > 0.3 ? 'resolved' : 'pending',
                province: ['กรุงเทพมหานคร', 'เชียงใหม่', 'ภูเก็ต', 'ขอนแก่น'][Math.floor(Math.random() * 4)]
            });
        }

        // Random alerts
        const alertCount = Math.floor(Math.random() * 3);
        for (let k = 0; k < alertCount; k++) {
            const type = types[Math.floor(Math.random() * types.length)];
            alerts.push({
                id: `alert-${i}-${k}`,
                alert_type: type,
                created_at: date.toISOString(),
                severity: Math.floor(Math.random() * 5) + 1,
                is_active: Math.random() > 0.7
            });
        }
    }

    return { incidents, alerts };
};

export const useHistoricalData = () => {
    const [dateRange, setDateRange] = useState<DateRange>('30d');
    const [customStartDate, setCustomStartDate] = useState<Date>(subMonths(new Date(), 1));
    const [customEndDate, setCustomEndDate] = useState<Date>(new Date());
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

    // Calculate dates based on range
    const { startDate, endDate } = useMemo(() => {
        if (dateRange === 'custom') {
            return { startDate: customStartDate, endDate: customEndDate };
        }
        const now = new Date();
        return {
            startDate: DATE_RANGE_CONFIG[dateRange](now),
            endDate: now
        };
    }, [dateRange, customStartDate, customEndDate]);

    // Fetch historical incidents
    const { data: incidentsData, isLoading: isLoadingIncidents } = useQuery({
        queryKey: ['historical-incidents', startDate, endDate],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from('incident_reports')
                    .select('*')
                    .gte('created_at', startOfDay(startDate).toISOString())
                    .lte('created_at', endOfDay(endDate).toISOString())
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (!data || data.length === 0) {
                    // Return mock data if no real data
                    return generateMockHistoricalData(startDate, endDate).incidents;
                }
                return data;
            } catch {
                return generateMockHistoricalData(startDate, endDate).incidents;
            }
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });

    // Fetch historical alerts
    const { data: alertsData, isLoading: isLoadingAlerts } = useQuery({
        queryKey: ['historical-alerts', startDate, endDate],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from('realtime_alerts')
                    .select('*')
                    .gte('created_at', startOfDay(startDate).toISOString())
                    .lte('created_at', endOfDay(endDate).toISOString())
                    .order('created_at', { ascending: true });

                if (error) throw error;

                if (!data || data.length === 0) {
                    return generateMockHistoricalData(startDate, endDate).alerts;
                }
                return data;
            } catch {
                return generateMockHistoricalData(startDate, endDate).alerts;
            }
        },
        staleTime: 5 * 60 * 1000
    });

    // Process data for charts
    const processedData = useMemo(() => {
        const incidents = incidentsData || [];
        const alerts = alertsData || [];

        // Filter by selected types if any
        let filteredIncidents = incidents;
        let filteredAlerts = alerts;

        if (selectedTypes.length > 0) {
            filteredIncidents = incidents.filter((i: any) => selectedTypes.includes(i.type));
            filteredAlerts = alerts.filter((a: any) => selectedTypes.includes(a.alert_type));
        }

        if (selectedProvinces.length > 0) {
            filteredIncidents = filteredIncidents.filter((i: any) =>
                selectedProvinces.includes(i.province)
            );
        }

        // Group by date
        const incidentsByDate = new Map<string, number>();
        const alertsByDate = new Map<string, number>();
        const typeBreakdown = new Map<string, number>();

        filteredIncidents.forEach((incident: any) => {
            const date = format(new Date(incident.created_at), 'yyyy-MM-dd');
            incidentsByDate.set(date, (incidentsByDate.get(date) || 0) + 1);

            const type = incident.type || 'other';
            typeBreakdown.set(type, (typeBreakdown.get(type) || 0) + 1);
        });

        filteredAlerts.forEach((alert: any) => {
            const date = format(new Date(alert.created_at), 'yyyy-MM-dd');
            alertsByDate.set(date, (alertsByDate.get(date) || 0) + 1);
        });

        // Create time series data
        const timeSeriesData: { date: string; incidents: number; alerts: number }[] = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            timeSeriesData.push({
                date: dateStr,
                incidents: incidentsByDate.get(dateStr) || 0,
                alerts: alertsByDate.get(dateStr) || 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Type breakdown for pie chart
        const typeData = Array.from(typeBreakdown.entries()).map(([type, count]) => ({
            name: type,
            value: count
        }));

        // Severity distribution
        const severityData = [1, 2, 3, 4, 5].map(level => ({
            level,
            count: filteredIncidents.filter((i: any) => i.severity_level === level).length
        }));

        return {
            timeSeries: timeSeriesData,
            typeBreakdown: typeData,
            severityDistribution: severityData,
            totalIncidents: filteredIncidents.length,
            totalAlerts: filteredAlerts.length,
            resolvedIncidents: filteredIncidents.filter((i: any) => i.status === 'resolved').length
        };
    }, [incidentsData, alertsData, startDate, endDate, selectedTypes, selectedProvinces]);

    // Export data as JSON
    const exportData = useCallback(() => {
        const exportObj = {
            dateRange: { start: startDate, end: endDate },
            incidents: incidentsData,
            alerts: alertsData,
            summary: processedData,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `d-mind-historical-data-${format(startDate, 'yyyyMMdd')}-${format(endDate, 'yyyyMMdd')}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [incidentsData, alertsData, processedData, startDate, endDate]);

    // Export as CSV
    const exportCSV = useCallback(() => {
        const incidents = incidentsData || [];
        const headers = ['Date', 'Type', 'Title', 'Severity', 'Status', 'Province'];
        const rows = incidents.map((i: any) => [
            format(new Date(i.created_at), 'yyyy-MM-dd HH:mm'),
            i.type,
            i.title || '',
            i.severity_level,
            i.status,
            i.province || ''
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `d-mind-incidents-${format(startDate, 'yyyyMMdd')}-${format(endDate, 'yyyyMMdd')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [incidentsData, startDate, endDate]);

    return {
        dateRange,
        setDateRange,
        startDate,
        endDate,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        selectedTypes,
        setSelectedTypes,
        selectedProvinces,
        setSelectedProvinces,
        isLoading: isLoadingIncidents || isLoadingAlerts,
        processedData,
        rawIncidents: incidentsData || [],
        rawAlerts: alertsData || [],
        exportData,
        exportCSV
    };
};

export default useHistoricalData;
