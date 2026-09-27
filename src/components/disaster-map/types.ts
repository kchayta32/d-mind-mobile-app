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
  tsunamiAlert?: boolean;
  source?: 'USGS' | 'EMSC' | 'GDACS' | string;
  feltReports?: number;
  alertColor?: 'green' | 'yellow' | 'orange' | 'red' | string;
}

export interface EarthquakeStats {
  total: number;
  major: number;
  averageMagnitude: number;
  maxMagnitude: number;
  averageDepth: number;
  last24Hours: number;
  significantCount: number;
  tsunamiAlertsCount?: number;
  sourceBreakdown?: {
    usgs: number;
    emsc: number;
    gdacs: number;
  };
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
  latitude?: number;
  longitude?: number;
  name?: string;
  usAqi?: number;
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

export interface OpenMeteoRainStats {
  totalStations: number;
  activeRainStations: number;
  maxRainfall: number;
  avgTemperature: number;
  lastUpdated: string;
}

/**
 * 6 Core Thesis Disaster Types (thesis/06-บทที่-1.docx)
 * 1. Earthquake (แผ่นดินไหว) - 'earthquake'
 * 2. Flood (น้ำท่วม) - 'flood'
 * 3. Wildfire (ไฟป่า) - 'wildfire'
 * 4. Drought (ภัยแล้ง) - 'drought'
 * 5. Storm (พายุ) - 'storm'
 * 6. Air Pollution / PM2.5 (มลพิษอากาศ) - 'airpollution'
 */
export type ThesisDisasterType = 'earthquake' | 'flood' | 'wildfire' | 'drought' | 'storm' | 'airpollution';

export type DisasterType = ThesisDisasterType | 'heavyrain' | 'sinkhole';

// Storm & Tropical Cyclone Types
export interface StormTrackPoint {
  latitude: number;
  longitude: number;
  time: string;
  windSpeedKmH?: number;
  pressureHPa?: number;
}

export interface StormData {
  id: string;
  name: string;
  category: 'Depression' | 'Tropical Storm' | 'Cat 1' | 'Cat 2' | 'Cat 3' | 'Cat 4' | 'Cat 5' | 'Unknown';
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  windSpeedKmH: number;
  windSpeedKnots?: number;
  pressureHPa: number;
  movementSpeedKmH?: number;
  movementDirection?: string;
  alertLevel: 'Green' | 'Orange' | 'Red';
  affectedCountries?: string[];
  affectedPopulation?: number;
  updatedAt: string;
  source: 'NASA EONET' | 'GDACS' | 'JTWC' | string;
  trackHistory?: StormTrackPoint[];
  description?: string;
  link?: string;
}

export interface StormStats {
  totalActiveStorms: number;
  maxWindSpeedKmH: number;
  severeStormsCount: number; // Cat 3+
  tropicalStormsCount: number;
  mostSevereStorm?: string;
  alertBreakdown: {
    red: number;
    orange: number;
    green: number;
  };
  lastUpdated: string;
}

// Crowdsourced Flood Types
export interface CrowdsourcedFloodReport {
  id: string;
  lat: number;
  lng: number;
  locationName: string;
  waterLevel: 'ankle' | 'knee' | 'waist' | 'chest' | 'critical';
  waterLevelCm?: number;
  waterFlow?: 'calm' | 'flowing' | 'torrential';
  situation: string;
  imageUrl?: string;
  reporterName?: string;
  reporterPhone?: string;
  createdAt: string;
  verifiedBySatellite?: boolean;
  satelliteDistanceMeters?: number;
}

