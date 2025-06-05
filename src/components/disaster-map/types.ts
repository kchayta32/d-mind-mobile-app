export interface Earthquake {
  id: string;
  magnitude: number;
  latitude: number;
  longitude: number;
  depth: number;
  time: string;
  location?: string;
  coordinates: [number, number];
  isSignificant?: boolean;
}

export interface EarthquakeStats {
  total: number;
  last24Hours: number;
  averageMagnitude: number;
  maxMagnitude: number;
  averageDepth: number;
  significantCount: number;
}

export interface RainSensor {
  id: number;
  humidity: number | null;
  is_raining: boolean | null;
  created_at: string | null;
  inserted_at: string | null;
  latitude: number | null;
  longitude: number | null;
  coordinates: [number, number];
}

export interface RainSensorStats {
  total: number;
  activeRaining: number;
  averageHumidity: number;
  maxHumidity: number;
  last24Hours: number;
}

export interface GISTDAStats {
  totalHotspots: number;
  modisCount: number;
  viirsCount: number;
  highConfidenceCount: number;
  averageConfidence: number;
  last24Hours: number;
}

export interface RainViewerStats {
  pastFrames: number;
  futureFrames: number;
  latestTime: string;
  oldestTime: string;
}

export interface AirPollutionData {
  id: string;
  lat: number;
  lng: number;
  pm25?: number;
  aod443?: number;
  ssa443?: number;
  no2trop?: number;
  so2?: number;
  o3total?: number;
  uvai?: number;
  timestamp: string;
}

export interface AirPollutionStats {
  totalStations: number;
  averagePM25: number;
  maxPM25: number;
  unhealthyStations: number;
  last24Hours: number;
}
