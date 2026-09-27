import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Earthquake, EarthquakeStats } from './types';

export type EarthquakeFeedSource = 'all' | 'usgs' | 'emsc' | 'gdacs';
export type EarthquakeTimeWindow = '24h' | '3days' | '7days' | '30days';

export const useEarthquakeData = (
  timeWindow: EarthquakeTimeWindow = '7days',
  feedSource: EarthquakeFeedSource = 'all'
) => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [statistics, setStatistics] = useState<EarthquakeStats>({
    total: 0,
    averageMagnitude: 0,
    maxMagnitude: 0,
    averageDepth: 0,
    last24Hours: 0,
    significantCount: 0,
    major: 0,
    tsunamiAlertsCount: 0,
    sourceBreakdown: { usgs: 0, emsc: 0, gdacs: 0 }
  });

  // 1. Fetch from USGS Earthquakes Feed
  const { data: usgsData, isLoading: isUsgsLoading, refetch: refetchUsgs } = useQuery({
    queryKey: ['earthquake-usgs', timeWindow],
    queryFn: async () => {
      try {
        let endpoint = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
        if (timeWindow === '24h') {
          endpoint = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
        } else if (timeWindow === '30days') {
          endpoint = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
        }

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`USGS HTTP error ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn('USGS earthquake fetch failed:', err);
        return null;
      }
    },
    refetchInterval: 180000, // 3 minutes
    staleTime: 60000
  });

  // 2. Fetch from EMSC Seismic Portal (Europe-Mediterranean & Global)
  const { data: emscData, isLoading: isEmscLoading, refetch: refetchEmsc } = useQuery({
    queryKey: ['earthquake-emsc'],
    queryFn: async () => {
      try {
        const res = await fetch('https://www.seismicportal.eu/fdsnws/event/1/query?format=json&limit=60');
        if (!res.ok) throw new Error(`EMSC HTTP error ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn('EMSC earthquake fetch failed:', err);
        return null;
      }
    },
    refetchInterval: 180000,
    staleTime: 60000
  });

  // 3. Fetch from GDACS Earthquake Alerts
  const { data: gdacsData, isLoading: isGdacsLoading, refetch: refetchGdacs } = useQuery({
    queryKey: ['earthquake-gdacs'],
    queryFn: async () => {
      try {
        const res = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?eventtype=EQ');
        if (!res.ok) throw new Error(`GDACS HTTP error ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn('GDACS earthquake fetch failed:', err);
        return null;
      }
    },
    refetchInterval: 300000,
    staleTime: 120000
  });

  useEffect(() => {
    const list: Earthquake[] = [];
    const idSet = new Set<string>();

    let usgsCount = 0;
    let emscCount = 0;
    let gdacsCount = 0;

    // Process USGS
    if ((feedSource === 'all' || feedSource === 'usgs') && usgsData?.features) {
      usgsData.features.forEach((feature: any) => {
        const p = feature.properties || {};
        const coords = feature.geometry?.coordinates || [0, 0, 0];
        if (!Array.isArray(coords) || typeof coords[1] !== 'number' || typeof coords[0] !== 'number' || isNaN(coords[1]) || isNaN(coords[0])) return;
        const mag = p.mag !== null && p.mag !== undefined ? Math.round(p.mag * 10) / 10 : 0;
        const depth = coords[2] !== undefined ? Math.round(coords[2]) : 10;
        const id = `usgs-${feature.id}`;
        
        idSet.add(id);
        usgsCount++;
        
        list.push({
          id,
          magnitude: mag,
          location: p.place || 'Unknown location',
          place: p.place,
          depth,
          time: new Date(p.time).toISOString(),
          latitude: coords[1],
          longitude: coords[0],
          lat: coords[1],
          lng: coords[0],
          url: p.url,
          isSignificant: mag >= 4.5 || (p.sig && p.sig >= 600),
          tsunamiAlert: p.tsunami === 1,
          source: 'USGS',
          feltReports: p.felt || 0,
          alertColor: p.alert ? (p.alert as any) : (mag >= 6 ? 'red' : mag >= 5 ? 'orange' : mag >= 4 ? 'yellow' : 'green')
        });
      });
    }

    // Process EMSC
    if ((feedSource === 'all' || feedSource === 'emsc') && emscData?.features) {
      emscData.features.forEach((feature: any) => {
        const p = feature.properties || {};
        const coords = feature.geometry?.coordinates || [0, 0, 0];
        if (!Array.isArray(coords) || typeof coords[1] !== 'number' || typeof coords[0] !== 'number' || isNaN(coords[1]) || isNaN(coords[0])) return;
        const mag = p.mag !== null && p.mag !== undefined ? Math.round(p.mag * 10) / 10 : 0;
        const depth = coords[2] !== undefined ? Math.round(Math.abs(coords[2])) : 10;
        const emscId = `emsc-${p.unid || feature.id || Math.random()}`;

        // Deduplicate close-proximity events if already present from USGS
        const isDuplicate = list.some(eq => 
          Math.abs(eq.lat - coords[1]) < 0.3 &&
          Math.abs(eq.lng - coords[0]) < 0.3 &&
          Math.abs(new Date(eq.time).getTime() - new Date(p.time).getTime()) < 300000
        );

        if (!isDuplicate) {
          emscCount++;
          list.push({
            id: emscId,
            magnitude: mag,
            location: p.flynn_region || p.place || 'EMSC Event',
            place: p.flynn_region || p.place,
            depth,
            time: new Date(p.time).toISOString(),
            latitude: coords[1],
            longitude: coords[0],
            lat: coords[1],
            lng: coords[0],
            url: p.url,
            isSignificant: mag >= 4.5,
            tsunamiAlert: false,
            source: 'EMSC',
            feltReports: p.findex || 0,
            alertColor: mag >= 6 ? 'red' : mag >= 5 ? 'orange' : mag >= 4 ? 'yellow' : 'green'
          });
        }
      });
    }

    // Process GDACS Alerts
    if ((feedSource === 'all' || feedSource === 'gdacs') && gdacsData?.features) {
      gdacsData.features.forEach((feature: any) => {
        const p = feature.properties || {};
        const coords = feature.geometry?.coordinates || [0, 0];
        if (!Array.isArray(coords) || typeof coords[1] !== 'number' || typeof coords[0] !== 'number' || isNaN(coords[1]) || isNaN(coords[0])) return;
        const mag = p.severitydata?.severity !== undefined ? Number(p.severitydata.severity) : (Number(p.magnitude) || 5.0);
        const depth = Number(p.depth || 10);
        const gdacsId = `gdacs-eq-${p.eventid || Math.random()}`;

        const isDuplicate = list.some(eq => 
          Math.abs(eq.lat - coords[1]) < 0.4 &&
          Math.abs(eq.lng - coords[0]) < 0.4 &&
          Math.abs(new Date(eq.time).getTime() - new Date(p.fromdate || p.todate || 0).getTime()) < 1800000
        );

        if (!isDuplicate) {
          gdacsCount++;
          list.push({
            id: gdacsId,
            magnitude: Math.round(mag * 10) / 10,
            location: p.name || p.eventname || p.country || 'GDACS Severe Event',
            place: p.name || p.country,
            depth,
            time: new Date(p.todate || p.fromdate || Date.now()).toISOString(),
            latitude: coords[1],
            longitude: coords[0],
            lat: coords[1],
            lng: coords[0],
            url: typeof p.url === 'object' ? p.url?.url : p.url,
            isSignificant: true,
            tsunamiAlert: p.alertlevel === 'Red' || (p.name && p.name.toLowerCase().includes('tsunami')),
            source: 'GDACS',
            alertColor: p.alertlevel === 'Red' ? 'red' : p.alertlevel === 'Orange' ? 'orange' : 'green'
          });
        }
      });
    }

    // Filter by time window
    const now = Date.now();
    const cutoffMap: Record<EarthquakeTimeWindow, number> = {
      '24h': 24 * 3600000,
      '3days': 3 * 24 * 3600000,
      '7days': 7 * 24 * 3600000,
      '30days': 30 * 24 * 3600000
    };
    const cutoff = now - (cutoffMap[timeWindow] || cutoffMap['7days']);
    const filteredByTime = list.filter(eq => new Date(eq.time).getTime() >= cutoff);

    // Calculate statistics
    const last24hCutoff = now - 24 * 3600000;
    const last24hCount = filteredByTime.filter(eq => new Date(eq.time).getTime() >= last24hCutoff).length;
    const significantCount = filteredByTime.filter(eq => eq.isSignificant).length;
    const majorCount = filteredByTime.filter(eq => eq.magnitude >= 6.0).length;
    const tsunamiCount = filteredByTime.filter(eq => eq.tsunamiAlert).length;

    const magnitudes = filteredByTime.map(eq => eq.magnitude).filter(m => m > 0);
    const depths = filteredByTime.map(eq => eq.depth).filter(d => d > 0);

    const avgMag = magnitudes.length > 0 ? magnitudes.reduce((s, m) => s + m, 0) / magnitudes.length : 0;
    const maxMag = magnitudes.length > 0 ? Math.max(...magnitudes) : 0;
    const avgDepth = depths.length > 0 ? depths.reduce((s, d) => s + d, 0) / depths.length : 0;

    setStatistics({
      total: filteredByTime.length,
      averageMagnitude: Math.round(avgMag * 10) / 10,
      maxMagnitude: Math.round(maxMag * 10) / 10,
      averageDepth: Math.round(avgDepth),
      last24Hours: last24hCount,
      significantCount,
      major: majorCount,
      tsunamiAlertsCount: tsunamiCount,
      sourceBreakdown: {
        usgs: usgsCount,
        emsc: emscCount,
        gdacs: gdacsCount
      }
    });

    setEarthquakes(filteredByTime);
  }, [usgsData, emscData, gdacsData, timeWindow, feedSource]);

  return {
    earthquakes,
    stats: statistics,
    isLoading: isUsgsLoading || isEmscLoading || isGdacsLoading,
    error: null,
    refetch: () => {
      refetchUsgs();
      refetchEmsc();
      refetchGdacs();
    }
  };
};
