
import { DisasterType } from '../types';
import { useEarthquakeData } from '../useEarthquakeData';
import { useRainSensorData } from '../useRainSensorData';
import { useGISTDAData } from '../useGISTDAData';
import { useAirPollutionData } from '../useAirPollutionData';
import { useRainViewerData } from '../useRainViewerData';
import { useDroughtData } from './useDroughtData';
import { useFloodStatistics, useFloodData } from './useFloodData';
import { useGISTDAFloodData } from './useGISTDAFloodData';
import { useOpenMeteoFloodData } from './useOpenMeteoFloodData';
import {
  EarthquakeStats,
  RainSensorStats,
  AirPollutionStats,
  RainViewerStats,

} from '../types';
import { WildfireStats } from '../useGISTDAData';
import { DroughtStats } from './useDroughtData';
import { FloodStats } from './useFloodData';
import { SinkholeStats } from '../../../hooks/useSinkholeData';

interface StatisticsWithRainViewer extends RainSensorStats {
  rainViewer?: RainViewerStats;
}

export const useDisasterMapData = (
  rainTimeFilter: string,
  wildfireTimeFilter: string,
  floodTimeFilter: string
) => {
  const { earthquakes, stats: earthquakeStats, isLoading: isLoadingEarthquakes } = useEarthquakeData();
  const { sensors: rainSensors, stats: rainStats, isLoading: isLoadingRain } = useRainSensorData(rainTimeFilter);
  const { hotspots, stats: wildfireStats, isLoading: isLoadingWildfire } = useGISTDAData(wildfireTimeFilter as any);
  const { stations: airStations, stats: airStats, isLoading: isLoadingAir } = useAirPollutionData();
  const { rainData, isLoading: isLoadingRainViewer } = useRainViewerData();
  const { stats: droughtStats, isLoading: isLoadingDrought } = useDroughtData();
  const { data: gistdaFloodData, isLoading: isLoadingGISTDAFlood } = useGISTDAFloodData(floodTimeFilter as any);
  const { data: floodStats, isLoading: isLoadingFlood } = useFloodStatistics();
  const { data: floodDataPoints, isLoading: isLoadingOpenMeteoFlood } = useOpenMeteoFloodData();

  // Enhanced rain stats with RainViewer data
  const enhancedRainStats = rainData ? {
    ...rainStats,
    rainViewer: {
      lastUpdated: new Date().toISOString(),
      totalFrames: (rainData.radar?.past?.length || 0) + (rainData.radar?.nowcast?.length || 0),
      pastFrames: rainData.radar?.past?.length || 0,
      futureFrames: rainData.radar?.nowcast?.length || 0
    }
  } : rainStats;

  // Get current stats and loading state
  const getCurrentStats = (selectedType: DisasterType): EarthquakeStats | StatisticsWithRainViewer | WildfireStats | AirPollutionStats | DroughtStats | FloodStats | SinkholeStats | null => {
    switch (selectedType) {
      case 'earthquake': return earthquakeStats;
      case 'heavyrain': return enhancedRainStats;

      case 'wildfire': return wildfireStats;
      case 'airpollution': return airStats;
      case 'drought': return droughtStats;
      case 'flood': return floodStats;
      case 'sinkhole': return null; // Will be handled by component directly
      default: return null;
    }
  };

  const getCurrentLoading = (selectedType: DisasterType) => {
    switch (selectedType) {
      case 'earthquake': return isLoadingEarthquakes;
      case 'heavyrain': return isLoadingRain || isLoadingRainViewer;

      case 'wildfire': return isLoadingWildfire;
      case 'airpollution': return isLoadingAir;
      case 'drought': return isLoadingDrought;
      case 'flood': return isLoadingFlood || isLoadingOpenMeteoFlood || isLoadingGISTDAFlood;
      case 'sinkhole': return false;
      default: return false;
    }
  };

  return {
    earthquakes,
    rainSensors,
    hotspots,
    airStations,
    rainData,
    gistdaFloodFeatures: gistdaFloodData?.features || [],
    floodDataPoints: floodDataPoints || [],

    wildfireStats,
    airStats,
    droughtStats,
    floodStats,
    getCurrentStats,
    getCurrentLoading,
  };
};
