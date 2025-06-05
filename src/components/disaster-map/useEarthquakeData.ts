
import { useState, useEffect } from 'react';
import { Earthquake, EarthquakeStats } from './types';

export const useEarthquakeData = () => {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [statistics, setStatistics] = useState<EarthquakeStats>({
    total: 0,
    averageMagnitude: 0,
    maxMagnitude: 0,
    averageDepth: 0,
    last24Hours: 0,
    significantCount: 0,
    major: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEarthquakeData = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch earthquake data');
      }
      
      const data = await response.json();
      
      const transformedEarthquakes: Earthquake[] = data.features.map((feature: any) => ({
        id: feature.id,
        magnitude: feature.properties.mag || 0,
        latitude: feature.geometry.coordinates[1] || 0,
        longitude: feature.geometry.coordinates[0] || 0,
        depth: feature.geometry.coordinates[2] || 0,
        time: new Date(feature.properties.time).toISOString(),
        location: feature.properties.place || 'Unknown location',
        isSignificant: (feature.properties.mag || 0) >= 2.5
      }));

      // Calculate statistics
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentEarthquakes = transformedEarthquakes.filter(eq => 
        new Date(eq.time) >= last24Hours
      );
      
      const significantEarthquakes = transformedEarthquakes.filter(eq => 
        eq.isSignificant
      );

      const majorEarthquakes = transformedEarthquakes.filter(eq => 
        eq.magnitude >= 6.0
      );
      
      const magnitudes = transformedEarthquakes
        .map(eq => eq.magnitude)
        .filter(mag => typeof mag === 'number' && mag > 0);
      
      const depths = transformedEarthquakes
        .map(eq => eq.depth)
        .filter(depth => typeof depth === 'number' && depth > 0);
      
      const avgMagnitude = magnitudes.length > 0 
        ? magnitudes.reduce((sum, mag) => sum + mag, 0) / magnitudes.length 
        : 0;
      
      const avgDepth = depths.length > 0 
        ? depths.reduce((sum, depth) => sum + depth, 0) / depths.length 
        : 0;
      
      const maxMagnitude = magnitudes.length > 0 
        ? Math.max(...magnitudes) 
        : 0;

      setStatistics({
        total: transformedEarthquakes.length,
        averageMagnitude: Math.round(avgMagnitude * 10) / 10,
        maxMagnitude: Math.round(maxMagnitude * 10) / 10,
        averageDepth: Math.round(avgDepth),
        last24Hours: recentEarthquakes.length,
        significantCount: significantEarthquakes.length,
        major: majorEarthquakes.length
      });

      setEarthquakes(transformedEarthquakes);
      
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarthquakeData();
    
    const interval = setInterval(fetchEarthquakeData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    earthquakes,
    stats: statistics,
    isLoading: refreshing,
    error,
    refetch: fetchEarthquakeData
  };
};
