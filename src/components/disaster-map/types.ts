
export interface Earthquake {
  id: string;
  magnitude: number;
  location: string;
  depth: number;
  time: string;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  place?: string;
  url?: string;
  isSignificant?: boolean;
}

export interface EarthquakeStats {
  total: number;
  major: number;
  averageMagnitude: number;
  maxMagnitude: number;
  averageDepth: number;
  last24Hours: number;
  significantCount: number;
}

export interface RainSensor {
  id: number;
  coordinates?: [number, number];
  latitude?: number;
  longitude?: number;
  humidity?: number;
  is_raining?: boolean;
  inserted_at?: string;
  created_at?: string;
}

export interface RainSensorStats {
  total: number;
  activeRaining: number;
  averageHumidity: number;
  maxHumidity: number;
  last24Hours: number;
}

export interface RainViewerStats {
  lastUpdated: string;
  totalFrames: number;
  pastFrames: number;
  futureFrames: number;
}

export interface AirPollutionData {
  id: string;
  lat: number;
  lng: number;
  pm25?: number;
  pm10?: number;
  o3?: number;
  co?: number;
  no2?: number;
  so2?: number;
  aod443?: number;
  ssa443?: number;
  no2trop?: number;
  o3total?: number;
  uvai?: number;
  timestamp: string;
  stationName?: string;
  province?: string;
  district?: string;
  subdistrict?: string;
}

export interface AirPollutionStats {
  totalStations: number;
  averagePM25: number;
  maxPM25: number;
  unhealthyStations: number;
  last24Hours: number;
}
