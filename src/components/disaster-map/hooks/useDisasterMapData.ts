
import { DisasterType } from '../DisasterMap';
import { useEarthquakeData } from '../useEarthquakeData';
import { useRainSensorData } from '../useRainSensorData';
import { useGISTDAData } from '../useGISTDAData';
import { useAirPollutionData } from '../useAirPollutionData';
import { useRainViewerData } from '../useRainViewerData';
import { useDroughtData } from './useDroughtData';
import { useFloodStatistics } from './useFloodData';
import { useOpenMeteoFloodData } from './useOpenMeteoFloodData';
import { useOpenMeteoRainData } from './useOpenMeteoRainData';
import { 
  EarthquakeStats, 
  RainSensorStats, 
  AirPollutionStats,
  RainViewerStats,
  OpenMeteoRainStats
} from '../types';
import { WildfireStats } from '../useGISTDAData';
import { DroughtStats } from './useDroughtData';
import { FloodStats } from './useFloodData';

interface StatisticsWithRainViewer extends RainSensorStats {
  rainViewer?: RainViewerStats;
}

export const useDisasterMapData = (
  rainTimeFilter: string,
  wildfireTimeFilter: string
) => {
  const { earthquakes, stats: earthquakeStats, isLoading: isLoadingEarthquakes } = useEarthquakeData();
  const { sensors: rainSensors, stats: rainStats, isLoading: isLoadingRain } = useRainSensorData(rainTimeFilter);
  const { hotspots, stats: wildfireStats, isLoading: isLoadingWildfire } = useGISTDAData(wildfireTimeFilter as any);
  const { stations: airStations, stats: airStats, isLoading: isLoadingAir } = useAirPollutionData();
  const { rainData, isLoading: isLoadingRainViewer } = useRainViewerData();
  const { stats: droughtStats, isLoading: isLoadingDrought } = useDroughtData();
  const { data: floodStats, isLoading: isLoadingFlood } = useFloodStatistics();
  const { data: floodDataPoints, isLoading: isLoadingOpenMeteoFlood } = useOpenMeteoFloodData();
  const { data: openMeteoRainData, isLoading: isLoadingOpenMeteoRain } = useOpenMeteoRainData();

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
  const getCurrentStats = (selectedType: DisasterType): EarthquakeStats | StatisticsWithRainViewer | WildfireStats | AirPollutionStats | DroughtStats | FloodStats | OpenMeteoRainStats | null => {
    switch (selectedType) {
      case 'earthquake': return earthquakeStats;
      case 'heavyrain': return enhancedRainStats;
      case 'openmeteorain': {
        const openMeteoStats: OpenMeteoRainStats = {
          totalStations: openMeteoRainData?.length || 0,
          activeRainStations: openMeteoRainData?.filter(d => d.weatherData.current.rain > 0).length || 0,
          maxRainfall: Math.max(...(openMeteoRainData?.map(d => d.weatherData.current.rain) || [0])),
          avgTemperature: openMeteoRainData?.reduce((sum, d) => sum + d.weatherData.current.temperature2m, 0) / (openMeteoRainData?.length || 1) || 0,
          lastUpdated: openMeteoRainData?.[0]?.weatherData.current.time.toISOString() || new Date().toISOString()
        };
        return openMeteoStats;
      }
      case 'wildfire': return wildfireStats;
      case 'airpollution': return airStats;
      case 'drought': return droughtStats;
      case 'flood': return floodStats;
      default: return null;
    }
  };

  const getCurrentLoading = (selectedType: DisasterType) => {
    switch (selectedType) {
      case 'earthquake': return isLoadingEarthquakes;
      case 'heavyrain': return isLoadingRain || isLoadingRainViewer;
      case 'openmeteorain': return isLoadingOpenMeteoRain;
      case 'wildfire': return isLoadingWildfire;
      case 'airpollution': return isLoadingAir;
      case 'drought': return isLoadingDrought;
      case 'flood': return isLoadingFlood || isLoadingOpenMeteoFlood;
      default: return false;
    }
  };

  return {
    earthquakes,
    rainSensors,
    hotspots,
    airStations,
    rainData,
    floodDataPoints: floodDataPoints || [],
    openMeteoRainData: openMeteoRainData || [],
    wildfireStats,
    airStats,
    droughtStats,
    floodStats,
    getCurrentStats,
    getCurrentLoading,
  };
};
