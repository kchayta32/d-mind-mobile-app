import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HourlyDisasterPoint {
  hourLabel: string; // e.g. "14:00"
  hour: number;      // 0-23
  startTime: string; // ISO string
  earthquakes: number;
  floods: number;
  landslides: number;
  wildfires: number;
  total: number;
}

export interface DailyStats {
  earthquakes: number;
  floods: number;
  landslides: number;
  wildfires: number;
  total: number;
}

export interface UseDailyDisasterStatsReturn {
  stats: DailyStats;
  hourlyTrend: HourlyDisasterPoint[];
  isLoading: boolean;
  isRefetching: boolean;
  lastUpdated: Date | null;
  lastUpdatedText: string;
  error: string | null;
  refetch: () => Promise<void>;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;

export const formatThaiTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} น.`;
};

const parseHotspotTimestamp = (item: any): Date | null => {
  const p = item.properties || {};
  const dateStr = p.th_date || p.acq_date || item.ACQ_DATE;
  const timeStr = p.th_time || p.acq_time || item.ACQ_TIME;
  if (dateStr) {
    if (timeStr) {
      let cleanTime = String(timeStr).trim();
      if (cleanTime.length === 4 && !cleanTime.includes(':')) {
        cleanTime = `${cleanTime.slice(0, 2)}:${cleanTime.slice(2, 4)}:00`;
      } else if (cleanTime.length === 5 && cleanTime.includes(':')) {
        cleanTime = `${cleanTime}:00`;
      }
      const parsed = new Date(`${dateStr}T${cleanTime}`);
      if (!isNaN(parsed.getTime())) return parsed;
      const spaceParsed = new Date(`${dateStr} ${cleanTime}`);
      if (!isNaN(spaceParsed.getTime())) return spaceParsed;
    }
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (p._createdAt) {
    const parsed = new Date(p._createdAt);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
};

const createInitialBuckets = (referenceTime: Date): HourlyDisasterPoint[] => {
  const buckets: HourlyDisasterPoint[] = [];
  // 24 buckets: from 23 hours ago up to current hour
  for (let i = 23; i >= 0; i--) {
    const slotTime = new Date(referenceTime.getTime() - i * ONE_HOUR_MS);
    const hour = slotTime.getHours();
    const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
    buckets.push({
      hourLabel,
      hour,
      startTime: new Date(slotTime.getFullYear(), slotTime.getMonth(), slotTime.getDate(), hour, 0, 0).toISOString(),
      earthquakes: 0,
      floods: 0,
      landslides: 0,
      wildfires: 0,
      total: 0,
    });
  }
  return buckets;
};

export const useDailyDisasterStats = (): UseDailyDisasterStatsReturn => {
  const [stats, setStats] = useState<DailyStats>({
    earthquakes: 0,
    floods: 0,
    landslides: 0,
    wildfires: 0,
    total: 0,
  });
  const [hourlyTrend, setHourlyTrend] = useState<HourlyDisasterPoint[]>(() =>
    createInitialBuckets(new Date())
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchDailyStats = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setError(null);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS);
    const buckets = createInitialBuckets(now);

    const findBucketIndex = (timestamp: Date): number => {
      const diff = now.getTime() - timestamp.getTime();
      if (diff < 0 || diff > TWENTY_FOUR_HOURS_MS) return -1;
      const hoursAgo = Math.floor(diff / ONE_HOUR_MS);
      return 23 - Math.min(Math.max(hoursAgo, 0), 23);
    };

    const dailyStats: DailyStats = {
      earthquakes: 0,
      floods: 0,
      landslides: 0,
      wildfires: 0,
      total: 0,
    };

    try {
      // 1. Fetch Supabase realtime_alerts & incident_reports for last 24h
      const [alertsRes, incidentRes] = await Promise.allSettled([
        supabase
          .from('realtime_alerts')
          .select('id, alert_type, created_at')
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .eq('is_active', true),
        supabase
          .from('incident_reports')
          .select('id, type, created_at')
          .gte('created_at', twentyFourHoursAgo.toISOString()),
      ]);

      const processAlertOrIncident = (typeStr: string, createdAtStr: string) => {
        const type = (typeStr || '').toLowerCase();
        const itemDate = new Date(createdAtStr);
        const idx = findBucketIndex(itemDate);

        if (type.includes('landslide') || type.includes('ดินถล่ม')) {
          dailyStats.landslides++;
          if (idx >= 0) {
            buckets[idx].landslides++;
            buckets[idx].total++;
          }
        } else if (type.includes('earthquake') || type.includes('แผ่นดินไหว')) {
          dailyStats.earthquakes++;
          if (idx >= 0) {
            buckets[idx].earthquakes++;
            buckets[idx].total++;
          }
        } else if (type.includes('flood') || type.includes('น้ำท่วม')) {
          dailyStats.floods++;
          if (idx >= 0) {
            buckets[idx].floods++;
            buckets[idx].total++;
          }
        } else if (type.includes('wildfire') || type.includes('fire') || type.includes('ไฟป่า')) {
          dailyStats.wildfires++;
          if (idx >= 0) {
            buckets[idx].wildfires++;
            buckets[idx].total++;
          }
        }
      };

      if (alertsRes.status === 'fulfilled' && alertsRes.value.data) {
        alertsRes.value.data.forEach((alert) => {
          processAlertOrIncident(alert.alert_type, alert.created_at);
        });
      }

      if (incidentRes.status === 'fulfilled' && incidentRes.value.data) {
        incidentRes.value.data.forEach((incident) => {
          processAlertOrIncident(incident.type, incident.created_at);
        });
      }

      // 2. Fetch GISTDA VIIRS Hotspots (1day / 24h)
      const GISTDA_API_KEY = import.meta.env.VITE_GISTDA_DISASTER_API_KEY || '';
      try {
        const viirsResponse = await fetch(
          'https://api-gateway.gistda.or.th/api/2.0/resources/features/viirs/1day?limit=1000&offset=0&ct_tn=%E0%B8%A3%E0%B8%B2%E0%B8%8A%E0%B8%AD%E0%B8%B2%E0%B8%93%E0%B8%B2%E0%B8%88%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B9%84%E0%B8%97%E0%B8%A2',
          {
            headers: {
              'API-Key': GISTDA_API_KEY,
              accept: 'application/json',
            },
          }
        );

        if (viirsResponse.ok) {
          const viirsData = await viirsResponse.json();
          const features = viirsData.features || [];
          if (features.length > 0) {
            // Replace wildfire count with actual satellite detections
            let hotspotCount = 0;
            // Clear prior wildfire counts from alerts if we have authoritative VIIRS
            buckets.forEach((b) => {
              b.total -= b.wildfires;
              b.wildfires = 0;
            });
            dailyStats.wildfires = 0;

            features.forEach((feature: any) => {
              hotspotCount++;
              dailyStats.wildfires++;
              const dt = parseHotspotTimestamp(feature);
              const idx = dt ? findBucketIndex(dt) : 23;
              if (idx >= 0) {
                buckets[idx].wildfires++;
                buckets[idx].total++;
              }
            });
          }
        }
      } catch (err) {
        console.warn('GISTDA VIIRS data fetch skipped or failed:', err);
      }

      // 3. Fetch GISTDA Flood 1day
      try {
        const floodResponse = await fetch(
          'https://api-gateway.gistda.or.th/api/2.0/resources/features/flood/1day?limit=1000',
          {
            headers: {
              'API-Key': GISTDA_API_KEY,
              accept: 'application/json',
            },
          }
        );

        if (floodResponse.ok) {
          const floodData = await floodResponse.json();
          const features = floodData.features || [];
          if (features.length > 0) {
            // If satellite flood data is present, align flood bucket counts
            buckets.forEach((b) => {
              b.total -= b.floods;
              b.floods = 0;
            });
            dailyStats.floods = 0;

            features.forEach((feature: any) => {
              dailyStats.floods++;
              const p = feature.properties || {};
              const dateStr = p._updatedAt || p._createdAt || floodData.timeStamp;
              const dt = dateStr ? new Date(dateStr) : null;
              const idx = dt && !isNaN(dt.getTime()) ? findBucketIndex(dt) : 23;
              if (idx >= 0) {
                buckets[idx].floods++;
                buckets[idx].total++;
              }
            });
          } else if (floodData.numberReturned && floodData.numberReturned > dailyStats.floods) {
            dailyStats.floods = floodData.numberReturned;
          }
        }
      } catch (err) {
        console.warn('GISTDA Flood data fetch skipped or failed:', err);
      }

      // 4. Fetch USGS Earthquakes 24h
      try {
        const eqResponse = await fetch(
          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
        );

        if (eqResponse.ok) {
          const eqData = await eqResponse.json();
          const features = eqData.features || [];
          if (features.length > 0) {
            // Clear prior earthquake counts from alerts if we have global USGS
            buckets.forEach((b) => {
              b.total -= b.earthquakes;
              b.earthquakes = 0;
            });
            dailyStats.earthquakes = 0;

            features.forEach((feature: any) => {
              const timeMs = feature.properties?.time;
              if (timeMs) {
                const dt = new Date(timeMs);
                const idx = findBucketIndex(dt);
                dailyStats.earthquakes++;
                if (idx >= 0) {
                  buckets[idx].earthquakes++;
                  buckets[idx].total++;
                }
              }
            });
          }
        }
      } catch (err) {
        console.warn('USGS Earthquake data fetch skipped or failed:', err);
      }

      // Calculate overall total
      dailyStats.total =
        dailyStats.earthquakes +
        dailyStats.floods +
        dailyStats.landslides +
        dailyStats.wildfires;

      if (isMountedRef.current) {
        setStats(dailyStats);
        setHourlyTrend(buckets);
        setLastUpdated(now);
        setLastUpdatedText(formatThaiTime(now));
      }
    } catch (err: any) {
      console.error('Error fetching 24h daily disaster stats:', err);
      if (isMountedRef.current) {
        setError(err?.message || 'Failed to fetch disaster statistics');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchDailyStats(true);

    // Auto-refresh every 1 hour (60 * 60 * 1000 ms)
    const interval = setInterval(() => {
      fetchDailyStats(false);
    }, ONE_HOUR_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchDailyStats]);

  const refetch = useCallback(async () => {
    await fetchDailyStats(false);
  }, [fetchDailyStats]);

  return {
    stats,
    hourlyTrend,
    isLoading,
    isRefetching,
    lastUpdated,
    lastUpdatedText,
    error,
    refetch,
  };
};
