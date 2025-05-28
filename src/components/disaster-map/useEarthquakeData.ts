
import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Earthquake, EarthquakeStats } from './types';

// Threshold for defining significant earthquakes
const SIGNIFICANT_MAGNITUDE_THRESHOLD = 5.0;
const SIGNIFICANT_RECENT_HOURS = 6;

export const useEarthquakeData = () => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [filteredEarthquakes, setFilteredEarthquakes] = useState<Earthquake[]>([]);
  const [magnitudeFilter, setMagnitudeFilter] = useState<number[]>([0]);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate earthquake statistics
  const statistics: EarthquakeStats = useMemo(() => {
    if (earthquakes.length === 0) {
      return {
        total: 0,
        averageMagnitude: 0,
        maxMagnitude: 0,
        last24Hours: 0,
        significantCount: 0
      };
    }

    const now = Date.now();
    const last24Hours = earthquakes.filter(eq => now - eq.time < 24 * 60 * 60 * 1000).length;
    const significantCount = earthquakes.filter(eq => eq.isSignificant).length;
    const totalMagnitude = earthquakes.reduce((sum, eq) => sum + eq.magnitude, 0);
    const maxMagnitude = Math.max(...earthquakes.map(eq => eq.magnitude));
    
    return {
      total: earthquakes.length,
      averageMagnitude: totalMagnitude / earthquakes.length,
      maxMagnitude,
      last24Hours,
      significantCount
    };
  }, [earthquakes]);

  // Fetch earthquake data from USGS API - Updated to use magnitude 2.5+ feed
  const fetchEarthquakeData = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      // Updated to use magnitude 2.5+ feed for better data quality
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch earthquake data: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform GeoJSON features to our Earthquake interface
      const now = Date.now();
      const transformedData: Earthquake[] = data.features.map((feature: any) => {
        const magnitude = feature.properties.mag;
        const time = feature.properties.time;
        
        // Determine if this is a significant earthquake (high magnitude or recent and moderate)
        const isRecent = now - time < SIGNIFICANT_RECENT_HOURS * 60 * 60 * 1000;
        const isSignificant = 
          magnitude >= SIGNIFICANT_MAGNITUDE_THRESHOLD || 
          (isRecent && magnitude >= SIGNIFICANT_MAGNITUDE_THRESHOLD - 0.5);

        return {
          id: feature.id,
          magnitude,
          location: feature.properties.place,
          time,
          // GeoJSON uses [longitude, latitude] format, but we need [latitude, longitude] for Leaflet
          coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          isSignificant
        };
      });
      
      setEarthquakes(transformedData);
      toast({
        title: "ข้อมูลอัพเดทแล้ว",
        description: `พบแผ่นดินไหวขนาด 2.5+ จำนวน ${transformedData.length} ครั้งในรอบ 24 ชั่วโมง`,
      });
    } catch (err) {
      console.error('Error fetching earthquake data:', err);
      setError('ไม่สามารถโหลดข้อมูลแผ่นดินไหวได้');
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแผ่นดินไหวได้",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter earthquakes based on magnitude and time
  useEffect(() => {
    let filtered = earthquakes;
    
    // Filter by magnitude
    if (magnitudeFilter[0] > 0) {
      filtered = filtered.filter(eq => eq.magnitude >= magnitudeFilter[0]);
    }
    
    // Filter by time
    const now = Date.now();
    switch (timeFilter) {
      case "1h":
        filtered = filtered.filter(eq => now - eq.time < 60 * 60 * 1000);
        break;
      case "6h":
        filtered = filtered.filter(eq => now - eq.time < 6 * 60 * 60 * 1000);
        break;
      case "24h":
        filtered = filtered.filter(eq => now - eq.time < 24 * 60 * 60 * 1000);
        break;
      case "7d":
        filtered = filtered.filter(eq => now - eq.time < 7 * 24 * 60 * 60 * 1000);
        break;
      // "all" case doesn't need filtering
    }
    
    setFilteredEarthquakes(filtered);
  }, [earthquakes, magnitudeFilter, timeFilter]);

  // Fetch data on hook initialization
  useEffect(() => {
    fetchEarthquakeData();
    // Optional: Set up interval to refresh data periodically
    // const intervalId = setInterval(fetchEarthquakeData, 30 * 60 * 1000); // every 30 minutes
    // return () => clearInterval(intervalId);
  }, []);

  return {
    earthquakes,
    filteredEarthquakes,
    magnitudeFilter,
    setMagnitudeFilter,
    timeFilter,
    setTimeFilter,
    refreshing,
    error,
    fetchEarthquakeData,
    statistics
  };
};
